<?php
header('Content-Type: application/json');

// Get database connection
$conn = require_once __DIR__ . '/database.php';

// Read raw JSON body
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

// Validation: must have id, title, start, end
if (
    !isset($data['id'], $data['type'], $data['title'], $data['start'], $data['end'])
    || trim($data['title']) === ''
) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields or ID']);
    exit;
}

$id          = (int)$data['id'];
$type        = $data['type'];
$title       = $data['title'];
$start       = $data['start'];
$end         = $data['end'];
$description = $data['description'] ?? '';
$location    = $data['location']    ?? '';
$patientId   = $data['patientId']   ?? null;
$status      = $data['status']      ?? null;
$treatment   = $data['treatment']   ?? null;

// Normalize attendees string
$attendees = null;
if (!empty($data['attendees']) && is_string($data['attendees'])) {
    $parts = explode(',', $data['attendees']);
    $clean = [];
    foreach ($parts as $p) {
        $t = trim($p);
        if ($t !== '') $clean[] = $t;
    }
    $attendees = implode(', ', $clean);
}

try {
    // Check that the record exists
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

    // Build UPDATE statement
    $sql = "UPDATE calendar_event SET
                type           = ?,
                title          = ?,
                start_datetime = ?,
                end_datetime   = ?,
                description    = ?,
                location       = ?,
                patient_id     = ?,
                status         = ?,
                treatment      = ?,
                attendees      = ?
            WHERE id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    // Bind params (note the final "i" for the id)
    $stmt->bind_param(
        "ssssssssssi",
        $type,
        $title,
        $start,
        $end,
        $description,
        $location,
        $patientId,
        $status,
        $treatment,
        $attendees,
        $id
    );

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Event updated',
            'id'      => $id
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
