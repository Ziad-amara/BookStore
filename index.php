<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/jwt.php';
require_once __DIR__ . '/config/helpers.php';

// ---------- Simple Router ----------
$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?? '/';
$uri    = rtrim(str_replace('/bookstore', '', $uri), '/') ?: '/';
$segments = explode('/', trim($uri, '/'));

$base   = $segments[1] ?? '';
$sub    = $segments[2] ?? '';
$id     = is_numeric($sub) ? (int)$sub : null;
$action = !$id ? $sub : ($segments[3] ?? '');

switch ($base) {
    case 'auth':
        require __DIR__ . '/api/auth/auth.php';
        break;
    case 'books':
        require __DIR__ . '/api/books/books.php';
        break;
    case 'categories':
        require __DIR__ . '/api/books/categories.php';
        break;
    case 'cart':
        require __DIR__ . '/api/cart/cart.php';
        break;
    case 'orders':
        require __DIR__ . '/api/orders/orders.php';
        break;
    case 'admin':
        require __DIR__ . '/api/admin/admin.php';
        break;
    case '':
    case 'health':
        success(['version' => '1.0', 'server' => 'BookStore API'], 'BookStore API is running ');
        break;
    default:
        error('Endpoint not found.', 404);
}