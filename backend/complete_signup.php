<?php
session_start();
require_once __DIR__ . "/database.php";
require_once __DIR__ . "/mailer.php";

try {
    // Validate required fields
    if (!isset($_POST['email']) || empty($_POST['email'])) {
        throw new Exception("Email is required");
    }
    
    if (!isset($_POST['firstName']) || empty($_POST['firstName'])) {
        throw new Exception("First name is required");
    }
    
    if (!isset($_POST['lastName']) || empty($_POST['lastName'])) {
        throw new Exception("Last name is required");
    }
    
    if (!isset($_POST['password']) || empty($_POST['password'])) {
        throw new Exception("Password is required");
    }
    
    if (!isset($_POST['confirmPassword']) || empty($_POST['confirmPassword'])) {
        throw new Exception("Password confirmation is required");
    }

    $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
    $firstName = trim($_POST['firstName']);
    $lastName = trim($_POST['lastName']);
    $password = $_POST['password'];
    $confirmPassword = $_POST['confirmPassword'];

    if (!$email) {
        throw new Exception("Invalid email address");
    }

    // Validate email was verified
    if (!isset($_SESSION['verified_email']) || $_SESSION['verified_email'] !== $email) {
        header("Location: ../logins/EmailRegister.html?error=verification_required&email=" . urlencode($email));
        exit;
    }

    // Validate password requirements
    if (strlen($password) < 8) {
        header("Location: ../logins/EmailRegister.htmlr?error=tooshort&screen=complete&email=" . urlencode($email));
        exit;
    }

    if (!preg_match("/[a-z]/i", $password)) {
        header("Location: ../logins/EmailRegister.html?error=noletter&screen=complete&email=" . urlencode($email));
        exit;
    }

    if (!preg_match("/[A-Z]/", $password)) {
        header("Location: ../logins/EmailRegister.html?error=nouppercase&screen=complete&email=" . urlencode($email));
        exit;
    }

    if (!preg_match("/[0-9]/", $password)) {
        header("Location: ../logins/EmailRegister.html?error=nonumber&screen=complete&email=" . urlencode($email));
        exit;
    }

    if ($password !== $confirmPassword) {
        header("Location: ../logins/EmailRegister.html?error=nomatch&screen=complete&email=" . urlencode($email));
        exit;
    }

    $mysqli = require __DIR__ . "/database.php";

    // Check if email already exists in users table (double check)
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

    // Generate unique username
    $baseUsername = strtolower($firstName);
    $username = $baseUsername;
    
    $check_username_sql = "SELECT username FROM users WHERE username = ?";
    $stmt = $mysqli->prepare($check_username_sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $username_result = $stmt->get_result();

    while ($username_result->num_rows > 0) {
        $randomNumbers = rand(1000, 9999);
        $username = $baseUsername . $randomNumbers;
        $stmt = $mysqli->prepare($check_username_sql);
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $username_result = $stmt->get_result();
    }

    // Hash password
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    $fullName = $firstName . ' ' . $lastName;

    // Insert new user
    $insert_sql = "INSERT INTO users (username, full_name, email, password_hash, user_type, ispasswordset) VALUES (?, ?, ?, ?, 'patient', 1)";
    $stmt = $mysqli->prepare($insert_sql);
    if (!$stmt) {
        throw new Exception("Database error: " . $mysqli->error);
    }

    $stmt->bind_param("ssss", $username, $fullName, $email, $password_hash);
    if (!$stmt->execute()) {
        throw new Exception("Failed to create account: " . $stmt->error);
    }

    $user_id = $mysqli->insert_id;

    // Set session variables
    $_SESSION['user_ID'] = $user_id;
    $_SESSION['username'] = $username;
    $_SESSION['email'] = $email;
    $_SESSION['full_name'] = $fullName;

    // Insert into patients table for last_login tracking
    $currentTime = (new DateTime())->format('Y-m-d H:i:s');
    $insert_patient_sql = "INSERT INTO patients (last_login) VALUES (?)";
    $patient_stmt = $mysqli->prepare($insert_patient_sql);
    if ($patient_stmt) {
        $patient_stmt->bind_param("is", $currentTime);
        $patient_stmt->execute();
    }

    // Clean up email verification record
    $cleanup_sql = "DELETE FROM email_verification WHERE email = ?";
    $cleanup_stmt = $mysqli->prepare($cleanup_sql);
    if ($cleanup_stmt) {
        $cleanup_stmt->bind_param("s", $email);
        $cleanup_stmt->execute();
    }
    // Fetch patient_id for redirect
    $getPatientId = $mysqli->prepare("SELECT patient_id FROM patients WHERE user_ID = ?");
    $getPatientId->bind_param("i", $user_id);
    $getPatientId->execute();
    $getPatientIdResult = $getPatientId->get_result();
    $patientId = null;
    if ($row = $getPatientIdResult->fetch_assoc()) {
        $patientId = $row['patient_id'];
    }
    // Send welcome email
    try {
        $mail->setFrom('noreplysmileconnector@gmail.com', 'SmileConnector Portal');
        $mail->addAddress($email, $fullName);
        $mail->Subject = 'Welcome to SmileConnector, ' . $firstName . '!';

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
                    background-color: #f4f4f4;
                }
                .container {
                    background: white;
                    border-radius: 10px;
                    padding: 30px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }
                .header {
                    background-color: #00796b;
                    padding: 20px;
                    text-align: center;
                    border-radius: 8px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: white;
                    margin: 0;
                    font-size: 24px;
                }
                .welcome-message {
                    text-align: center;
                    margin: 20px 0;
                }
                .username-info {
                    background-color: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #00796b;
                }
                .username-info h2 {
                    color: #00796b;
                    margin-top: 0;
                    font-size: 18px;
                }
                .features {
                    margin: 25px 0;
                }
                .features ul {
                    list-style: none;
                    padding: 0;
                }
                .features li {
                    padding: 8px 0;
                    padding-left: 25px;
                    position: relative;
                }
                .features li::before {
                    content: '✓';
                    position: absolute;
                    left: 0;
                    color: #4CAF50;
                    font-weight: bold;
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
                    <h1>Welcome to SmileConnector!</h1>
                </div>
                
                <div class='welcome-message'>
                    <p>Dear <strong>$fullName</strong>,</p>
                    <p>Congratulations! Your SmileConnector account has been successfully created.</p>
                </div>
                
                <div class='username-info'>
                    <h2>Your Account Details</h2>
                    <p><strong>Username:</strong> $username</p>
                    <p><strong>Email:</strong> $email</p>
                </div>
                
                <div class='features'>
                    <h3>What you can do now:</h3>
                    <ul>
                        <li>Book and manage appointments</li>
                        <li>View your dental history</li>
                        <li>Manage children's records</li>
                        <li>Receive appointment reminders</li>
                        <li>Access your treatment plans</li>
                    </ul>
                </div>

                <p>If you have any questions or need assistance, our support team is here to help at 
                <a href='mailto:support@smileconnector.com' style='color: #00796b;'>support@smileconnector.com</a>.</p>

                <p>Thank you for choosing SmileConnector. We look forward to helping you maintain your beautiful smile!</p>
                
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
        
        $mail->AltBody = "Welcome to SmileConnector!\n\n" .
            "Dear $fullName,\n\n" .
            "Your account has been created successfully.\n\n" .
            "Username: $username\n" .
            "Email: $email\n\n" .
            "You can now:\n" .
            "- Book and manage appointments\n" .
            "- View your dental history\n" .
            "- Manage children's records\n" .
            "- Receive appointment reminders\n\n" .
            "Thank you for joining SmileConnector!\n\n" .
            "Best regards,\n" .
            "The SmileConnector Team\n\n" .
            "© " . date('Y') . " SmileConnector. All rights reserved.";

        $mail->send();
    } catch (Exception $e) {
        error_log("Mailer Error (welcome): " . $mail->ErrorInfo);
    }

    // Clear verification session
    unset($_SESSION['verified_email']);
    unset($_SESSION['signup_email']);

    // After fetching $patientId
    header("Location: ../dashboard/patient.html?username=" . urlencode($fullName) .
        "&email=" . urlencode($email) .
        "&patient_id=" . urlencode($patientId));
    exit;

} catch (Exception $e) {
    $email = $_POST['email'] ?? '';
    header("Location: ../logins/EmailRegister.html?error=" . urlencode($e->getMessage()) . "&screen=complete&email=" . urlencode($email));
    exit;
}
?>