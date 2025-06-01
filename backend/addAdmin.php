<?php
ob_start();
session_start();

require_once __DIR__ . "/database.php";
require_once __DIR__ . "/mailer.php";

function generateRandomString($length = 20) {
    $characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}

function generateUsername($fullName, $mysqli) {
    $firstName = explode(' ', $fullName)[0];
    $username = '';
    $isUnique = false;
    
    while (!$isUnique) {
        $randomNumbers = rand(1000, 9999);
        $username = $firstName . $randomNumbers;
        
        $checkSql = "SELECT username FROM users WHERE username = ?";
        $stmt = $mysqli->prepare($checkSql);
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $isUnique = true;
        }
    }
    
    return $username;
}

ob_end_clean();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    if (empty($_POST['adminName']) || empty($_POST['adminEmail'])) {
        throw new Exception('Full name and email are required');
    }

    if (!filter_var($_POST['adminEmail'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }

    $adminName = trim($_POST['adminName']);
    $adminEmail = trim($_POST['adminEmail']);
    $adminTitle = isset($_POST['adminTitle']) ? $_POST['adminTitle'] : 'Mr';
    $userType = 'admin';
    
    if (isset($_POST['permissions']) && $_POST['permissions'] === 'super_admin') {
        $userType = 'superadmin';
    }

    // Check if email exists and get current user info
    $checkSql = "SELECT user_ID, user_type, ispasswordset FROM users WHERE email = ?";
    $stmt = $mysqli->prepare($checkSql);
    if (!$stmt) {
        throw new Exception('Database error: ' . $mysqli->error);
    }
    
    $stmt->bind_param("s", $adminEmail);
    $stmt->execute();
    $result = $stmt->get_result();
    $existingUser = $result->fetch_assoc();

    if ($existingUser) {
        // Check for duplicate email or full name among admins with password set
        $dupCheckSql = "SELECT user_ID FROM users WHERE (email = ? OR full_name = ?) AND user_type = 'admin' AND ispasswordset = 1 AND user_ID != ?";
        $dupStmt = $mysqli->prepare($dupCheckSql);
        if (!$dupStmt) {
            throw new Exception('Database error: ' . $mysqli->error);
        }
        $dupStmt->bind_param("ssi", $adminEmail, $adminName, $existingUser['user_ID']);
        $dupStmt->execute();
        $dupResult = $dupStmt->get_result();
        if ($dupResult->num_rows > 0) {
            throw new Exception('The current email is already used in the system.');
        }

        // If user exists but is not an admin type
        if ($existingUser['user_type'] !== 'admin' && $existingUser['user_type'] !== 'superadmin') {
            throw new Exception('This email belongs to a user in the system. Please use a different email.');
        }

        // Update existing admin
        $updateSql = "UPDATE users SET 
            full_name = ?, 
            user_type = ? 
            WHERE email = ?";
        $stmt = $mysqli->prepare($updateSql);
        if (!$stmt) {
            throw new Exception('Database error: ' . $mysqli->error);
        }
        $stmt->bind_param("sss", $adminName, $userType, $adminEmail);

        if (!$stmt->execute()) {
            throw new Exception('Failed to update admin: ' . $stmt->error);
        }

        $adminId = $existingUser['user_ID'];
        $isUpdate = true;
    } else {
        // Create new admin
        $resetOtp = generateRandomString(20);
        $username = generateUsername($adminName, $mysqli);

        $insertSql = "INSERT INTO users (
            username, 
            full_name, 
            email, 
            user_type, 
            reset_otp, 
            ispasswordset
        ) VALUES (?, ?, ?, ?, ?, 0)";

        $stmt = $mysqli->prepare($insertSql);
        if (!$stmt) {
            throw new Exception('Database error: ' . $mysqli->error);
        }

        $stmt->bind_param("sssss", 
            $username,
            $adminName,
            $adminEmail,
            $userType,
            $resetOtp
        );

        if (!$stmt->execute()) {
            throw new Exception('Failed to add admin: ' . $stmt->error);
        }

        $adminId = $mysqli->insert_id;
        $isUpdate = false;
    }

    // Send appropriate email
    try {
        $mail->setFrom('noreplysmileconnector@gmail.com', 'SmileConnector Portal');
        $mail->addAddress($adminEmail, $adminName);
        
        if ($isUpdate) {
            // Update email
            $mail->Subject = 'Your Admin Role Has Been Updated';
            $mail->Body = "
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; }
                    .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
                </style>
            </head>
            <body>
                <div class='header'>
                    <h1>Account Update Notification</h1>
                </div>
                <div class='content'>
                    <p>Dear {$adminTitle} {$adminName},</p>
                    <p>Your administrator account has been updated with the following changes:</p>
                    <p><strong>New Role:</strong> " . ucfirst($userType) . "</p>
                    <p>You can continue to access the system with your existing credentials.</p>
                    <p>If you did not request this change or need assistance, please contact the system administrator.</p>
                    <p>Best regards,<br>The SmileConnector Team</p>
                </div>
                <div class='footer'>
                    <p>This is an automated message. Please do not reply directly.</p>
                </div>
            </body>
            </html>
            ";
            
            $mail->AltBody = "Account Update Notification\n\n" .
                "Dear {$adminTitle} {$adminName},\n\n" .
                "Your administrator account has been updated with the following changes:\n" .
                "New Role: " . ucfirst($userType) . "\n\n" .
                "You can continue to access the system with your existing credentials.\n\n" .
                "Best regards,\nThe SmileConnector Team";
        } else {
            // New admin email (original welcome email)
            $mail->Subject = 'Welcome to SmileConnector as ' . ($userType === 'superadmin' ? 'Super Admin' : 'Admin');
            $mail->Body = "
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; }
                    .login-info { background-color: #f8f9fa; padding: 15px; border: 1px solid #ddd; margin: 15px 0; }
                    .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
                </style>
            </head>
            <body>
                <div class='header'>
                    <h1>Welcome to SmileConnector!</h1>
                </div>
                <div class='content'>
                    <p>Dear {$adminTitle} {$adminName},</p>
                    <p>You have been added as a <strong>" . ($userType === 'superadmin' ? 'Super Admin' : 'Admin') . "</strong> to the SmileConnector system.</p>
                    
                    <div class='login-info'>
                        <p>Your temporary login credentials:</p>
                        <p><strong>Email:</strong> {$adminEmail}</p>
                        <p><strong>Temporary Password:</strong> {$resetOtp}</p>
                    </div>
                    
                    <p>Please use these credentials to log in to the system. You will be prompted to set your own password on first login.</p>
                    
                    <p>Best regards,<br>The SmileConnector Team</p>
                </div>
                <div class='footer'>
                    <p>This is an automated message. Please do not reply directly.</p>
                </div>
            </body>
            </html>
            ";
            
            $mail->AltBody = "Welcome to SmileConnector!\n\n" .
                "Dear {$adminTitle} {$adminName},\n\n" .
                "You have been added as a " . ($userType === 'superadmin' ? 'Super Admin' : 'Admin') . " to the SmileConnector system.\n\n" .
                "Your temporary login credentials:\n" .
                "Email: {$adminEmail}\n" .
                "Temporary Password: {$resetOtp}\n\n" .
                "Please use these credentials to log in to the system.\n\n" .
                "Best regards,\nThe SmileConnector Team";
        }
        
        $mail->send();
        
        $response = [
            'success' => true, 
            'message' => $isUpdate 
                ? 'Admin updated successfully. Notification email sent.' 
                : 'Admin added successfully. Welcome email sent with login instructions.',
            'adminId' => $adminId,
            'isUpdate' => $isUpdate
        ];
        
    } catch (Exception $e) {
        error_log("Mailer Error: " . $mail->ErrorInfo);
        
        $response = [
            'success' => true, 
            'message' => $isUpdate 
                ? 'Admin updated successfully, but notification email could not be sent.' 
                : 'Admin added successfully, but welcome email could not be sent.',
            'adminId' => $adminId,
            'isUpdate' => $isUpdate
        ];
    }

} catch (Exception $e) {
    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];
}

header('Content-Type: application/json');
echo json_encode($response);
exit;
?>