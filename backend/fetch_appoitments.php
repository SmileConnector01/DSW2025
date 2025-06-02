<?php 
// Allow requests from any origin (for testing)
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

// this returns the mysqli instance
$conn = require_once __DIR__ . '/database.php';

$type = $_GET['type'] ?? '';

if ($type === 'calendar_event') {
    // Only select the required columns
    $sql = "SELECT id, title, start_datetime, childFullName FROM calendar_event";
} else {
    http_response_code(400);
    echo json_encode(["error" => "Invalid data type"]);
    exit();
}

$result = $conn->query($sql);

$data = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
} else {
    http_response_code(500);
    echo json_encode(["error" => $conn->error]);
}

$conn->close();
