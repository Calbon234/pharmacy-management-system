<?php
require_once '../../config/database.php';
require_once '../../config/helpers.php';
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

        // Get items
        $stmt2 = $db->prepare('SELECT * FROM sale_items WHERE sale_id=?');
        $stmt2->bind_param('i', $id);
        $stmt2->execute();
        $sale['items'] = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);
        success($sale);
    }

    // List sales with optional filters
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

    // Attach items to each sale
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
    $items          = $b['items'] ?? [];

    if (empty($items)) error('No items in sale.');

    // Calculate totals
    $subtotal = array_sum(array_map(fn($i) => $i['unit_price'] * $i['quantity'], $items));
    $tax      = round($subtotal * 0.16, 2);
    $total    = $subtotal + $tax;

    // Generate sale number
    $sale_number = 'S-' . strtoupper(substr(uniqid(), -6));

    $db->begin_transaction();
    try {
        // Insert sale
        $stmt = $db->prepare('INSERT INTO sales (sale_number,customer_name,subtotal,tax,total,payment_method,cashier_id) VALUES (?,?,?,?,?,?,?)');
        $stmt->bind_param('ssdddsi', $sale_number, $customer, $subtotal, $tax, $total, $payment_method, $cashier_id);
        $stmt->execute();
        $sale_id = $db->insert_id;

        // Insert items + deduct stock
        foreach ($items as $item) {
            $med_id    = (int)($item['medicine_id'] ?? 0);
            $med_name  = trim($item['medicine_name'] ?? '');
            $qty       = (int)($item['quantity'] ?? 1);
            $unit_p    = (float)($item['unit_price'] ?? 0);
            $total_p   = $unit_p * $qty;

            $stmt2 = $db->prepare('INSERT INTO sale_items (sale_id,medicine_id,medicine_name,quantity,unit_price,total_price) VALUES (?,?,?,?,?,?)');
            $stmt2->bind_param('iisidd', $sale_id, $med_id, $med_name, $qty, $unit_p, $total_p);
            $stmt2->execute();

            // Deduct stock
            if ($med_id) {
                $stmt3 = $db->prepare('UPDATE medicines SET stock = stock - ? WHERE id = ? AND stock >= ?');
                $stmt3->bind_param('iii', $qty, $med_id, $qty);
                $stmt3->execute();
            }
        }

        $db->commit();
        success(['id' => $sale_id, 'sale_number' => $sale_number, 'total' => $total], 'Sale recorded successfully.', 201);

    } catch (Exception $e) {
        $db->rollback();
        error('Sale failed: ' . $e->getMessage());
    }
}

error('Method not allowed.', 405);
