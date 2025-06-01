<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// 1. Read JSON data from request body
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

// 2. Validate input
if (
    empty($data['childFullName']) ||
    empty($data['title']) ||
    empty($data['description']) ||
    empty($data['start_datetime']) ||
    empty($data['end_datetime']) ||
    empty($data['Patient_ID'])
) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Missing required fields.'
    ]);
    exit;
}

// 3. Include the database connection
$mysqli = require __DIR__ . "/database.php";

// 4. Prepare SQL
$sql = "INSERT INTO calendar_event 
            (childFullName, title, description, start_datetime, end_datetime, Patient_ID) 
        VALUES (?, ?, ?, ?, ?, ?)";

$stmt = $mysqli->prepare($sql);
if (!$stmt) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Prepare failed: ' . $mysqli->error
    ]);
    exit;
}

// 5. Bind parameters
$stmt->bind_param(
    "sssssi",
    $data['childFullName'],
    $data['title'],
    $data['description'],
    $data['start_datetime'],
    $data['end_datetime'],
    $data['Patient_ID']
);

// 6. Execute and respond
if ($stmt->execute()) {
    echo json_encode([
        'status' => 'success',
        'message' => 'Appointment created successfully.'
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database insert failed: ' . $stmt->error
    ]);
}

$stmt->close();
$mysqli->close();
