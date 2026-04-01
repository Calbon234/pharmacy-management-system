<?php
require_once '../../config/database.php';
require_once '../../config/helpers.php';
require_once '../../config/sms.php';   // ← SMS helper
setCORS();
requireAuth();

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

if ($method === 'GET') {
    if ($id) {
        $stmt = $db->prepare('SELECT p.*, pt.name AS patient_name FROM prescriptions p LEFT JOIN patients pt ON p.patient_id = pt.id WHERE p.id=?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $rx = $stmt->get_result()->fetch_assoc();
        if (!$rx) error('Prescription not found.', 404);
        $stmt2 = $db->prepare('SELECT * FROM prescription_items WHERE prescription_id=?');
        $stmt2->bind_param('i', $id);
        $stmt2->execute();
        $rx['items'] = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);
        success($rx);
    }

    $status = $_GET['status'] ?? '';
    $sql = 'SELECT p.*, pt.name AS patient_name FROM prescriptions p LEFT JOIN patients pt ON p.patient_id = pt.id WHERE 1=1';
    $params = []; $types = '';
    if ($status) { $sql .= ' AND p.status = ?'; $params[] = $status; $types .= 's'; }
    $sql .= ' ORDER BY p.created_at DESC';

    $stmt = $db->prepare($sql);
    if ($params) $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $rxs = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    foreach ($rxs as &$rx) {
        $stmt2 = $db->prepare('SELECT * FROM prescription_items WHERE prescription_id=?');
        $stmt2->bind_param('i', $rx['id']);
        $stmt2->execute();
        $rx['items'] = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);
    }
    success($rxs);
}

if ($method === 'POST') {
    $b           = getBody();
    $patient_id  = (int)($b['patient_id'] ?? 0);
    $doctor_name = trim($b['doctor_name'] ?? '');
    $notes       = trim($b['notes'] ?? '');
    $items       = $b['items'] ?? [];

    if (!$patient_id) error('Patient is required.');
    if (empty($items)) error('At least one medicine is required.');

    $res = $db->query('SELECT COUNT(*) AS cnt FROM prescriptions');
    $cnt = $res->fetch_assoc()['cnt'] + 1;
    $rx_number = 'RX-' . str_pad($cnt, 4, '0', STR_PAD_LEFT);

    $db->begin_transaction();
    try {
        $stmt = $db->prepare('INSERT INTO prescriptions (rx_number,patient_id,doctor_name,notes) VALUES (?,?,?,?)');
        $stmt->bind_param('siss', $rx_number, $patient_id, $doctor_name, $notes);
        $stmt->execute();
        $rx_id = $db->insert_id;

        foreach ($items as $item) {
            $med_id   = (int)($item['medicine_id'] ?? 0);
            $med_name = trim($item['medicine_name'] ?? '');
            $qty      = (int)($item['quantity'] ?? 1);
            $dosage   = trim($item['dosage'] ?? '');
            $stmt2 = $db->prepare('INSERT INTO prescription_items (prescription_id,medicine_id,medicine_name,quantity,dosage) VALUES (?,?,?,?,?)');
            $stmt2->bind_param('iisis', $rx_id, $med_id, $med_name, $qty, $dosage);
            $stmt2->execute();
        }
        $db->commit();
        success(['id' => $rx_id, 'rx_number' => $rx_number], 'Prescription created.', 201);
    } catch (Exception $e) {
        $db->rollback();
        error('Failed: ' . $e->getMessage());
    }
}

if ($method === 'PUT') {
    if (!$id) error('Prescription ID required.');
    $b      = getBody();
    $status = $b['status'] ?? 'Pending';

    // Fetch prescription + patient before updating
    $stmt = $db->prepare('
        SELECT p.rx_number, p.patient_id, pt.name AS patient_name, pt.phone
        FROM prescriptions p
        LEFT JOIN patients pt ON p.patient_id = pt.id
        WHERE p.id = ?
    ');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $rx = $stmt->get_result()->fetch_assoc();

    // Update status
    $stmt2 = $db->prepare('UPDATE prescriptions SET status=? WHERE id=?');
    $stmt2->bind_param('si', $status, $id);
    if (!$stmt2->execute()) error('Failed to update prescription.');

    // ── SMS: Notify patient when prescription is fulfilled ────────
    if ($status === 'Fulfilled' && $rx && !empty($rx['phone'])) {
        // Get prescription items
        $stmt3 = $db->prepare('SELECT medicine_name, quantity, dosage FROM prescription_items WHERE prescription_id=?');
        $stmt3->bind_param('i', $id);
        $stmt3->execute();
        $items = $stmt3->get_result()->fetch_all(MYSQLI_ASSOC);

        $item_lines = [];
        foreach ($items as $item) {
            $line = '- ' . $item['medicine_name'] . ' x' . $item['quantity'];
            if (!empty($item['dosage'])) $line .= ' (' . $item['dosage'] . ')';
            $item_lines[] = $line;
        }
        $items_text = implode("\n", $item_lines);

        $message = "Dear {$rx['patient_name']},\n"
                 . "Your prescription {$rx['rx_number']} is ready for pickup at PharmaSys.\n\n"
                 . "Medicines:\n{$items_text}\n\n"
                 . "Please present this message or your ID when collecting.\n"
                 . "Thank you!";

        sendSMS($rx['phone'], $message);
    }
    // ─────────────────────────────────────────────────────────────

    success([], 'Prescription updated.');
}

if ($method === 'DELETE') {
    if (!$id) error('Prescription ID required.');
    $stmt = $db->prepare('DELETE FROM prescriptions WHERE id=?');
    $stmt->bind_param('i', $id);
    if (!$stmt->execute()) error('Failed to delete.');
    success([], 'Prescription deleted.');
}

error('Method not allowed.', 405);