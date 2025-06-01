<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
$conn = require_once __DIR__ . '/database.php';

$type = $_GET['type'] ?? '';

if ($type === 'location') {
    $sql = "SELECT id, school, location, cavities, gumdisease, toothloss, other FROM past_event;";
}
else if ($type === 'video') {
    $sql = "SELECT id, title, description, category, duration, filename FROM past_event;";
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