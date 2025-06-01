<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// DB connection
$conn = require_once __DIR__ . '/database.php';

// read JSON body
$data = json_decode(file_get_contents('php://input'), true);
$id         = intval($data['id'] ?? 0);
$school     = trim($data['school'] ?? '');
$date       = trim($data['date'] ?? '');
$students   = intval($data['students'] ?? 0);
$gradeRange = trim($data['gradeRange'] ?? '');
$location   = trim($data['location'] ?? '');

if ($id > 0 && $school && $date) {
    $stmt = $conn->prepare(
      "UPDATE upcoming_event 
         SET school = ?, date = ?, students = ?, gradeRange = ?, location = ?
       WHERE id = ?"
    );
    $stmt->bind_param(
      "ssissi",
      $school,
      $date,
      $students,
      $gradeRange,
      $location,
      $id
    );

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Event updated']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update']);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
}

$conn->close();
