<?php
// ================================================
// MEXIMCO API — Products
// ================================================
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

// PUBLIC: List all products
if ($method === 'GET' && !$id) {
    $pdo = getDB();
    $category = $_GET['category'] ?? null;
    if ($category) {
        $stmt = $pdo->prepare('SELECT * FROM products WHERE category = ? ORDER BY order_index ASC, created_at DESC');
        $stmt->execute([$category]);
    } else {
        $stmt = $pdo->query('SELECT * FROM products ORDER BY order_index ASC, created_at DESC');
    }
    echo json_encode($stmt->fetchAll());
}

// PUBLIC: Get single product
elseif ($method === 'GET' && $id) {
    $pdo = getDB();
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([$id]);
    $product = $stmt->fetch();
    if ($product) {
        echo json_encode($product);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
    }
}

// ADMIN: Create product
elseif ($method === 'POST' && !$id) {
    requireAuth();
    $pdo = getDB();
    $image_url = handleUpload('image', 'products');

    $stmt = $pdo->prepare('INSERT INTO products (name, category, form_type, description, benefits, shelf_life, image_url, price_range, is_featured, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $_POST['name'] ?? '',
        $_POST['category'] ?? '',
        $_POST['form_type'] ?? '',
        $_POST['description'] ?? '',
        $_POST['benefits'] ?? '',
        $_POST['shelf_life'] ?? '',
        $image_url,
        $_POST['price_range'] ?? '',
        isset($_POST['is_featured']) ? 1 : 0,
        intval($_POST['order_index'] ?? 0)
    ]);
    $newId = $pdo->lastInsertId();
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([$newId]);
    echo json_encode($stmt->fetch());
}

// ADMIN: Update product
elseif ($method === 'POST' && $id && isset($_GET['_method']) && $_GET['_method'] === 'PUT') {
    requireAuth();
    $pdo = getDB();
    $image_url = handleUpload('image', 'products');

    if (!$image_url) {
        $stmt = $pdo->prepare('SELECT image_url FROM products WHERE id = ?');
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        $image_url = $existing['image_url'] ?? null;
    }

    $stmt = $pdo->prepare('UPDATE products SET name=?, category=?, form_type=?, description=?, benefits=?, shelf_life=?, image_url=?, price_range=?, is_featured=?, order_index=? WHERE id=?');
    $stmt->execute([
        $_POST['name'], $_POST['category'], $_POST['form_type'],
        $_POST['description'], $_POST['benefits'], $_POST['shelf_life'],
        $image_url, $_POST['price_range'],
        isset($_POST['is_featured']) ? 1 : 0,
        intval($_POST['order_index'] ?? 0), $id
    ]);
    echo json_encode(['success' => true]);
}

// ADMIN: Delete product
elseif ($method === 'DELETE' && $id) {
    requireAuth();
    $pdo = getDB();
    $stmt = $pdo->prepare('DELETE FROM products WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
}

else {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
}
