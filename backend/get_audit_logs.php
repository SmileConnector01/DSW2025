<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
$conn = require_once __DIR__ . '/database.php';

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = 10;
$offset = ($page - 1) * $limit;

$sql = "SELECT a.*, u.full_name AS admin_name 
        FROM audit_logs a 
        LEFT JOIN users u ON a.user_ID = u.user_ID 
        ORDER BY timestamp DESC 
        LIMIT ? OFFSET ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $limit, $offset);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
$conn->close();
