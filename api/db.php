<?php
// ================================================
// MEXIMCO API — Database Connection
// ================================================
// Configure these with your Namecheap MySQL credentials
// Find them in cPanel → MySQL Databases

define('DB_HOST', 'localhost');
define('DB_NAME', 'YOUR_CPANEL_USER_meximco');  // Usually: cpaneluser_dbname
define('DB_USER', 'YOUR_CPANEL_USER_admin');     // Usually: cpaneluser_dbuser
define('DB_PASS', 'YOUR_DB_PASSWORD');           // The password you set in cPanel
define('JWT_SECRET', 'meximco-admin-secret-2025-change-this');
define('ADMIN_EMAIL', 'admin@meximcoltd.com');
define('ADMIN_PASSWORD', 'meximco2025');  // Change this!
define('UPLOAD_DIR', __DIR__ . '/../uploads/');

// CORS — allow your domain
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database connection
function getDB() {
    try {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
        exit;
    }
}

// Simple JWT functions
function createToken($payload) {
    $header = base64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload['exp'] = time() + 86400; // 24 hours
    $payload = base64url_encode(json_encode($payload));
    $signature = base64url_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    return "$header.$payload.$signature";
}

function verifyToken($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    [$header, $payload, $signature] = $parts;
    $valid = base64url_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    if ($signature !== $valid) return false;
    $data = json_decode(base64url_decode($payload), true);
    if ($data['exp'] < time()) return false;
    return $data;
}

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

// Auth check
function requireAuth() {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!preg_match('/Bearer\s+(.+)/', $auth, $matches)) {
        http_response_code(401);
        echo json_encode(['error' => 'No token provided']);
        exit;
    }
    $user = verifyToken($matches[1]);
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit;
    }
    return $user;
}

// Get JSON body
function getBody() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

// Ensure upload directories exist
function ensureUploadDirs() {
    $dirs = [UPLOAD_DIR, UPLOAD_DIR . 'blogs/', UPLOAD_DIR . 'team/'];
    foreach ($dirs as $dir) {
        if (!is_dir($dir)) mkdir($dir, 0755, true);
    }
}

// Handle file upload
function handleUpload($fileKey, $subdir) {
    if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    ensureUploadDirs();
    $file = $_FILES[$fileKey];
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = time() . '-' . rand(100000, 999999) . '.' . $ext;
    $dest = UPLOAD_DIR . $subdir . '/' . $filename;
    move_uploaded_file($file['tmp_name'], $dest);
    return '/uploads/' . $subdir . '/' . $filename;
}
