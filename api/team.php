<?php
// ================================================
// MEXIMCO API — Team Members
// ================================================
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

// PUBLIC: List team members
if ($method === 'GET' && !$id) {
    $pdo = getDB();
    $stmt = $pdo->query('SELECT * FROM team_members ORDER BY order_index ASC');
    echo json_encode($stmt->fetchAll());
}

// ADMIN: Add team member
elseif ($method === 'POST' && !$id) {
    requireAuth();
    $pdo = getDB();
    $photo_url = handleUpload('photo', 'team');
    $cv_url = handleUpload('cv', 'team');

    $stmt = $pdo->prepare('INSERT INTO team_members (name, role, bio, photo_url, cv_url, order_index) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $_POST['name'] ?? '',
        $_POST['role'] ?? '',
        $_POST['bio'] ?? '',
        $photo_url,
        $cv_url,
        intval($_POST['order_index'] ?? 0)
    ]);
    $newId = $pdo->lastInsertId();
    $stmt = $pdo->prepare('SELECT * FROM team_members WHERE id = ?');
    $stmt->execute([$newId]);
    echo json_encode($stmt->fetch());
}

// ADMIN: Update team member
elseif ($method === 'POST' && $id && isset($_GET['_method']) && $_GET['_method'] === 'PUT') {
    requireAuth();
    $pdo = getDB();
    $photo_url = handleUpload('photo', 'team');
    $cv_url = handleUpload('cv', 'team');

    // Get existing values if no new upload
    if (!$photo_url || !$cv_url) {
        $stmt = $pdo->prepare('SELECT photo_url, cv_url FROM team_members WHERE id = ?');
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$photo_url) $photo_url = $existing['photo_url'];
        if (!$cv_url) $cv_url = $existing['cv_url'];
    }

    $stmt = $pdo->prepare('UPDATE team_members SET name=?, role=?, bio=?, photo_url=?, cv_url=?, order_index=? WHERE id=?');
    $stmt->execute([
        $_POST['name'], $_POST['role'], $_POST['bio'],
        $photo_url, $cv_url,
        intval($_POST['order_index'] ?? 0), $id
    ]);
    echo json_encode(['success' => true]);
}

// ADMIN: Delete team member
elseif ($method === 'DELETE' && $id) {
    requireAuth();
    $pdo = getDB();
    $stmt = $pdo->prepare('DELETE FROM team_members WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
}

else {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
}
