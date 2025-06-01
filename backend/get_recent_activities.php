<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
$conn = require_once __DIR__ . '/database.php';

$userID = $_GET['user_ID'] ?? null;

if (!$userID) {
    http_response_code(400);
    echo json_encode(["error" => "Missing user_ID"]);
    exit();
}

$sql = "SELECT activity_type, activity_description, activity_time 
        FROM recent_activities 
        WHERE user_ID = ? 
        ORDER BY activity_time DESC 
        LIMIT 5";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userID);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
$conn->close();
