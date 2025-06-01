<?php
session_start();
require_once __DIR__ . "/database.php";
require_once __DIR__ . "/mailer.php";

try {
    if (!isset($_POST['email']) || empty($_POST['email'])) {
        throw new Exception("Email is required");
    }

    $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
    if (!$email) {
        throw new Exception("Please enter a valid email address");
    }

    $mysqli = require __DIR__ . "/database.php";

    // Check if email already exists in users table
    $check_email_sql = "SELECT email FROM users WHERE email = ?";
    $stmt = $mysqli->prepare($check_email_sql);
    if (!$stmt) {
        throw new Exception("Database error: " . $mysqli->error);
    }
    
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        header("Location: ../logins/EmailRegister.html?error=email_exists&email=" . urlencode($email));
        exit;
    }

    // Generate 6-digit OTP
    $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    $expiry_time = date('Y-m-d H:i:s', strtotime('+10 minutes')); // OTP expires in 10 minutes

    // Check if email already exists in email_verification table
    $check_verification_sql = "SELECT email FROM email_verification WHERE email = ?";
    $check_stmt = $mysqli->prepare($check_verification_sql);
    if (!$check_stmt) {
        throw new Exception("Database error: " . $mysqli->error);
    }
    
    $check_stmt->bind_param("s", $email);
    $check_stmt->execute();
    $verification_result = $check_stmt->get_result();

    if ($verification_result->num_rows > 0) {
        // Update existing record
        $update_sql = "UPDATE email_verification SET otp = ?, expires_at = ? WHERE email = ?";
        $update_stmt = $mysqli->prepare($update_sql);
        if (!$update_stmt) {
            throw new Exception("Database error: " . $mysqli->error);
        }
        $update_stmt->bind_param("sss", $otp, $expiry_time, $email);
        if (!$update_stmt->execute()) {
            throw new Exception("Failed to update verification code: " . $update_stmt->error);
        }
    } else {
        // Insert new record
        $insert_sql = "INSERT INTO email_verification (email, otp, expires_at) VALUES (?, ?, ?)";
        $insert_stmt = $mysqli->prepare($insert_sql);
        if (!$insert_stmt) {
            throw new Exception("Database error: " . $mysqli->error);
        }
        $insert_stmt->bind_param("sss", $email, $otp, $expiry_time);
        if (!$insert_stmt->execute()) {
            throw new Exception("Failed to store verification code: " . $insert_stmt->error);
        }
    }

    // Send OTP email
    try {
        $mail->setFrom('noreplysmileconnector@gmail.com', 'SmileConnector Portal');
        $mail->addAddress($email);
        $mail->Subject = 'Your SmileConnector Verification Code';

        // HTML email content
        $mail->Body = "
        <!DOCTYPE html>
        <html lang='en'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Email Verification</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }
                .container {
                    background: white;
                    border-radius: 10px;
                    padding: 30px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #1565c0;
                    margin: 0;
                    font-size: 24px;
                }
                .otp-code {
                    background: #f6fcfd;
                    border: 2px dashed #1565c0;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    margin: 20px 0;
                }
                .otp-code h2 {
                    color: #1565c0;
                    font-size: 36px;
                    margin: 0;
                    letter-spacing: 3px;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    font-size: 12px;
                    color: #7f8c8d;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Email Verification</h1>
                </div>
                
                <p>Hello,</p>
                <p>Welcome to SmileConnector! To complete your registration, please use the verification code below:</p>
                
                <div class='otp-code'>
                    <h2>$otp</h2>
                </div>
                
                <p><strong>Important:</strong> This code will expire in 10 minutes for security reasons.</p>
                <p>If you didn't request this verification code, please ignore this email.</p>
                
                <p>Best regards,<br>
                <strong>The SmileConnector Team</strong></p>
                
                <div class='footer'>
                    <p>This is an automated message. Please do not reply directly to this email.</p>
                    <p>&copy; " . date('Y') . " SmileConnector. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        ";
        
        $mail->AltBody = "Your SmileConnector verification code is: $otp\n\n" .
            "This code will expire in 10 minutes.\n\n" .
            "If you didn't request this code, please ignore this email.\n\n" .
            "Best regards,\n" .
            "The SmileConnector Team";

        $mail->send();
        
        // Store email in session for next steps
        $_SESSION['signup_email'] = $email;
        
        header("Location: ../logins/EmailRegister.html?screen=otp&status=otp_sent&email=" . urlencode($email));
        exit;
        
    } catch (Exception $e) {
        error_log("Mailer Error (OTP): " . $mail->ErrorInfo);
        header("Location: ../logins/EmailRegister.html?error=mailer_error&email=" . urlencode($email));
        exit;
    }

} catch (Exception $e) {
    header("Location: ../logins/EmailRegister.html?error=" . urlencode($e->getMessage()) . "&email=" . urlencode($_POST['email'] ?? ''));
    exit;
}
?>