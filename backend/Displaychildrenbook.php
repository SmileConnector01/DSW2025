<?php 
session_start();

header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

$conn = require_once __DIR__ . '/database.php';

// If no PatientID was ever stored, session will be empty:
if (!isset($_SESSION['PatientID'])) {
    echo json_encode([
      "status"  => "error",
      "message" => "No PatientID in session"
    ]);
    exit();
}

$patientID = $_SESSION['PatientID'];

$sql = "SELECT
          patients.patient_ID,
          children.childFullName
        FROM
          patients
        JOIN
          children
          ON patients.patient_ID = children.patient_ID
        WHERE
          patients.patient_ID = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $patientID);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);

$stmt->close();
$conn->close();
?>
