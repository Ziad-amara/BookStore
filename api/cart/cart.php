<?php
// /api/cart  — session-based cart
session_start();
$db   = getDB();
$auth = requireAuth(); // cart requires login
$uid  = $auth['id'];

// Cart stored in session keyed by user id
if (!isset($_SESSION['cart'][$uid])) {
    $_SESSION['cart'][$uid] = [];
}

function &getCart($uid) {
    return $_SESSION['cart'][$uid];
}

function cartTotal($cart, $db) {
    $total = 0;
    foreach ($cart as $bookId => $item) {
        $total += $item['price'] * $item['quantity'];
    }
    return round($total, 2);
}

function cartWithDetails(&$cart, $db) {
    $items = [];
    foreach ($cart as $bookId => $item) {
        $items[] = [
            'book_id'  => (int)$bookId,
            'title'    => $item['title'],
            'author'   => $item['author'],
            'image'    => $item['image'],
            'price'    => (float)$item['price'],
            'quantity' => (int)$item['quantity'],
            'subtotal' => round($item['price'] * $item['quantity'], 2),
        ];
    }
    return $items;
}

switch (true) {

    // GET /api/cart  — view cart
    case $method === 'GET':
        $cart  = &getCart($uid);
        $items = cartWithDetails($cart, $db);
        success([
            'items' => $items,
            'total' => cartTotal($cart, $db),
            'count' => count($items),
        ]);
        break;

    // POST /api/cart  — add item
    case $method === 'POST':
        $body = getBody();
        validate($body, ['book_id' => 'required', 'quantity' => 'required|numeric']);
        $bookId  = intval($body['book_id']);
        $qty     = max(1, intval($body['quantity']));

        $stmt = $db->prepare('SELECT id, title, author, price, image FROM books WHERE id = ?');
        $stmt->bind_param('i', $bookId);
        $stmt->execute();
        $book = $stmt->get_result()->fetch_assoc();
        if (!$book) error('Book not found.', 404);

        $cart = &getCart($uid);
        if (isset($cart[$bookId])) {
            $cart[$bookId]['quantity'] += $qty;
        } else {
            $cart[$bookId] = [
                'title'    => $book['title'],
                'author'   => $book['author'],
                'price'    => $book['price'],
                'image'    => $book['image'],
                'quantity' => $qty,
            ];
        }
        success([
            'items' => cartWithDetails($cart, $db),
            'total' => cartTotal($cart, $db),
        ], 'Item added to cart.');
        break;

    // PUT /api/cart  — update quantity
    case $method === 'PUT':
        $body   = getBody();
        validate($body, ['book_id' => 'required', 'quantity' => 'required|numeric']);
        $bookId = intval($body['book_id']);
        $qty    = intval($body['quantity']);
        $cart   = &getCart($uid);

        if ($qty <= 0) {
            unset($cart[$bookId]);
            success(['items' => cartWithDetails($cart, $db), 'total' => cartTotal($cart, $db)], 'Item removed.');
        } else {
            if (!isset($cart[$bookId])) error('Item not in cart.', 404);
            $cart[$bookId]['quantity'] = $qty;
            success(['items' => cartWithDetails($cart, $db), 'total' => cartTotal($cart, $db)], 'Cart updated.');
        }
        break;

    // DELETE /api/cart  — remove item or clear cart
    case $method === 'DELETE':
        $body   = getBody();
        $cart   = &getCart($uid);

        if (!empty($body['book_id'])) {
            $bookId = intval($body['book_id']);
            unset($cart[$bookId]);
            success(['items' => cartWithDetails($cart, $db), 'total' => cartTotal($cart, $db)], 'Item removed.');
        } else {
            // Clear whole cart
            $_SESSION['cart'][$uid] = [];
            success(['items' => [], 'total' => 0], 'Cart cleared.');
        }
        break;

    default:
        error('Cart endpoint not found.', 404);
}
