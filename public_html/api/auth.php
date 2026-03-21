<?php
// ================================================
// MEXIMCO API — Authentication
// ================================================
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = $_GET['action'] ?? '';

if ($method === 'POST' && $path === 'login') {
    $body = getBody();
    $email = $body['email'] ?? '';
    $password = $body['password'] ?? '';

    if ($email === ADMIN_EMAIL && $password === ADMIN_PASSWORD) {
        $token = createToken(['email' => $email, 'role' => 'admin']);
        echo json_encode(['token' => $token, 'email' => $email]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
}

elseif ($method === 'GET' && $path === 'verify') {
    $user = requireAuth();
    echo json_encode(['valid' => true, 'user' => $user]);
}

else {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
}
