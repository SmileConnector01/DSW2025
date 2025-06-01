<?php
// Start output buffering and suppress errors
ob_start();
error_reporting(0);
ini_set('display_errors', 0);

session_start();
require_once __DIR__ . "/database.php";
require_once __DIR__ . "/mailer.php";

// Clean any previous output
ob_end_clean();

// Check if this is a valid password setup session
if (!isset($_SESSION["setup_admin"]) || !$_SESSION["setup_admin"]) {
    die(json_encode(["success" => false, "message" => "Invalid session"]));
}

// Validate inputs
if (!isset($_POST["password"], $_POST["confirmPassword"])) {
    die(json_encode(["success" => false, "message" => "Missing required fields"]));
}

// Validate password requirements
if (strlen($_POST["password"]) < 8) {
    die(json_encode(["success" => false, "message" => "Password must be at least 8 characters"]));
}

if (!preg_match("/[a-z]/i", $_POST["password"])) {
    die(json_encode(["success" => false, "message" => "Password must contain at least one letter"]));
}

if (!preg_match("/[0-9]/", $_POST["password"])) {
    die(json_encode(["success" => false, "message" => "Password must contain at least one number"]));
}

if ($_POST["password"] !== $_POST["confirmPassword"]) {
    die(json_encode(["success" => false, "message" => "Passwords must match"]));
}

// Database connection
$mysqli = require __DIR__ . "/database.php";
if ($mysqli->connect_error) {
    die(json_encode(["success" => false, "message" => "Database connection failed"]));
}

// Main processing
try {
    $password_hash = password_hash($_POST["password"], PASSWORD_DEFAULT);
    $user_id = $_SESSION["user_ID"];
    $email = $_SESSION["email"];

    // Update password
    $sql = "UPDATE users SET password_hash = ?, reset_otp = NULL, ispasswordset = 1 WHERE user_ID = ?";
    $stmt = $mysqli->prepare($sql);
    if (!$stmt) {
        throw new Exception("Database error: " . $mysqli->error);
    }

    $stmt->bind_param("si", $password_hash, $user_id);

    if (!$stmt->execute()) {
        throw new Exception("Password update failed: " . $stmt->error);
    }

    // Get user info
    $get_user_sql = "SELECT username, full_name, user_type FROM users WHERE user_ID = ?";
    $user_stmt = $mysqli->prepare($get_user_sql);
    if (!$user_stmt) {
        throw new Exception("Database error: " . $mysqli->error);
    }
    
    $user_stmt->bind_param("i", $user_id);
    $user_stmt->execute();
    $user_result = $user_stmt->get_result();
    $user = $user_result->fetch_assoc();

    if (!$user) {
        throw new Exception("User not found");
    }

    // Update last login
    $currentTime = (new DateTime())->format('Y-m-d H:i:s');
    switch ($user["user_type"]) {
        case 'admin':
            $update_sql = "UPDATE admin SET last_login = ?, Status = 'Active' WHERE user_ID = ?";
            break;
        case 'superadmin':
            $update_sql = "UPDATE superadmin SET last_login = ?, Status = 'Active' WHERE user_ID = ?";
            break;
        default:
            $update_sql = null;
    }

    if ($update_sql) {
        $update_stmt = $mysqli->prepare($update_sql);
        if ($update_stmt) {
            $update_stmt->bind_param("si", $currentTime, $user_id);
            $update_stmt->execute();
        }
    }

    // Send email
    try {
        $mail->setFrom('noreplysmileconnector@gmail.com', 'SmileConnector Portal');
        $mail->addAddress($email, $user["full_name"]);
        $mail->Subject = 'Your Admin Account is Ready';
        $mail->Body = "
        <!DOCTYPE html>
        <html lang='en'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Account Ready</title>
        </head>
        <body>
            <p>Dear {$user['full_name']},</p>
            
            <p>Your {$user['user_type']} account setup is now complete. Here are your login details:</p>
            
            <p><strong>Username:</strong> {$user['username']}</p>
            <p><strong>Account Type:</strong> " . ucfirst($user['user_type']) . "</p>
            
            <p>You can now log in to the SmileConnector system using your email/username and the password you set.</p>
            
            <p>Best regards,<br>
            <strong>The SmileConnector Team</strong></p>
        </body>
        </html>
        ";
        $mail->send();
    } catch (Exception $e) {
        error_log("Mailer Error: " . $e->getMessage());
    }

    // Prepare response
    $response = [
        "success" => true,
        "message" => "Password set successfully! Redirecting...",
        "user_type" => $user["user_type"],
        "full_name" => $user["full_name"],
        "email" => $email,
        "username" => $user["username"]
    ];

} catch (Exception $e) {
    $response = [
        "success" => false,
        "message" => $e->getMessage()
    ];
}

// Ensure clean JSON output
header('Content-Type: application/json; charset=UTF-8');
echo json_encode($response);
exit;