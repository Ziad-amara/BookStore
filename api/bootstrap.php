<?php

function getDB() {
    return new mysqli("localhost","root","","bookstore");
}

function success($data, $msg = "OK", $code = 200) {
    echo json_encode([
        "status" => "success",
        "message" => $msg,
        "data" => $data
    ]);
}

function error($msg, $code = 400) {
    http_response_code($code);
    echo json_encode([
        "status" => "error",
        "message" => $msg
    ]);
    exit;
}
>