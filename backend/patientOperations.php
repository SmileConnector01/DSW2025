<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
$conn = require_once __DIR__ . '/database.php';

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['action']) && $data['action'] === 'archive') {
    $childId = intval($data['childId'] ?? 0);
    
    if ($childId > 0) {
        // Update status to "archived" instead of deleting
        $stmt = $conn->prepare("UPDATE children SET treatmentStatus = 'archived' WHERE child_ID = ?");
        $stmt->bind_param("i", $childId);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'Failed to archive record']);
        }
    } else {
        echo json_encode(['error' => 'Invalid child ID']);
    }
} else {
    echo json_encode(['error' => 'Invalid action']);
}

$conn->close();