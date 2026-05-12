<?php
function response($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function success($data = [], $message = 'Success', $code = 200) {
    response(['status' => 'success', 'message' => $message, 'data' => $data], $code);
}

function error($message = 'Error', $code = 400) {
    response(['status' => 'error', 'message' => $message], $code);
}

function getBody() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

function validate($data, $rules) {
    foreach ($rules as $field => $rule) {
        if (str_contains($rule, 'required') && empty($data[$field])) {
            error("Field '$field' is required.");
        }
        if (str_contains($rule, 'email') && !empty($data[$field]) && !filter_var($data[$field], FILTER_VALIDATE_EMAIL)) {
            error("Field '$field' must be a valid email.");
        }
        if (str_contains($rule, 'numeric') && !empty($data[$field]) && !is_numeric($data[$field])) {
            error("Field '$field' must be a number.");
        }
    }
}

function paginate($db, $sql, $countSql, $params = [], $types = '') {
    $page  = max(1, intval($_GET['page'] ?? 1));
    $limit = max(1, min(100, intval($_GET['limit'] ?? 10)));
    $offset = ($page - 1) * $limit;

    // Count
    $stmt = $db->prepare($countSql);
    if ($params) $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $total = $stmt->get_result()->fetch_row()[0];

    // Data
    $stmt = $db->prepare($sql . " LIMIT ? OFFSET ?");
    if ($params) {
        $allParams = array_merge($params, [$limit, $offset]);
        $stmt->bind_param($types . 'ii', ...$allParams);
    } else {
        $stmt->bind_param('ii', $limit, $offset);
    }
    $stmt->execute();
    $data = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    return [
        'items'        => $data,
        'pagination'   => [
            'total'        => (int)$total,
            'page'         => $page,
            'limit'        => $limit,
            'total_pages'  => (int)ceil($total / $limit),
        ]
    ];
}
