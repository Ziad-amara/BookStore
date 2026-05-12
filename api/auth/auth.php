<?php
// /api/auth/{register|login|me|logout}
$db = getDB();

switch (true) {

    // POST /api/auth/register
    case $method === 'POST' && $sub === 'register':
        $body = getBody();
        validate($body, [
            'name'     => 'required',
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $name     = trim($body['name']);
        $email    = strtolower(trim($body['email']));
        $password = password_hash($body['password'], PASSWORD_BCRYPT);
        $role     = 'user'; // default

        // Check duplicate
        $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->bind_param('s', $email);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            error('Email already registered.', 409);
        }

        $stmt = $db->prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
        $stmt->bind_param('ssss', $name, $email, $password, $role);
        $stmt->execute();
        $userId = $db->insert_id;

        $token = generateToken(['id' => $userId, 'email' => $email, 'role' => $role]);
        success([
            'token' => $token,
            'user'  => ['id' => $userId, 'name' => $name, 'email' => $email, 'role' => $role]
        ], 'Registered successfully.', 201);
        break;

    // POST /api/auth/login
    case $method === 'POST' && $sub === 'login':
        $body = getBody();
        validate($body, [
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $email = strtolower(trim($body['email']));
        $stmt  = $db->prepare('SELECT id, name, email, password, role FROM users WHERE email = ?');
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();

        if (!$user || !password_verify($body['password'], $user['password'])) {
            error('Invalid email or password.', 401);
        }

        $token = generateToken(['id' => $user['id'], 'email' => $user['email'], 'role' => $user['role']]);
        unset($user['password']);
        success(['token' => $token, 'user' => $user], 'Login successful.');
        break;

    // GET /api/auth/me  — get current user profile
    case $method === 'GET' && $sub === 'me':
        $auth = requireAuth();
        $stmt = $db->prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?');
        $stmt->bind_param('i', $auth['id']);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();
        if (!$user) error('User not found.', 404);
        success($user);
        break;

    // PUT /api/auth/me  — update profile
    case $method === 'PUT' && $sub === 'me':
        $auth = requireAuth();
        $body = getBody();
        $name = trim($body['name'] ?? '');
        if (empty($name)) error('Name is required.');

        $stmt = $db->prepare('UPDATE users SET name = ? WHERE id = ?');
        $stmt->bind_param('si', $name, $auth['id']);
        $stmt->execute();
        success(['name' => $name], 'Profile updated.');
        break;

    // POST /api/auth/change-password
    case $method === 'POST' && $sub === 'change-password':
        $auth = requireAuth();
        $body = getBody();
        validate($body, ['old_password' => 'required', 'new_password' => 'required']);

        $stmt = $db->prepare('SELECT password FROM users WHERE id = ?');
        $stmt->bind_param('i', $auth['id']);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();

        if (!password_verify($body['old_password'], $row['password'])) {
            error('Old password is incorrect.', 401);
        }
        $hash = password_hash($body['new_password'], PASSWORD_BCRYPT);
        $stmt = $db->prepare('UPDATE users SET password = ? WHERE id = ?');
        $stmt->bind_param('si', $hash, $auth['id']);
        $stmt->execute();
        success([], 'Password changed successfully.');
        break;

    default:
        error('Auth endpoint not found.', 404);
}
