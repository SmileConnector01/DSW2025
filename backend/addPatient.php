<?php
    session_start();
    require_once __DIR__ . "/database.php";
    require_once __DIR__ . "/mailer.php";
    
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");
    ob_start(); // Start output buffering

    // Function to send error response back to the form
    function sendErrorResponse($message) {
        echo json_encode(['success' => false, 'message' => $message]);
        exit;
    }

    // Function to send success response
    function sendSuccessResponse($message, $data = []) {
        echo json_encode(['success' => true, 'message' => $message, 'data' => $data]);
        exit;
    }

    // Validate all required fields are present
    $requiredFields = [
        'patientName', 'patientBirthdate', 'patientLocation', 
        'patientSchool', 'guardianName', 'patientStatus'
    ];

    foreach ($requiredFields as $field) {
        if (empty($_POST[$field])) {
            sendErrorResponse("Please fill in all required fields.");
        }
    }

    // Validate birthdate (age between 0-15 years)
    $birthdate = new DateTime($_POST['patientBirthdate']);
    $today = new DateTime();
    $age = $today->diff($birthdate)->y;

    if ($age < 0 || $age > 15) {
        sendErrorResponse("Patient must be between 0 to 15 years old.");
    }

    // Check if guardian exists (by username or email)
    $guardianIdentifier = trim($_POST['guardianName']);
    $sql = "SELECT patient_ID, full_name, email FROM patients WHERE username = ? OR email = ?";
    $stmt = $mysqli->prepare($sql);

    if (!$stmt) {
        sendErrorResponse("Database error: " . $mysqli->error);
    }

    $stmt->bind_param("ss", $guardianIdentifier, $guardianIdentifier);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        sendErrorResponse("Guardian not found. Please check the username/email.");
    }

    $guardian = $result->fetch_assoc();
    $guardianId = $guardian['patient_ID'];
    $guardianEmail = $guardian['email'];
    $guardianName = $guardian['full_name'];

    // Check if child already exists (by full name, birthday, and guardian ID)
    $sql = "SELECT child_ID FROM children WHERE childFullName = ? AND birthday = ? AND patient_ID = ?";
    $stmt = $mysqli->prepare($sql);

    if (!$stmt) {
        sendErrorResponse("Database error: " . $mysqli->error);
    }

    $stmt->bind_param("ssi", 
        $_POST['patientName'], 
        $_POST['patientBirthdate'], 
        $guardianId
    );
    $stmt->execute();
    $result = $stmt->get_result();

    // Handle file upload for patient records
    $patientRecords = null;
    if (!empty($_FILES['patientRecords']['name'][0])) {
        $uploadedFiles = [];
        $uploadDir = '../uploads/patient_records/';
        
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        foreach ($_FILES['patientRecords']['tmp_name'] as $key => $tmpName) {
            $fileName = basename($_FILES['patientRecords']['name'][$key]);
            $targetPath = $uploadDir . uniqid() . '_' . $fileName;
            
            if (move_uploaded_file($tmpName, $targetPath)) {
                $uploadedFiles[] = $targetPath;
            }
        }
        
        if (!empty($uploadedFiles)) {
            $patientRecords = implode(',', $uploadedFiles);
        }
    }

    $isUpdate = false;
    $childId = null;

    if ($result->num_rows > 0) {
        // Child exists - update the record
        $isUpdate = true;
        $child = $result->fetch_assoc();
        $childId = $child['child_ID'];
        
        $sql = "UPDATE children SET 
                location = ?, 
                school = ?, 
                treatmentStatus = ?, 
                medicalNotes = ?,
                patientRecords = IFNULL(?, patientRecords)
                WHERE child_ID = ?";
        
        $stmt = $mysqli->prepare($sql);
        
        if (!$stmt) {
            sendErrorResponse("Database error: " . $mysqli->error);
        }
        
        $stmt->bind_param("sssssi",
            $_POST['patientLocation'],
            $_POST['patientSchool'],
            $_POST['patientStatus'],
            $_POST['medicalNotes'],
            $patientRecords,
            $childId
        );
        
        if (!$stmt->execute()) {
            sendErrorResponse("Failed to update child information: " . $stmt->error);
        }
    } else {
        // Child doesn't exist - insert new record
        $sql = "INSERT INTO children (
                childFullName, 
                birthday, 
                location, 
                school, 
                treatmentStatus, 
                medicalNotes, 
                patientRecords, 
                patient_ID
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $mysqli->prepare($sql);
        
        if (!$stmt) {
            sendErrorResponse("Database error: " . $mysqli->error);
        }
        
        $stmt->bind_param("sssssssi",
            $_POST['patientName'],
            $_POST['patientBirthdate'],
            $_POST['patientLocation'],
            $_POST['patientSchool'],
            $_POST['patientStatus'],
            $_POST['medicalNotes'],
            $patientRecords,
            $guardianId
        );
        
        if (!$stmt->execute()) {
            sendErrorResponse("Failed to add child: " . $stmt->error);
        }
        
        $childId = $stmt->insert_id;
    }

    // Send confirmation email to guardian
    try {
        $mail->setFrom('noreplysmileconnector@gmail.com', 'SmileConnector Team');
        $mail->addAddress($guardianEmail, $guardianName);
        
        if ($isUpdate) {
            $mail->Subject = 'Child Record Updated - SmileConnector';
            $action = 'updated';
        } else {
            $mail->Subject = 'New Child Added - SmileConnector';
            $action = 'added';
        }
        
        // Birthday formatting
        $formattedBirthdate = date('F j, Y', strtotime($_POST['patientBirthdate']));
        
        // HTML email content
        $mail->Body = "
        <!DOCTYPE html>
        <html lang='en'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Child Record {$action}</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    text-align: justify;
                }
                .header {
                    background-color: #28a745;
                    padding: 20px;
                    text-align: center;
                    border-radius: 5px 5px 0 0;
                }
                .header h1 {
                    color: white;
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 25px;
                    background-color: #f9f9f9;
                    border-radius: 0 0 5px 5px;
                    border: 1px solid #e1e1e1;
                    border-top: none;
                }
                .child-info {
                    background-color: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 15px 0;
                    border: 1px solid #ddd;
                }
                .child-info h3 {
                    color: #3498db;
                    margin-top: 0;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 15px;
                    border-top: 1px solid #eee;
                    font-size: 12px;
                    color: #7f8c8d;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class='header'>
                <h1>Child Record {$action}</h1>
            </div>
            <div class='content'>
                <p>Dear {$guardianName},</p>
                
                <p>This is to confirm that the following child record has been <strong>{$action}</strong> to your account:</p>
                
                <div class='child-info'>
                    <h3>{$_POST['patientName']}</h3>
                    <p><strong>Date of Birth:</strong> {$formattedBirthdate}</p>
                    <p><strong>Location:</strong> {$_POST['patientLocation']}</p>
                    <p><strong>School:</strong> {$_POST['patientSchool']}</p>
                    <p><strong>Treatment Status:</strong> " . strtoupper($_POST['patientStatus']) . "</p>
                </div>
                
                <p>You can view and manage this record in your SmileConnector account.</p>
                <p>If you did not expect this change or notice any incorrect information, please contact our support team immediately.</p>
                
                <p>Thank you for using <strong>SmileConnector</strong>!</p>
                
                <div class='footer'>
                    <p>This is an automated message. Please do not reply directly to this email.</p>
                    <p>&copy; " . date('Y') . " SmileConnector. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        ";

        
        // Plain text version for non-HTML mail clients
        $mail->AltBody = "Child Record {$action}\n\n" .
            "Dear {$guardianName},\n\n" .
            "This is to confirm that the following Child record has been {$action} to your account:\n\n" .
            "Child Name: {$_POST['patientName']}\n" .
            "Date of Birth: {$formattedBirthdate}\n" .
            "Location: {$_POST['patientLocation']}\n" .
            "School: {$_POST['patientSchool']}\n" .
            "Treatment Status: " . strtoupper($_POST['patientStatus']) . "\n\n" .
            "You can view and manage this record in your SmileConnector account.\n\n" .
            "If you did not expect this change or notice any incorrect information, please contact our support team immediately.\n\n" .
            "Thank you for using SmileConnector!";
        
        $mail->send();
        
        if ($isUpdate) {
            session_start();
            $admin = $_SESSION['full_name'] ?? 'Unknown';
            $ip = $_SERVER['REMOTE_ADDR'];
            $action = 'Update';
            $targetType = 'patient';
            $targetId = $childId;
            $details = ($isUpdate ? "Updated" : "Added") . " patient: {$_POST['patientName']} (Guardian: $guardianName, Birthdate: {$_POST['patientBirthdate']})";

            $auditStmt = $mysqli->prepare("INSERT INTO auditlogs (action, admin, target_type, target_ID, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)");
            $auditStmt->bind_param("ssssss", $action, $admin, $targetType, $targetId, $details, $ip);
            $auditStmt->execute();
            $auditStmt->close();
            sendSuccessResponse("Child information updated successfully. A confirmation email has been sent to the guardian.");
        } else {
            // session_start();
            // $admin = $_SESSION['full_name'] ?? 'Unknown';
            // $ip = $_SERVER['REMOTE_ADDR'];
            // $action = 'Create';
            // $targetType = 'patient';
            // $targetId = $childId;
            // $details = ($isUpdate ? "Updated" : "Added") . " patient: {$_POST['patientName']} (Guardian: $guardianName, Birthdate: {$_POST['patientBirthdate']})";

            // $auditStmt = $mysqli->prepare("INSERT INTO auditlogs (action, admin, target_type, target_ID, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)");
            // $auditStmt->bind_param("ssssss", $action, $admin, $targetType, $targetId, $details, $ip);
            // $auditStmt->execute();
            // $auditStmt->close();
            sendSuccessResponse("Child added successfully. A confirmation email has been sent to the guardian.");
        }
        
    } catch (Exception $e) {
        // Log the error but don't fail the operation
        error_log("Mailer Error: " . $mail->ErrorInfo);
        
        if ($isUpdate) {
            sendSuccessResponse("Child information updated successfully, but we couldn't send the confirmation email.");
        } else {
            sendSuccessResponse("Child added successfully, but we couldn't send the confirmation email.");
        }
    }
    ob_end_flush(); // Flush output buffer
?>