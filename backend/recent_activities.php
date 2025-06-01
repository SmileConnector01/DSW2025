<?php

    // Allow requests from any origin (for testing)
    header("Access-Control-Allow-Origin: *");
    header('Content-Type: application/json');
    // this returns the mysqli instance
    $conn = require_once __DIR__ . '/database.php';

$sql = "SELECT activity_ID, activity_type, activity_description, activity_time
          FROM recent_activities
         ORDER BY activity_time DESC";
$result = $conn->query($sql);

$data = [];
while ($row = $result->fetch_assoc()) {
    // Optionally format the time into a “pretty” string here,
    // or leave it raw for the JS to handle.
    $data[] = [
        'id'          => (int)$row['activity_ID'],
        'type'        => $row['activity_type'],
        'description' => $row['activity_description'],
        'time'        => $row['activity_time'],
    ];
}

header('Content-Type: application/json');
echo json_encode($data);
$conn->close();
