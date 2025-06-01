<?php
    session_start();

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        require_once __DIR__ . "/database.php";

        $submitted_otp = $_POST["otp"] ?? "";
        $email = $_SESSION["reset_email"] ?? "";

        if (empty($email)) {
            header("Location: ../logins/login.html?error=session_expired");
            exit;
        }

        // OTP validity and expiration
        $sql = "SELECT full_name, reset_otp_expires_at 
                FROM users 
                WHERE email = ? AND reset_otp = ?";

        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("ss", $email, $submitted_otp);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            // Either wrong OTP or no match at all
            header("Location: ../logins/login.html?screen=otp&error=invalid_otp");
            exit;
        }

        $user = $result->fetch_assoc();
        $expires_at = strtotime($user["reset_otp_expires_at"]);

        if (time() > $expires_at) {
            // OTP has expired
            header("Location: ../logins/login.html?screen=otp&error=expired");
            exit;
        }

        // OTP is valid
        header("Location: ../logins/login.html?screen=reset&status=verified");
        exit;
    }

    // Direct access fallback
    header("Location: ../logins/login.html");
    exit;
?>
