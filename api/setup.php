<?php
// ================================================
// MEXIMCO API — Database Setup Script
// Run this ONCE to create tables
// ================================================
require_once __DIR__ . '/db.php';

$pdo = getDB();

$queries = [
    // Messages table
    "CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        interest VARCHAR(255),
        message TEXT,
        status VARCHAR(20) DEFAULT 'unread',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

    // Blogs table
    "CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        category VARCHAR(255),
        image_url VARCHAR(500),
        excerpt TEXT,
        content LONGTEXT,
        author VARCHAR(255) DEFAULT 'MEXIMCO Team',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

    // Team members table
    "CREATE TABLE IF NOT EXISTS team_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255),
        bio TEXT,
        photo_url VARCHAR(500),
        cv_url VARCHAR(500),
        order_index INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
];

$results = [];
foreach ($queries as $sql) {
    try {
        $pdo->exec($sql);
        $results[] = ['sql' => substr($sql, 0, 60) . '...', 'status' => 'OK'];
    } catch (PDOException $e) {
        $results[] = ['sql' => substr($sql, 0, 60) . '...', 'status' => 'ERROR', 'error' => $e->getMessage()];
    }
}

echo json_encode(['message' => 'Database setup complete', 'results' => $results], JSON_PRETTY_PRINT);
