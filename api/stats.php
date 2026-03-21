<?php
// ================================================
// MEXIMCO API — Dashboard Stats
// ================================================
require_once __DIR__ . '/db.php';

requireAuth();
$pdo = getDB();

$msgs = $pdo->query("SELECT COUNT(*) as total, SUM(CASE WHEN status='unread' THEN 1 ELSE 0 END) as unread FROM messages")->fetch();
$blogs = $pdo->query("SELECT COUNT(*) as total FROM blogs")->fetch();
$team = $pdo->query("SELECT COUNT(*) as total FROM team_members")->fetch();

echo json_encode([
    'messages' => [
        'total' => (int)$msgs['total'],
        'unread' => (int)($msgs['unread'] ?? 0)
    ],
    'blogs' => (int)$blogs['total'],
    'team' => (int)$team['total']
]);
