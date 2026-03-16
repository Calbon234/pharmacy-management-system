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
        $stmt = $db->prepare('SELECT * FROM patients WHERE id=?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $patient = $stmt->get_result()->fetch_assoc();
        if (!$patient) error('Patient not found.', 404);
        success($patient);
    }
    $search = $_GET['search'] ?? '';
    $gender = $_GET['gender'] ?? '';
    $sql    = 'SELECT * FROM patients WHERE 1=1';
    $params = []; $types = '';

    if ($search) { $sql .= ' AND (name LIKE ? OR patient_no LIKE ?)'; $params[] = "%$search%"; $params[] = "%$search%"; $types .= 'ss'; }
    if ($gender) { $sql .= ' AND gender = ?'; $params[] = $gender; $types .= 's'; }
    $sql .= ' ORDER BY name ASC';

    $stmt = $db->prepare($sql);
    if ($params) $stmt->bind_param($types, ...$params);
    $stmt->execute();
    success($stmt->get_result()->fetch_all(MYSQLI_ASSOC));
}

if ($method === 'POST') {
    $b          = getBody();
    $name       = trim($b['name'] ?? '');
    $gender     = $b['gender'] ?? 'Male';
    $dob        = $b['dob'] ?? null;
    $phone      = trim($b['phone'] ?? '');
    $email      = trim($b['email'] ?? '');
    $blood_type = $b['blood_type'] ?? '';
    $conditions = $b['conditions'] ?? '';
    $allergies  = $b['allergies'] ?? '';

    if (!$name) error('Patient name is required.');

    // Auto-generate patient number
    $res = $db->query('SELECT COUNT(*) AS cnt FROM patients');
    $cnt = $res->fetch_assoc()['cnt'] + 1;
    $patient_no = 'PT-' . str_pad($cnt, 3, '0', STR_PAD_LEFT);

    $stmt = $db->prepare('INSERT INTO patients (patient_no,name,gender,dob,phone,email,blood_type,conditions,allergies) VALUES (?,?,?,?,?,?,?,?,?)');
    $stmt->bind_param('sssssssss', $patient_no, $name, $gender, $dob, $phone, $email, $blood_type, $conditions, $allergies);
    if (!$stmt->execute()) error('Failed to register patient.');
    success(['id' => $db->insert_id, 'patient_no' => $patient_no], 'Patient registered.', 201);
}

if ($method === 'PUT') {
    if (!$id) error('Patient ID required.');
    $b          = getBody();
    $name       = trim($b['name'] ?? '');
    $gender     = $b['gender'] ?? 'Male';
    $dob        = $b['dob'] ?? null;
    $phone      = trim($b['phone'] ?? '');
    $email      = trim($b['email'] ?? '');
    $blood_type = $b['blood_type'] ?? '';
    $conditions = $b['conditions'] ?? '';
    $allergies  = $b['allergies'] ?? '';

    if (!$name) error('Patient name is required.');
    $stmt = $db->prepare('UPDATE patients SET name=?,gender=?,dob=?,phone=?,email=?,blood_type=?,conditions=?,allergies=? WHERE id=?');
    $stmt->bind_param('ssssssssi', $name, $gender, $dob, $phone, $email, $blood_type, $conditions, $allergies, $id);
    if (!$stmt->execute()) error('Failed to update patient.');
    success([], 'Patient updated.');
}

if ($method === 'DELETE') {
    if (!$id) error('Patient ID required.');
    $stmt = $db->prepare('DELETE FROM patients WHERE id=?');
    $stmt->bind_param('i', $id);
    if (!$stmt->execute()) error('Failed to delete patient.');
    success([], 'Patient deleted.');
}

error('Method not allowed.', 405);
