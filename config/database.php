<?php
define('DB_HOST', '127.0.0.1');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'bookstore');

function getDB() {
    static $conn = null;
    if ($conn === null) {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if ($conn->connect_error) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $conn->connect_error]);
            exit;
        }
        $conn->set_charset('utf8mb4');
    }
    return $conn;
}
