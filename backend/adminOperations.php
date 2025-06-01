<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

$conn = require_once __DIR__ . '/database.php';
$data = json_decode(file_get_contents('php://input'), true);

// Handle status update
if (isset($data['action']) && $data['action'] === 'update_status') {
    $adminEmail = $conn->real_escape_string($data['adminEmail'] ?? '');
    $newStatus = $conn->real_escape_string($data['status'] ?? '');
    
    if (!empty($adminEmail) && in_array($newStatus, ['Active', 'Inactive', 'Pending'])) {
        $stmt = $conn->prepare("UPDATE admin SET Status = ? WHERE adminEmail = ?");
        $stmt->bind_param("ss", $newStatus, $adminEmail);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'Failed to update status']);
        }
        $stmt->close();
    } else {
        echo json_encode(['error' => 'Invalid parameters']);
    }
    exit();
}

// Handle delete
if (isset($data['action']) && $data['action'] === 'delete') {
    $adminEmail = $conn->real_escape_string($data['adminEmail'] ?? '');
    
    if (!empty($adminEmail)) {
        // Start with users table first (parent table)
        $stmt = $conn->prepare("DELETE FROM users WHERE email = ?");
        $stmt->bind_param("s", $adminEmail);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'Failed to delete admin']);
        }
        $stmt->close();
    } else {
        echo json_encode(['error' => 'Invalid parameters']);
    }
    exit();
}

echo json_encode(['error' => 'Invalid action']);
$conn->close();