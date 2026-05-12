<?php
// /api/admin/{users|orders|stats}[/:id]
$db = getDB();
requireAdmin();

// Re-parse sub-routes: /api/admin/{resource}/{id?}
$resource = $sub;   // users | orders | stats
$resId    = is_numeric($action) ? (int)$action : null;
$resAction = $resId ? '' : $action;

switch (true) {

    // ── STATS ─────────────────────────────────────────────
    case $method === 'GET' && $resource === 'stats':
        $stats = [];
        $stats['total_books']  = $db->query('SELECT COUNT(*) FROM books')->fetch_row()[0];
        $stats['total_users']  = $db->query('SELECT COUNT(*) FROM users WHERE role="user"')->fetch_row()[0];
        $stats['total_orders'] = $db->query('SELECT COUNT(*) FROM orders')->fetch_row()[0];
        $stats['total_revenue']= $db->query('SELECT COALESCE(SUM(total_price),0) FROM orders WHERE status != "cancelled"')->fetch_row()[0];
        $stats['pending_orders']   = $db->query('SELECT COUNT(*) FROM orders WHERE status="pending"')->fetch_row()[0];
        $stats['shipped_orders']   = $db->query('SELECT COUNT(*) FROM orders WHERE status="shipped"')->fetch_row()[0];
        $stats['delivered_orders'] = $db->query('SELECT COUNT(*) FROM orders WHERE status="delivered"')->fetch_row()[0];
        success($stats);
        break;

    // ── USERS ─────────────────────────────────────────────
    case $method === 'GET' && $resource === 'users' && !$resId:
        $page   = max(1, intval($_GET['page'] ?? 1));
        $limit  = 10;
        $offset = ($page - 1) * $limit;
        $total  = $db->query('SELECT COUNT(*) FROM users')->fetch_row()[0];
        $stmt   = $db->prepare('SELECT id, name, email, role, created_at FROM users ORDER BY id DESC LIMIT ? OFFSET ?');
        $stmt->bind_param('ii', $limit, $offset);
        $stmt->execute();
        $users = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        success(['items' => $users, 'pagination' => ['total' => (int)$total, 'page' => $page, 'limit' => $limit]]);
        break;

    case $method === 'DELETE' && $resource === 'users' && $resId:
        $stmt = $db->prepare('DELETE FROM users WHERE id = ? AND role != "admin"');
        $stmt->bind_param('i', $resId);
        $stmt->execute();
        if ($stmt->affected_rows === 0) error('User not found or cannot delete admin.', 404);
        success([], 'User deleted.');
        break;

    // ── ORDERS ────────────────────────────────────────────
    case $method === 'GET' && $resource === 'orders' && !$resId:
        $status = $_GET['status'] ?? '';
        if ($status) {
            $stmt = $db->prepare(
                'SELECT o.*, u.name AS user_name, u.email AS user_email
                 FROM orders o JOIN users u ON o.user_id = u.id
                 WHERE o.status = ? ORDER BY o.id DESC'
            );
            $stmt->bind_param('s', $status);
        } else {
            $stmt = $db->prepare(
                'SELECT o.*, u.name AS user_name, u.email AS user_email
                 FROM orders o JOIN users u ON o.user_id = u.id
                 ORDER BY o.id DESC'
            );
        }
        $stmt->execute();
        $orders = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        success($orders);
        break;

    case $method === 'GET' && $resource === 'orders' && $resId:
        $stmt = $db->prepare(
            'SELECT o.*, u.name AS user_name, u.email AS user_email
             FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?'
        );
        $stmt->bind_param('i', $resId);
        $stmt->execute();
        $order = $stmt->get_result()->fetch_assoc();
        if (!$order) error('Order not found.', 404);

        $stmt = $db->prepare(
            'SELECT oi.*, b.title, b.author, b.image
             FROM order_items oi JOIN books b ON oi.book_id = b.id WHERE oi.order_id = ?'
        );
        $stmt->bind_param('i', $resId);
        $stmt->execute();
        $order['items'] = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        success($order);
        break;

    // PUT /api/admin/orders/:id  — update order status
    case $method === 'PUT' && $resource === 'orders' && $resId:
        $body   = getBody();
        $allowed = ['pending', 'shipped', 'delivered', 'cancelled'];
        $status  = $body['status'] ?? '';
        if (!in_array($status, $allowed)) {
            error('Invalid status. Allowed: ' . implode(', ', $allowed));
        }
        $stmt = $db->prepare('UPDATE orders SET status = ? WHERE id = ?');
        $stmt->bind_param('si', $status, $resId);
        $stmt->execute();
        if ($stmt->affected_rows === 0) error('Order not found.', 404);
        success([], "Order status updated to '$status'.");
        break;

    default:
        error('Admin endpoint not found.', 404);
}
