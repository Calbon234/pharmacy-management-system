<?php
require_once '../../config/database.php';
require_once '../../config/helpers.php';
setCORS();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $body     = getBody();
    $email    = trim($body['email'] ?? '');
    $password = trim($body['password'] ?? '');

    if (!$email || !$password) error('Email and password are required.');

    $db   = getDB();
    $stmt = $db->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();

    if (!$user || !password_verify($password, $user['password'])) {
        error('Invalid email or password.', 401);
    }

    $token = bin2hex(random_bytes(32));

    success([
        'token' => $token,
        'user'  => [
            'id'    => $user['id'],
            'name'  => $user['name'],
            'email' => $user['email'],
            'role'  => $user['role'],
            'photo' => $user['photo'] ?? null,
        ]
    ], 'Login successful');
}

error('Method not allowed.', 405);