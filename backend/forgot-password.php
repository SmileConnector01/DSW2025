<?php
    // Start session at the very beginning of the script before any output
    session_start();

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $mysqli = require_once __DIR__ . "/database.php";
        $mail = require_once __DIR__ . "/mailer.php";
        
        $email = $mysqli->real_escape_string($_POST["email"]);
        
        // Check if email exists in users table
        $sql = "SELECT * FROM users WHERE email = '$email'";
        $result = $mysqli->query($sql);
        
        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            
            // Generate a random 4-digit OTP
            $otp = sprintf("%04d", rand(0, 9999));
            
            // Generate a token
            $token = bin2hex(random_bytes(16));
            $token_hash = hash("sha256", $token);
            
            // Set expiration time to 5 minutes from now
            $expires_at = date("Y-m-d H:i:s", time() + 300);
            
            // Update user record with reset data
            $update_sql = "UPDATE users 
                        SET reset_token_hash = '$token_hash',
                            reset_token_expiretime = '$expires_at',
                            reset_otp = '$otp',
                            reset_otp_expires_at = '$expires_at'
                        WHERE user_ID = {$user['user_ID']}";
            
            $mysqli->query($update_sql);
            
            try {
                // Configure email
                $mail->setFrom('noreplysmileconnector@gmail.com', 'SmileConnector Security');
                $mail->addAddress($email, $user['full_name']);
                $mail->Subject = 'Your SmileConnector Password Reset Verification Code';

                // HTML email content
                $mail->Body = "
                <!DOCTYPE html>
                <html lang='en'>
                <head>
                    <meta charset='UTF-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <title>Password Reset</title>
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
                            background-color: #4a90e2;
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
                            text-align: justify;
                        }
                        .otp-code {
                            font-size: 28px;
                            letter-spacing: 5px;
                            color: #2c3e50;
                            text-align: center;
                            margin: 25px 0;
                            padding: 15px;
                            background-color: #ecf0f1;
                            border-radius: 5px;
                            font-weight: bold;
                        }
                        .footer {
                            margin-top: 30px;
                            padding-top: 15px;
                            border-top: 1px solid #eee;
                            font-size: 12px;
                            color: #7f8c8d;
                            text-align: center;
                        }
                        .button {
                            display: inline-block;
                            padding: 10px 20px;
                            background-color: #4a90e2;
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 15px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class='header'>
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class='content'>
                        <p>Hello {$user['full_name']},</p>
                        
                        <p>We received a request to reset your <strong>SmileConnector account password.</strong></p> 
                        Please use the following verification code to proceed:</p>
                        
                        <div class='otp-code'>{$otp}</div>
                        
                        <p>This security code will expire in <strong>5 minutes</strong>. 
                        For your protection, please do not share this code with anyone.</p>
                        
                        <p>If you didn't request a password reset, please ignore this email or 
                        contact our support team immediately at <a href='mailto:support@smileconnector.com'>support@smileconnector.com</a>.</p>
                        
                        <p>Thank you,<br>
                        <strong>SmileConnector Team</strong></p>
                        
                        <div class='footer'>
                            <p>This is an automated message. Please do not reply directly to this email.</p>
                            <p>&copy; " . date('Y') . " SmileConnector. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                ";

                // Plain text version for non-HTML mail clients
                $mail->AltBody = "Password Reset Request\n\n" .
                    "Hello {$user['full_name']},\n\n" .
                    "We received a request to reset your SmileConnector account password.\n\n" .
                    "Your verification code is: {$otp}\n\n" .
                    "This code will expire in 5 minutes. Do not share this code with anyone.\n\n" .
                    "If you didn't request this password reset, please ignore this email or contact our support team.\n\n" .
                    "Thank you,\n" .
                    "The SmileConnector Security Team\n\n" .
                    "© " . date('Y') . " SmileConnector. All rights reserved.";
                
                $mail->send();
                
                // Store email and token in session
                $_SESSION["reset_email"] = $email;
                $_SESSION["reset_token"] = $token;
                
                // Redirect to OTP screen
                header("Location: ../logins/login.html?screen=otp&status=sent");
                exit;
                
            } catch (Exception $e) {
                // Log the error
                error_log("Mailer Error: " . $mail->ErrorInfo);
                
                // Redirect with error
                header("Location: ../logins/login.html?screen=forgot&error=mailer");
                exit;
            }
        } else {
            // Email not found
            header("Location: ../logins/login.html?screen=forgot&error=not_found");
            exit;
        }
    }

    // If someone accesses this file directly
    header("Location: ../logins/login.html");
    exit;
?>