<?php
require_once '../../config/database.php';
require_once '../../config/helpers.php';
setCORS();
requireAuth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $b     = getBody();
    $photo = $b['photo'] ?? '';
    $id    = (int)($b['id'] ?? 0);

    if (!$id) error('User ID required.');

    $db   = getDB();
    $stmt = $db->prepare('UPDATE users SET photo = ? WHERE id = ?');
    $stmt->bind_param('si', $photo, $id);
    if (!$stmt->execute()) error('Failed to update photo.');
    success([], 'Photo updated.');
}

error('Method not allowed.', 405);