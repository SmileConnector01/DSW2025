<?php 
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (isset($_POST['PatientID'])) {
        $_SESSION['PatientID'] = intval($_POST['PatientID']);
        echo json_encode([
            "status" => "PatientID stored",
            "patientID" => $_SESSION['PatientID']
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "PatientID not set."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
}
?>
