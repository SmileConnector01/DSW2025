<?php
session_start();
require_once __DIR__ . "/database.php";

try {
    // Debug: Log received POST data (remove in production)
    error_log("POST data: " . print_r($_POST, true));
    
    if (!isset($_POST['email']) || empty($_POST['email'])) {
        throw new Exception("Email is required");
    }

    // Collect OTP from individual inputs
    $otp = '';
    $missing_fields = [];
    
    for ($i = 1; $i <= 6; $i++) {
        if (!isset($_POST["otp$i"]) || empty($_POST["otp$i"])) {
            $missing_fields[] = "otp$i";
        } else {
            $otp .= $_POST["otp$i"];
        }
    }
    
    // More specific error message
    if (!empty($missing_fields)) {
        error_log("Missing OTP fields: " . implode(', ', $missing_fields));
        throw new Exception("Please enter the complete verification code");
    }
    
    // Validate OTP length
    if (strlen($otp) !== 6) {
        throw new Exception("Verification code must be 6 digits");
    }

    $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
    if (!$email) {
        throw new Exception("Invalid email address");
    }

    // Debug: Log the OTP and email being processed
    error_log("Processing OTP: $otp for email: $email");

    $mysqli = require __DIR__ . "/database.php";

    // Verify OTP
    $verify_sql = "SELECT otp, expires_at FROM email_verification WHERE email = ?";
    $stmt = $mysqli->prepare($verify_sql);
    if (!$stmt) {
        throw new Exception("Database error: " . $mysqli->error);
    }

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        error_log("No OTP found for email: $email");
        header("Location: ../logins/EmailRegister.html?error=invalid_otp&screen=otp&email=" . urlencode($email));
        exit;
    }

    $row = $result->fetch_assoc();
    $stored_otp = $row['otp'];
    $expires_at = $row['expires_at'];

    // Debug: Log stored vs received OTP
    error_log("Stored OTP: $stored_otp, Received OTP: $otp");

    // Check if OTP has expired
    if (strtotime($expires_at) < time()) {
        error_log("OTP expired for email: $email");
        header("Location: ../logins/EmailRegister.html?error=expired_otp&screen=otp&email=" . urlencode($email));
        exit;
    }

    // Verify OTP
    if ($otp !== $stored_otp) {
        error_log("OTP mismatch for email: $email");
        header("Location: ../logins/EmailRegister.html?error=invalid_otp&screen=otp&email=" . urlencode($email));
        exit;
    }

    // OTP is valid, store email in session and proceed to registration
    $_SESSION['verified_email'] = $email;
    
    // Clear the OTP from database after successful verification
    $delete_sql = "DELETE FROM email_verification WHERE email = ?";
    $delete_stmt = $mysqli->prepare($delete_sql);
    if ($delete_stmt) {
        $delete_stmt->bind_param("s", $email);
        $delete_stmt->execute();
    }
    
    header("Location: ../logins/EmailRegister.html?screen=complete&status=verified&email=" . urlencode($email));
    exit;

} catch (Exception $e) {
    $email = $_POST['email'] ?? '';
    error_log("OTP verification error: " . $e->getMessage());
    header("Location: ../logins/EmailRegister.html?error=" . urlencode($e->getMessage()) . "&screen=otp&email=" . urlencode($email));
    exit;
}
?>