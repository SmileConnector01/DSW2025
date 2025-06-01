<?php

// Safely include the database connection
$databaseFile = __DIR__ . '/database.php';

if (!file_exists($databaseFile)) {
    http_response_code(500);
    echo "Error: Database configuration file not found.";
    exit;
}

$conn = require $databaseFile;

// Validate the database connection
if (!$conn || !($conn instanceof mysqli)) {
    http_response_code(500);
    echo "Error: Invalid database connection.";
    exit;
}

// Insert only to trigger auto-increment ID and current timestamp
$sql = "INSERT INTO teledentistry () VALUES ()";

if ($conn->query($sql) === TRUE) {
    echo "Call logged with ID: " . $conn->insert_id;
} else {
    http_response_code(500);
    echo "Error inserting call: " . $conn->error;
}

$conn->close();
?>
