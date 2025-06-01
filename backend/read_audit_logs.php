<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Get DB connection
$mysqli = require __DIR__ . '/database.php';

// Run the query
$sql = "
  SELECT 
    al.action,
    u.full_name AS admin,
    al.target_type,
    al.target_ID,
    al.details,
    al.ip_address,
    al.timestamp
  FROM audit_logs al
  JOIN users u ON al.user_ID = u.user_ID
  ORDER BY al.timestamp DESC
";

$result = $mysqli->query($sql);
if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Query failed: ' . $mysqli->error]);
    exit;
}

// Transform rows into what JS expects
$logs = [];
while ($row = $result->fetch_assoc()) {
    $logs[] = [
        'timestamp'   => $row['timestamp'],
        'action'      => $row['action'],
        'admin'       => $row['admin'],
        'target_type' => ucfirst($row['target_type']),
        'target_ID'   => $row['target_ID'],
        'details'     => $row['details'],
        'ip_address'  => $row['ip_address']
    ];
}

echo json_encode($logs, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
