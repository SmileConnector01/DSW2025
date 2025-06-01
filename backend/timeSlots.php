<?php
// getEvents.php
header("Content-Type: application/json");

// Adjust the path to your actual database.php
$conn = require_once __DIR__ . '/database.php';

$sql = "SELECT start_datetime FROM calendar_event";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    // If prepare failed, return an error
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Database prepare failed: " . $conn->error
    ]);
    exit();
}

$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    // Each $row looks like ['start_datetime' => '2025-06-03 08:30:00']
    $data[] = $row;
}

$stmt->close();
$conn->close();

echo json_encode([
    "status" => "success",
    "events" => $data
]);
