<?php
error_log("SALES API HIT patient_id=" . (json_decode(file_get_contents('php://input'), true)['patient_id'] ?? 'NOT SET'));
require_once '../../config/database.php';
require_once '../../config/helpers.php';
require_once '../../config/sms.php';
setCORS();
requireAuth();

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

if ($method === 'GET') {
    if ($id) {
        $stmt = $db->prepare('SELECT * FROM sales WHERE id=?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $sale = $stmt->get_result()->fetch_assoc();
        if (!$sale) error('Sale not found.', 404);
        $stmt2 = $db->prepare('SELECT * FROM sale_items WHERE sale_id=?');
        $stmt2->bind_param('i', $id);
        $stmt2->execute();
        $sale['items'] = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);
        success($sale);
    }

    $from  = $_GET['from'] ?? '';
    $to    = $_GET['to'] ?? '';
    $pay   = $_GET['payment'] ?? '';
    $sql   = 'SELECT s.*, u.name AS cashier FROM sales s LEFT JOIN users u ON s.cashier_id = u.id WHERE 1=1';
    $params = []; $types = '';
    if ($from)  { $sql .= ' AND DATE(s.created_at) >= ?'; $params[] = $from; $types .= 's'; }
    if ($to)    { $sql .= ' AND DATE(s.created_at) <= ?'; $params[] = $to;   $types .= 's'; }
    if ($pay)   { $sql .= ' AND s.payment_method = ?';    $params[] = $pay;  $types .= 's'; }
    $sql .= ' ORDER BY s.created_at DESC';
    $stmt = $db->prepare($sql);
    if ($params) $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $sales = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    foreach ($sales as &$sale) {
        $stmt2 = $db->prepare('SELECT * FROM sale_items WHERE sale_id=?');
        $stmt2->bind_param('i', $sale['id']);
        $stmt2->execute();
        $sale['items'] = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);
    }
    success($sales);
}

if ($method === 'POST') {
    $b              = getBody();
    $customer       = trim($b['customer_name'] ?? 'Walk-in Customer');
    $payment_method = $b['payment_method'] ?? 'Cash';
    $cashier_id     = (int)($b['cashier_id'] ?? 1);
    $patient_id     = (int)($b['patient_id'] ?? 0);
    $items          = $b['items'] ?? [];

    // Log incoming data immediately
    smsLog([
        'step'       => 'sale_received',
        'customer'   => $customer,
        'patient_id' => $patient_id,
        'items'      => count($items),
    ]);

    if (empty($items)) error('No items in sale.');

    $subtotal = array_sum(array_map(fn($i) => $i['unit_price'] * $i['quantity'], $items));
    $tax      = round($subtotal * 0.16, 2);
    $total    = $subtotal + $tax;
    $sale_number = 'S-' . strtoupper(substr(uniqid(), -6));

    $db->begin_transaction();
    try {
        $stmt = $db->prepare('INSERT INTO sales (sale_number,customer_name,subtotal,tax,total,payment_method,cashier_id) VALUES (?,?,?,?,?,?,?)');
        $stmt->bind_param('ssdddsi', $sale_number, $customer, $subtotal, $tax, $total, $payment_method, $cashier_id);
        $stmt->execute();
        $sale_id = $db->insert_id;

        foreach ($items as $item) {
            $med_id   = (int)($item['medicine_id'] ?? 0);
            $med_name = trim($item['medicine_name'] ?? '');
            $qty      = (int)($item['quantity'] ?? 1);
            $unit_p   = (float)($item['unit_price'] ?? 0);
            $total_p  = $unit_p * $qty;
            $stmt2 = $db->prepare('INSERT INTO sale_items (sale_id,medicine_id,medicine_name,quantity,unit_price,total_price) VALUES (?,?,?,?,?,?)');
            $stmt2->bind_param('iisidd', $sale_id, $med_id, $med_name, $qty, $unit_p, $total_p);
            $stmt2->execute();
            if ($med_id) {
                $stmt3 = $db->prepare('UPDATE medicines SET stock = stock - ? WHERE id = ? AND stock >= ?');
                $stmt3->bind_param('iii', $qty, $med_id, $qty);
                $stmt3->execute();
            }
        }

        $db->commit();

        // ── SMS: Send purchase confirmation ──
        if ($patient_id > 0) {
            $phone = getPatientPhone($db, $patient_id);
            smsLog(['step' => 'patient_lookup', 'patient_id' => $patient_id, 'phone' => $phone ?? 'NOT FOUND']);

            if ($phone) {
                $item_lines = [];
                foreach (array_slice($items, 0, 3) as $item) {
                    $item_lines[] = '- ' . $item['medicine_name'] . ' x' . $item['quantity'];
                }
                if (count($items) > 3) {
                    $item_lines[] = '- and ' . (count($items) - 3) . ' more item(s)';
                }
                $message = "Dear {$customer},\n"
                         . "Thank you for your purchase at PharmaSys.\n\n"
                         . "Receipt: {$sale_number}\n"
                         . "Items:\n" . implode("\n", $item_lines) . "\n\n"
                         . "Total: KES " . number_format($total, 2) . "\n"
                         . "Payment: {$payment_method}\n\n"
                         . "Get well soon!";
                sendSMS($phone, $message);
            }
        } else {
            smsLog(['step' => 'sms_skipped', 'reason' => 'patient_id is 0 — no patient selected']);
        }
        // ─────────────────────────────────────

        success(['id' => $sale_id, 'sale_number' => $sale_number, 'total' => $total], 'Sale recorded successfully.', 201);

    } catch (Exception $e) {
        $db->rollback();
        error('Sale failed: ' . $e->getMessage());
    }
}

error('Method not allowed.', 405);