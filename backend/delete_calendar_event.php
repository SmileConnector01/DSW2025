<?php
header('Content-Type: application/json');

// Get database connection
$conn = require_once __DIR__ . '/database.php';

// Read the raw JSON input
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

// Validate: only need 'id'
if (!isset($data['id']) || !is_numeric($data['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing or invalid ID']);
    exit;
}

$id = (int)$data['id'];

try {
    // Check if the event exists
    $chk = $conn->prepare("SELECT 1 FROM calendar_event WHERE id = ?");
    $chk->bind_param("i", $id);
    $chk->execute();
    $chk->store_result();

    if ($chk->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => "Event with ID $id not found"]);
        exit;
    }
    $chk->close();

    // Delete the event
    $stmt = $conn->prepare("DELETE FROM calendar_event WHERE id = ?");
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => "Event with ID $id deleted"]);
    } else {
        throw new Exception('Execute failed: ' . $stmt->error);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} finally {
    if (isset($stmt)) $stmt->close();
    $conn->close();
}
