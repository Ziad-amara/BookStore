<?php
// /api/books[/:id]
require_once __DIR__ . '/api/bootstrap.php';
$db = getDB();

switch (true) {

    // GET /api/books  — list, search, filter, paginate
    case $method === 'GET' && !$id && !$sub:
        $search   = trim($_GET['search'] ?? '');
        $catId    = intval($_GET['category_id'] ?? 0);
        $minPrice = floatval($_GET['min_price'] ?? 0);
        $maxPrice = floatval($_GET['max_price'] ?? 0);

        $where  = ['1=1'];
        $params = [];
        $types  = '';

        if ($search !== '') {
            $like = "%$search%";
            $where[] = '(b.title LIKE ? OR b.author LIKE ?)';
            $params[] = $like;
            $params[] = $like;
            $types   .= 'ss';
        }
        if ($catId > 0) {
            $where[] = 'b.category_id = ?';
            $params[] = $catId;
            $types   .= 'i';
        }
        if ($minPrice > 0) {
            $where[] = 'b.price >= ?';
            $params[] = $minPrice;
            $types   .= 'd';
        }
        if ($maxPrice > 0) {
            $where[] = 'b.price <= ?';
            $params[] = $maxPrice;
            $types   .= 'd';
        }

        $whereStr = implode(' AND ', $where);
        $selectSql = "SELECT b.*, c.name AS category_name
                      FROM books b
                      LEFT JOIN categories c ON b.category_id = c.id
                      WHERE $whereStr
                      ORDER BY b.id DESC";
        $countSql  = "SELECT COUNT(*) FROM books b WHERE $whereStr";

        $result = paginate($db, $selectSql, $countSql, $params, $types);
        success($result);
        break;

    // GET /api/books/:id  — single book
    case $method === 'GET' && $id:
        $stmt = $db->prepare(
            'SELECT b.*, c.name AS category_name
             FROM books b
             LEFT JOIN categories c ON b.category_id = c.id
             WHERE b.id = ?'
        );
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $book = $stmt->get_result()->fetch_assoc();
        if (!$book) error('Book not found.', 404);
        success($book);
        break;

    // POST /api/books  — create (admin only)
    case $method === 'POST' && !$id:
        requireAdmin();
        $body = getBody();
        validate($body, [
            'title'  => 'required',
            'author' => 'required',
            'price'  => 'required|numeric',
        ]);

        $title       = trim($body['title']);
        $author      = trim($body['author']);
        $price       = floatval($body['price']);
        $description = trim($body['description'] ?? '');
        $image       = trim($body['image'] ?? '');
        $categoryId  = intval($body['category_id'] ?? 0) ?: null;

        $stmt = $db->prepare(
            'INSERT INTO books (title, author, price, description, image, category_id)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->bind_param('ssdssi', $title, $author, $price, $description, $image, $categoryId);
        $stmt->execute();
        $newId = $db->insert_id;

        // Return the created book
        $stmt = $db->prepare('SELECT b.*, c.name AS category_name FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE b.id = ?');
        $stmt->bind_param('i', $newId);
        $stmt->execute();
        $book = $stmt->get_result()->fetch_assoc();
        success($book, 'Book created successfully.', 201);
        break;

    // PUT /api/books/:id  — update (admin only)
    case $method === 'PUT' && $id:
        requireAdmin();
        $body = getBody();

        // Fetch existing
        $stmt = $db->prepare('SELECT * FROM books WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $existing = $stmt->get_result()->fetch_assoc();
        if (!$existing) error('Book not found.', 404);

        $title       = trim($body['title']       ?? $existing['title']);
        $author      = trim($body['author']      ?? $existing['author']);
        $price       = floatval($body['price']   ?? $existing['price']);
        $description = trim($body['description'] ?? $existing['description']);
        $image       = trim($body['image']       ?? $existing['image']);
        $categoryId  = intval($body['category_id'] ?? $existing['category_id']) ?: null;

        $stmt = $db->prepare(
            'UPDATE books SET title=?, author=?, price=?, description=?, image=?, category_id=? WHERE id=?'
        );
        $stmt->bind_param('ssdssi i', $title, $author, $price, $description, $image, $categoryId, $id);

        // fix spacing in bind_param
        $stmt = $db->prepare(
            'UPDATE books SET title=?, author=?, price=?, description=?, image=?, category_id=? WHERE id=?'
        );
        $stmt->bind_param('ssdssii', $title, $author, $price, $description, $image, $categoryId, $id);
        $stmt->execute();
        success(['id' => $id], 'Book updated successfully.');
        break;

    // DELETE /api/books/:id  — delete (admin only)
    case $method === 'DELETE' && $id:
        requireAdmin();
        $stmt = $db->prepare('SELECT id FROM books WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        if ($stmt->get_result()->num_rows === 0) error('Book not found.', 404);

        $stmt = $db->prepare('DELETE FROM books WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        success([], 'Book deleted successfully.');
        break;

    default:
        error('Books endpoint not found.', 404);
}
