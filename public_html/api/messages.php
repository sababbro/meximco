<?php
// ================================================
// MEXIMCO API — Messages (Contact Form)
// ================================================
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id = $_GET['id'] ?? null;

// PUBLIC: Submit a message from contact form
if ($method === 'POST' && !$action) {
    $body = getBody();
    $pdo = getDB();
    $stmt = $pdo->prepare('INSERT INTO messages (name, company, email, interest, message) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([
        $body['name'] ?? '',
        $body['company'] ?? '',
        $body['email'] ?? '',
        $body['interest'] ?? '',
        $body['message'] ?? ''
    ]);
    echo json_encode(['success' => true, 'message' => 'Message sent successfully!']);
}

// ADMIN: List all messages
elseif ($method === 'GET' && !$id) {
    requireAuth();
    $pdo = getDB();
    $stmt = $pdo->query('SELECT * FROM messages ORDER BY created_at DESC');
    echo json_encode($stmt->fetchAll());
}

// ADMIN: Update message status
elseif ($method === 'PATCH' && $id) {
    requireAuth();
    $body = getBody();
    $pdo = getDB();
    $stmt = $pdo->prepare('UPDATE messages SET status = ? WHERE id = ?');
    $stmt->execute([$body['status'] ?? 'read', $id]);
    echo json_encode(['success' => true]);
}

// ADMIN: Delete message
elseif ($method === 'DELETE' && $id) {
    requireAuth();
    $pdo = getDB();
    $stmt = $pdo->prepare('DELETE FROM messages WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
}

else {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
}
