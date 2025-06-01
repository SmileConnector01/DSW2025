<?php 
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

// Include DB connection
$conn = require_once __DIR__ . '/database.php';

$data = json_decode(file_get_contents('php://input'), true);
$id = intval($data['id'] ?? 0);

if ($id > 0) {
  $stmt = $conn->prepare("DELETE FROM upcoming_event WHERE id = ?");
  $stmt->bind_param("i", $id);
  
  if ($stmt->execute()) {
    echo json_encode(['message' => 'Event deleted successfully']);
  } else {
    echo json_encode(['message' => 'Failed to delete event']);
  }
  
  $stmt->close();
} else {
  echo json_encode(['message' => 'Invalid ID']);
}

$conn->close();
