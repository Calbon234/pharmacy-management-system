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
        $stmt = $db->prepare('SELECT s.*, COUNT(m.id) AS medicines FROM suppliers s LEFT JOIN medicines m ON m.supplier_id = s.id WHERE s.id = ? GROUP BY s.id');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $supplier = $stmt->get_result()->fetch_assoc();
        if (!$supplier) error('Supplier not found.', 404);
        success($supplier);
    }

    $search = $_GET['search'] ?? '';
    $status = $_GET['status'] ?? '';
    $sql = 'SELECT s.*, COUNT(m.id) AS medicines FROM suppliers s LEFT JOIN medicines m ON m.supplier_id = s.id WHERE 1=1';
    $params = []; $types = '';

    if ($search) { $sql .= ' AND (s.name LIKE ? OR s.email LIKE ?)'; $params[] = "%$search%"; $params[] = "%$search%"; $types .= 'ss'; }
    if ($status) { $sql .= ' AND s.status = ?'; $params[] = $status; $types .= 's'; }
    $sql .= ' GROUP BY s.id ORDER BY s.name ASC';

    $stmt = $db->prepare($sql);
    if ($params) $stmt->bind_param($types, ...$params);
    $stmt->execute();
    success($stmt->get_result()->fetch_all(MYSQLI_ASSOC));
}

if ($method === 'POST') {
    $b = getBody();
    $name    = trim($b['name'] ?? '');
    $phone   = trim($b['phone'] ?? '');
    $email   = trim($b['email'] ?? '');
    $address = trim($b['address'] ?? '');
    $status  = $b['status'] ?? 'Active';

    if (!$name) error('Supplier name is required.');

    $stmt = $db->prepare('INSERT INTO suppliers (name,phone,email,address,status) VALUES (?,?,?,?,?)');
    $stmt->bind_param('sssss', $name, $phone, $email, $address, $status);
    if (!$stmt->execute()) error('Failed to add supplier.');
    success(['id' => $db->insert_id], 'Supplier added successfully.', 201);
}

if ($method === 'PUT') {
    if (!$id) error('Supplier ID required.');
    $b = getBody();
    $name    = trim($b['name'] ?? '');
    $phone   = trim($b['phone'] ?? '');
    $email   = trim($b['email'] ?? '');
    $address = trim($b['address'] ?? '');
    $status  = $b['status'] ?? 'Active';

    if (!$name) error('Supplier name is required.');
    $stmt = $db->prepare('UPDATE suppliers SET name=?,phone=?,email=?,address=?,status=? WHERE id=?');
    $stmt->bind_param('sssssi', $name, $phone, $email, $address, $status, $id);
    if (!$stmt->execute()) error('Failed to update supplier.');
    success([], 'Supplier updated.');
}

if ($method === 'DELETE') {
    if (!$id) error('Supplier ID required.');
    $stmt = $db->prepare('DELETE FROM suppliers WHERE id=?');
    $stmt->bind_param('i', $id);
    if (!$stmt->execute()) error('Failed to delete supplier.');
    success([], 'Supplier deleted.');
}

error('Method not allowed.', 405);
