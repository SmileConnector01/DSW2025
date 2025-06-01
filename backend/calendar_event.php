<?php
header('Content-Type: application/json');

// Get database connection
$conn = require_once __DIR__ . '/database.php';

// Read raw JSON body
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

// Basic validation
if (
    !isset($data['type'], $data['title'], $data['start'], $data['end'])
    || trim($data['title']) === ''
) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Extract common fields
$type        = $data['type'];
$title       = $data['title'];
$start       = $data['start'];
$end         = $data['end'];
$description = isset($data['description']) ? $data['description'] : '';
$location    = isset($data['location'])    ? $data['location']    : '';

// Optional appointment fields
$patientId = isset($data['patientId']) ? $data['patientId'] : null;
$status    = isset($data['status'])    ? $data['status']    : "scheduled";
$treatment = isset($data['treatment']) ? $data['treatment'] : null;

// Optional meeting attendees, split manually
$attendeesArr = [];
if (isset($data['attendees']) && is_string($data['attendees'])) {
    $parts = explode(',', $data['attendees']);
    foreach ($parts as $p) {
        $t = trim($p);
        if ($t !== '') {
            $attendeesArr[] = $t;
        }
    }
    // Store back as comma-separated for DB
    $attendees = implode(', ', $attendeesArr);
} else {
    $attendees = null;
}

try {
    // Build your INSERT—adjust table & columns as needed
    $sql = "INSERT INTO calendar_event
      (type, title, start_datetime, end_datetime, description, location,
       patient_id, status, treatment, attendees)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    // Bind params (s = string, so we can pass nulls for optional ones)
    $stmt->bind_param(
        "ssssssssss",
        $type,
        $title,
        $start,
        $end,
        $description,
        $location,
        $patientId,
        $status,
        $treatment,
        $attendees
    );

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Event saved',
            'id'      => $stmt->insert_id
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
