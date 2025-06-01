<?php
    // Allow requests from any origin (for testing)
    header("Access-Control-Allow-Origin: *");
    header('Content-Type: application/json');
    // this returns the mysqli instance
    $conn = require_once __DIR__ . '/database.php';

    $type = $_GET['type'] ?? '';

    if ($type === 'patient_served') {
        // give your count column a friendly name
        $sql = "SELECT COUNT(treatmentStatus) AS served_count FROM children WHERE treatmentStatus = 'completed';";
    }
    elseif($type === 'school'){
        // give your count column a friendly name
        $sql = "SELECT COUNT(school) AS school FROM past_event;";
    }
    else if($type === 'students') {
    $sql = "SELECT SUM(students) AS students FROM past_event;";
    } 
    elseif($type === 'treatments'){
        // give your count column a friendly name
        $sql = "SELECT SUM(treatments) AS treatment FROM past_event;";
    }
    elseif($type === 'teledentistry'){
        // give your count column a friendly name
        $sql = "SELECT COUNT(*) AS teledentistrycount FROM teledentistry;";
    }
    else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid data type"]);
        exit();
    }

    $result = $conn->query($sql);

    $row = $result->fetch_assoc();  
    echo json_encode($row);         

    $conn->close();
