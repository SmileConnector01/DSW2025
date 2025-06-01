<?php
    // Allow requests from any origin (for testing)
    header("Access-Control-Allow-Origin: *");
    header('Content-Type: application/json');
    // this returns the mysqli instance
    $conn = require_once __DIR__ . '/database.php';

    $type = $_GET['type'] ?? '';

    if ($type === 'upcoming_event') {
        $sql = "SELECT * FROM upcoming_event";
    } 
    elseif ($type === 'past_event') {
        $sql = "SELECT * FROM past_event";
    }
    else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid data type"]);
        exit();
    }

    $result = $conn->query($sql);

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode($data);
    $conn->close();
