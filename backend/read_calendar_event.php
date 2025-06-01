<?php
header('Content-Type: application/json');

// load your DB connection
$conn = require_once __DIR__ . '/database.php';

try {
    $sql = "SELECT
                id,
                type,
                title,
                DATE_FORMAT(start_datetime, '%Y-%m-%dT%H:%i:%s') AS start,
                DATE_FORMAT(end_datetime,   '%Y-%m-%dT%H:%i:%s') AS end,
                description,
                location,
                patient_id,
                status,
                treatment,
                attendees
            FROM calendar_event";
    $result = $conn->query($sql);
    if (!$result) {
        throw new Exception($conn->error);
    }

    $events = [];
    while ($row = $result->fetch_assoc()) {
        // convert the comma-string of attendees into an array
        $attArr = [];
        if (strlen(trim($row['attendees'])) > 0) {
            foreach (explode(',', $row['attendees']) as $a) {
                $t = trim($a);
                if ($t !== '') $attArr[] = $t;
            }
        }

        $events[] = [
            'id'            => (int)$row['id'],
            'title'         => $row['title'],
            'start'         => $row['start'],
            'end'           => $row['end'],
            'type'        => $row['type'],
            'extendedProps'=> [
                'description' => $row['description'],
                'location'    => $row['location'],
                'patientId'   => $row['patient_id'],
                'status'      => $row['status'],
                'treatment'   => $row['treatment'],
                'attendees'   => $attArr
            ],
        ];
    }

    echo json_encode($events);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB error: ' . $e->getMessage()]);
}
$conn->close();
