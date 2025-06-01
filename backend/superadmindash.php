<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
$conn = require_once __DIR__ . '/database.php';

$type = $_GET['type'] ?? '';

if ($type === 'children') {
    $sql = "SELECT c.*, p.full_name as guardian_username, p.email as guardian_email, 
                   p.phone_number as guardian_phone, p.address as guardian_address
            FROM children c
            JOIN patients p ON c.patient_ID = p.patient_ID";
} 
elseif ($type === 'admin') {
    $sql = "SELECT * FROM admin";
}
else {
    http_response_code(400);
    echo json_encode(["error" => "Invalid data type"]);
    exit();
}

$result = $conn->query($sql);
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
$conn->close();