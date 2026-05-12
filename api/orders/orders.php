<?php
// /api/orders[/:id]
session_start();
$db   = getDB();
$auth = requireAuth();
$uid  = $auth['id'];

switch (true) {

    // GET /api/orders  — user order history
    case $method === 'GET' && !$id:
        $stmt = $db->prepare(
            'SELECT o.*, COUNT(oi.id) AS items_count
             FROM orders o
             LEFT JOIN order_items oi ON o.id = oi.order_id
             WHERE o.user_id = ?
             GROUP BY o.id
             ORDER BY o.id DESC'
        );
        $stmt->bind_param('i', $uid);
        $stmt->execute();
        $orders = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        success($orders);
        break;

    // GET /api/orders/:id  — single order with items
    case $method === 'GET' && $id:
        $stmt = $db->prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?');
        $stmt->bind_param('ii', $id, $uid);
        $stmt->execute();
        $order = $stmt->get_result()->fetch_assoc();
        if (!$order) error('Order not found.', 404);

        $stmt = $db->prepare(
            'SELECT oi.*, b.title, b.author, b.image
             FROM order_items oi
             JOIN books b ON oi.book_id = b.id
             WHERE oi.order_id = ?'
        );
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $order['items'] = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        success($order);
        break;

    // POST /api/orders  — create order from cart
    case $method === 'POST':
        if (empty($_SESSION['cart'][$uid])) {
            error('Cart is empty. Add items before placing an order.');
        }
        $cart = $_SESSION['cart'][$uid];

        // Verify books still exist and get fresh prices
        $total = 0;
        $verifiedItems = [];
        foreach ($cart as $bookId => $item) {
            $stmt = $db->prepare('SELECT id, price FROM books WHERE id = ?');
            $stmt->bind_param('i', $bookId);
            $stmt->execute();
            $book = $stmt->get_result()->fetch_assoc();
            if (!$book) error("Book ID $bookId no longer exists.");
            $verifiedItems[] = [
                'book_id'  => $bookId,
                'quantity' => $item['quantity'],
                'price'    => $book['price'],
            ];
            $total += $book['price'] * $item['quantity'];
        }
        $total = round($total, 2);

        // Begin transaction
        $db->begin_transaction();
        try {
            $status = 'pending';
            $stmt = $db->prepare('INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)');
            $stmt->bind_param('ids', $uid, $total, $status);
            $stmt->execute();
            $orderId = $db->insert_id;

            foreach ($verifiedItems as $item) {
                $stmt = $db->prepare(
                    'INSERT INTO order_items (order_id, book_id, quantity, price) VALUES (?, ?, ?, ?)'
                );
                $stmt->bind_param('iiid', $orderId, $item['book_id'], $item['quantity'], $item['price']);
                $stmt->execute();
            }

            $db->commit();
            // Clear cart
            $_SESSION['cart'][$uid] = [];

            success([
                'order_id'    => $orderId,
                'total_price' => $total,
                'status'      => $status,
                'items_count' => count($verifiedItems),
            ], 'Order placed successfully.', 201);

        } catch (Exception $e) {
            $db->rollback();
            error('Failed to create order. Please try again.', 500);
        }
        break;

    default:
        error('Orders endpoint not found.', 404);
}
