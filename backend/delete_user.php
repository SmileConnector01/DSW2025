<?php
header('Content-Type: application/json');

// Allow requests from any origin (for testing)
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
    // this returns the mysqli instance
    $conn = require_once __DIR__ . '/database.php';

$data = json_decode(file_get_contents('php://input'), true);
$id = intval($data['id'] ?? 0);

if ($id > 0) {
  $stmt = $conn->prepare("DELETE FROM children WHERE child_ID = ?");
  $stmt->bind_param("i", $id);
  if ($stmt->execute()) {
    echo json_encode(['message' => 'User deleted successfully']);
  } else {
    echo json_encode(['message' => 'Failed to delete user']);
  }
  $stmt->close();
} else {
  echo json_encode(['message' => 'Invalid ID']);
}

$conn->close();
