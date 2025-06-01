<?php 
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$conn = require_once __DIR__ . '/database.php';

// Decode incoming JSON
$body = json_decode(file_get_contents('php://input'), true);

// Sanitize input
$school     = $conn->real_escape_string($body['school']     ?? '');
$date_time  = $conn->real_escape_string($body['date_time']  ?? '');
$students   = isset($body['students'])   ? (int)$body['students']   : 0;
$gradeRange = $conn->real_escape_string($body['gradeRange'] ?? '');
$location   = $conn->real_escape_string($body['location']   ?? '');
$contact    = $conn->real_escape_string($body['contact']    ?? '');
$status     = $conn->real_escape_string($body['status']     ?? 'completed');

// Basic validation
if (empty($school) || empty($date_time) || $students <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing or invalid fields']);
    exit;
}

// Prepare insert
$sql = "INSERT INTO past_event (school, date, students, gradeRange, location, contact, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
    exit;
}

$stmt->bind_param(
    "ssissss",
    $school,
    $date_time,
    $students,
    $gradeRange,
    $location,
    $contact,
    $status
);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Event added',
        'insert_id' => $stmt->insert_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Execute failed: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
