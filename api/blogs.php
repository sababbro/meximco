<?php
// ================================================
// MEXIMCO API — Blogs
// ================================================
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

// PUBLIC: List all blogs
if ($method === 'GET' && !$id) {
    $pdo = getDB();
    $stmt = $pdo->query('SELECT * FROM blogs ORDER BY created_at DESC');
    echo json_encode($stmt->fetchAll());
}

// ADMIN: Create blog
elseif ($method === 'POST' && !$id) {
    requireAuth();
    $pdo = getDB();
    $image_url = handleUpload('image', 'blogs');

    $stmt = $pdo->prepare('INSERT INTO blogs (title, category, image_url, excerpt, content, author) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $_POST['title'] ?? '',
        $_POST['category'] ?? '',
        $image_url,
        $_POST['excerpt'] ?? '',
        $_POST['content'] ?? '',
        $_POST['author'] ?? 'MEXIMCO Team'
    ]);
    $newId = $pdo->lastInsertId();
    $stmt = $pdo->prepare('SELECT * FROM blogs WHERE id = ?');
    $stmt->execute([$newId]);
    echo json_encode($stmt->fetch());
}

// ADMIN: Update blog
elseif ($method === 'POST' && $id && isset($_GET['_method']) && $_GET['_method'] === 'PUT') {
    requireAuth();
    $pdo = getDB();
    $image_url = handleUpload('image', 'blogs');

    if ($image_url) {
        $stmt = $pdo->prepare('UPDATE blogs SET title=?, category=?, image_url=?, excerpt=?, content=?, author=? WHERE id=?');
        $stmt->execute([$_POST['title'], $_POST['category'], $image_url, $_POST['excerpt'], $_POST['content'], $_POST['author'], $id]);
    } else {
        $stmt = $pdo->prepare('UPDATE blogs SET title=?, category=?, excerpt=?, content=?, author=? WHERE id=?');
        $stmt->execute([$_POST['title'], $_POST['category'], $_POST['excerpt'], $_POST['content'], $_POST['author'], $id]);
    }
    echo json_encode(['success' => true]);
}

// ADMIN: Delete blog
elseif ($method === 'DELETE' && $id) {
    requireAuth();
    $pdo = getDB();
    $stmt = $pdo->prepare('DELETE FROM blogs WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
}

else {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
}
