<?php
require_once '../../config/database.php';
require_once '../../config/helpers.php';
setCORS();
requireAuth();

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

// GET
if ($method === 'GET') {
    if ($id) {
        $stmt = $db->prepare('SELECT m.*, s.name AS supplier_name FROM medicines m LEFT JOIN suppliers s ON m.supplier_id = s.id WHERE m.id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $medicine = $stmt->get_result()->fetch_assoc();
        if (!$medicine) error('Medicine not found.', 404);
        success($medicine);
    }
    $search   = $_GET['search'] ?? '';
    $category = $_GET['category'] ?? '';
    $sql = 'SELECT m.*, s.name AS supplier_name FROM medicines m LEFT JOIN suppliers s ON m.supplier_id = s.id WHERE 1=1';
    $params = []; $types = '';
    if ($search) { $sql .= ' AND m.name LIKE ?'; $params[] = "%$search%"; $types .= 's'; }
    if ($category) { $sql .= ' AND m.category = ?'; $params[] = $category; $types .= 's'; }
    $sql .= ' ORDER BY m.name ASC';
    $stmt = $db->prepare($sql);
    if ($params) $stmt->bind_param($types, ...$params);
    $stmt->execute();
    success($stmt->get_result()->fetch_all(MYSQLI_ASSOC));
}

// POST
if ($method === 'POST') {
    $b = getBody();
    $name        = trim($b['name'] ?? '');
    $category    = trim($b['category'] ?? '');
    $supplier_id = !empty($b['supplier_id']) ? (int)$b['supplier_id'] : null;
    $price       = (float)($b['price'] ?? 0);
    $stock       = (int)($b['stock'] ?? 0);
    $min_stock   = (int)($b['min_stock'] ?? 20);
    $expiry_date = !empty($b['expiry_date']) ? $b['expiry_date'] : null;
    $description = trim($b['description'] ?? '');

    if (!$name) error('Medicine name is required.');

    $stmt = $db->prepare('INSERT INTO medicines (name, category, supplier_id, price, stock, min_stock, expiry_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->bind_param('ssidiiss', $name, $category, $supplier_id, $price, $stock, $min_stock, $expiry_date, $description);

    if (!$stmt->execute()) error('Failed to add medicine: ' . $db->error);
    success(['id' => $db->insert_id], 'Medicine added successfully.', 201);
}

// PUT
if ($method === 'PUT') {
    if (!$id) error('Medicine ID is required.');
    $b = getBody();
    $name        = trim($b['name'] ?? '');
    $category    = trim($b['category'] ?? '');
    $supplier_id = !empty($b['supplier_id']) ? (int)$b['supplier_id'] : null;
    $price       = (float)($b['price'] ?? 0);
    $stock       = (int)($b['stock'] ?? 0);
    $min_stock   = (int)($b['min_stock'] ?? 20);
    $expiry_date = !empty($b['expiry_date']) ? $b['expiry_date'] : null;
    $description = trim($b['description'] ?? '');

    if (!$name) error('Medicine name is required.');

    $stmt = $db->prepare('UPDATE medicines SET name=?, category=?, supplier_id=?, price=?, stock=?, min_stock=?, expiry_date=?, description=? WHERE id=?');
    $stmt->bind_param('ssidiissi', $name, $category, $supplier_id, $price, $stock, $min_stock, $expiry_date, $description, $id);
    if (!$stmt->execute()) error('Failed to update: ' . $db->error);
    success([], 'Medicine updated successfully.');
}

// DELETE
if ($method === 'DELETE') {
    if (!$id) error('Medicine ID is required.');
    $stmt = $db->prepare('DELETE FROM medicines WHERE id = ?');
    $stmt->bind_param('i', $id);
    if (!$stmt->execute()) error('Failed to delete medicine.');
    success([], 'Medicine deleted successfully.');
}

error('Method not allowed.', 405);