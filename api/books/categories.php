<?php
// /api/categories[/:id]
$db = getDB();

switch (true) {

    // GET /api/categories
    case $method === 'GET' && !$id:
        $result = $db->query('SELECT * FROM categories ORDER BY name');
        $cats   = $result->fetch_all(MYSQLI_ASSOC);
        success($cats);
        break;

    // GET /api/categories/:id
    case $method === 'GET' && $id:
        $stmt = $db->prepare('SELECT * FROM categories WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $cat = $stmt->get_result()->fetch_assoc();
        if (!$cat) error('Category not found.', 404);
        success($cat);
        break;

    // POST /api/categories (admin)
    case $method === 'POST':
        requireAdmin();
        $body = getBody();
        validate($body, ['name' => 'required']);
        $name = trim($body['name']);
        $stmt = $db->prepare('INSERT INTO categories (name) VALUES (?)');
        $stmt->bind_param('s', $name);
        $stmt->execute();
        success(['id' => $db->insert_id, 'name' => $name], 'Category created.', 201);
        break;

    // PUT /api/categories/:id (admin)
    case $method === 'PUT' && $id:
        requireAdmin();
        $body = getBody();
        validate($body, ['name' => 'required']);
        $name = trim($body['name']);
        $stmt = $db->prepare('UPDATE categories SET name = ? WHERE id = ?');
        $stmt->bind_param('si', $name, $id);
        $stmt->execute();
        success([], 'Category updated.');
        break;

    // DELETE /api/categories/:id (admin)
    case $method === 'DELETE' && $id:
        requireAdmin();
        $stmt = $db->prepare('DELETE FROM categories WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        success([], 'Category deleted.');
        break;

    default:
        error('Category endpoint not found.', 404);
}
