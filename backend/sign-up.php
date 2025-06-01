<?php

    session_start();

    require_once __DIR__ . "/database.php";
    require_once __DIR__ . "/mailer.php";

    try {
        if (!isset($_SESSION["email"])) {
            throw new Exception("No email in session. Please login again.");
        }

        // Validate password requirements
        if (strlen($_POST["password"]) < 8) {
            throw new Exception("Password must be at least 8 characters");
        }

        if (!preg_match("/[a-z]/i", $_POST["password"])) {
            throw new Exception("Password must contain at least one letter");
        }

        if (!preg_match("/[0-9]/", $_POST["password"])) {
            throw new Exception("Password must contain at least one number");
        }

        if ($_POST["password"] !== $_POST["confirmPassword"]) {
            throw new Exception("Passwords must match");
        }

        $password_hash = password_hash($_POST["password"], PASSWORD_DEFAULT);
        $mysqli = require __DIR__ . "/database.php";

        // Update password
        $sql = "UPDATE users SET password_hash = ?, ispasswordset = 1 WHERE email = ?";
        $stmt = $mysqli->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Database error: " . $mysqli->error);
        }

        $stmt->bind_param("ss", $password_hash, $_SESSION["email"]);

        if (!$stmt->execute()) {
            throw new Exception("Failed to update password: " . $stmt->error);
        }

        // Fetch user info
        $get_user_sql = "SELECT user_ID, username, full_name FROM users WHERE email = ?";
        $user_stmt = $mysqli->prepare($get_user_sql);
        
        if (!$user_stmt) {
            throw new Exception("Database error: " . $mysqli->error);
        }

        $user_stmt->bind_param("s", $_SESSION["email"]);
        $user_stmt->execute();
        $user_result = $user_stmt->get_result();

        if (!$user = $user_result->fetch_assoc()) {
            throw new Exception("User not found");
        }

        $_SESSION["user_ID"] = $user["user_ID"];
        $_SESSION["username"] = $user["username"];
        $full_name = $user["full_name"];
        $username = $user["username"];
        $email = $_SESSION["email"];

        // Update last login in patients table
        $currentTime = (new DateTime())->format('Y-m-d H:i:s');
        $updateLogin = $mysqli->prepare("UPDATE patients SET last_login = ? WHERE user_ID = ?");
        
        if ($updateLogin) {
            $updateLogin->bind_param("si", $currentTime, $user["user_ID"]);
            $updateLogin->execute();
        }

        // Send welcome email
        try {
            $mail->setFrom('noreplysmileconnector@gmail.com', 'SmileConnector Portal');
            $mail->addAddress($email, $full_name);
            $mail->Subject = 'Thank you for joining us, ' . $full_name . '!';

            // HTML email content
            $mail->Body = "
            <!DOCTYPE html>
            <html lang='en'>
            <head>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <title>Welcome to SmileConnector</title>
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
                        background-color: #2c3e50;
                        padding: 20px;
                        text-align: center;
                        border-radius: 5px 5px 0 0;
                    }
                    .header h1 {
                        color: white;
                        margin: 0;
                        font-size: 20px;
                    }
                    .content {
                        padding: 25px;
                        background-color: #f9f9f9;
                        border-radius: 0 0 5px 5px;
                        border: 1px solid #e1e1e1;
                        border-top: none;
                    }
                    .username-info {
                        background-color: #f8f9fa;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 15px 0;
                        border: 1px solid #ddd;
                        box-shadow: 0 0 5px 0 grey;
                    }
                    .username-info h2 {
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
                    <h1>Welcome to SmileConnector!</h1>
                </div>
                <div class='content'>
                    <p>Dear <strong>$full_name</strong>,</p>
                    <p>We're excited to welcome you to the SmileConnector family! Your account has been successfully created.</p>
                    
                    <div class='username-info'>
                        <p>Your username is:</p>
                        <h2>$username</h2>
                    </div>
                    <p>Feel free to explore your dashboard, book appointments, and manage your children records conveniently.</p>

                    <p>If you have any questions or need help, just reach out to us at 
                    <a href='mailto:support@smileconnector.com'>support@smileconnector.com</a>.</p>

                    <p>Thank you for choosing SmileConnector. We're glad to have you with us!</p>
                    
                    <p>Warm regards,<br>
                    <strong>The SmileConnector Team</strong></p>
                    <div class='footer'>
                        <p>This is an automated message. Please do not reply directly to this email.</p>
                        <p>&copy; " . date('Y') . " SmileConnector. All rights reserved.</p>
                    </div>
                </div>                    
            </body>
            </html>
            ";
            
            $mail->AltBody = "Welcome to SmileConnector!\n\n" .
                "Dear $full_name,\n\n" .
                "Your account has been created successfully.\n\n" .
                "Your username: $username\n\n" .
                "Thank you for joining us!\n\n" .
                "Warm regards,\n" .
                "The SmileConnector Security Team\n\n" .
                "© " . date('Y') . " SmileConnector. All rights reserved.";

            $mail->send();
        } catch (Exception $e) {
            error_log("Mailer Error (welcome): " . $mail->ErrorInfo);
        }

        // Prepare success response
        $response = [
            'success' => true,
            'message' => 'Registration completed successfully! Redirecting to dashboard...',
            'user_type' => 'patient',
            'full_name' => $full_name,
            'email' => $email,
            'username' => $username
        ];

    } catch (Exception $e) {
        // Prepare error response
        $response = [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }

    
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
?>