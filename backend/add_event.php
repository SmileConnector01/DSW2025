<?php
header('Content-Type: application/json');

// Get database connection
$conn = require_once __DIR__ . '/database.php';

// Collect and sanitize input data
$school = $conn->real_escape_string($_POST['school'] ?? '');
$date_time = $conn->real_escape_string($_POST['date_time'] ?? '');
$students = (int)($_POST['students'] ?? 0);
$gradeRange = $conn->real_escape_string($_POST['gradeRange'] ?? '');
$location = $conn->real_escape_string($_POST['location'] ?? '');
$contact = $conn->real_escape_string($_POST['contact'] ?? '');
$status = $conn->real_escape_string($_POST['status'] ?? 'planned');

// Validate required fields
if (empty($school) || empty($date_time) || $students <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

try {
    // Prepare and execute insert query
    $sql = "INSERT INTO upcoming_event 
            (school, date, students, gradeRange, location, contact, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    $stmt->bind_param("ssissss",
        $school,
        $date_time,
        $students,
        $gradeRange,
        $location,
        $contact,
        $status
    );

    if ($stmt->execute()) {
        session_start();
        $admin = $_SESSION['user_ID'];
        $ip = $_SERVER['REMOTE_ADDR'];
        $action = 'CREATE';
        $targetType = 'EVENT';
        $targetId = $conn->insert_id; // The new event's ID
        $details = "Added event for school: $school, date: $date_time, students: $students";

        $auditStmt = $conn->prepare("INSERT INTO audit_logs (action, user_ID, target_type, target_ID, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)");
        $auditStmt->bind_param("ssssss", $action, $admin, $targetType, $targetId, $details, $ip);
        $auditStmt->execute();
        $auditStmt->close();
        echo json_encode([
            'success' => true,
            'message' => 'Event added successfully'
        ]);
    } else {
        throw new Exception('Execute failed: ' . $stmt->error);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    $conn->close();
}
