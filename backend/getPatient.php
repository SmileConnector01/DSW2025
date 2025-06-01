<?php
// Include database connection
require_once 'database.php';

// Initialize response
$response = ['status' => 'error', 'message' => '', 'data' => null];

try {
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        throw new Exception('Patient ID is required');
    }
    
    $patientId = (int)$_GET['id'];
    
    // Query to get patient data
    $query = "SELECT c.*, p.username as guardianName 
              FROM children c 
              JOIN patients p ON c.patient_ID = p.patient_ID 
              WHERE c.child_ID = ?";
    
    $stmt = $mysqli->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Database prepare error: " . $mysqli->error);
    }
    
    $stmt->bind_param("i", $patientId);
    
    if (!$stmt->execute()) {
        throw new Exception("Database query error: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Patient not found');
    }
    
    $response['status'] = 'success';
    $response['data'] = $result->fetch_assoc();
    
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);
exit;
?>