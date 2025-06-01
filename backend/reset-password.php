<?php
    session_start();

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        require_once __DIR__ . "/database.php";

        $new_password = $_POST["new_password"];
        $confirm_password = $_POST["confirm_password"];
        $email = $_SESSION["reset_email"] ?? "";
        $token = $_SESSION["reset_token"] ?? "";

        // Validate
        if (empty($email) || empty($token)) {
            header("Location: ../logins/login.html?error=session_missing");
            exit;
        }

        if ($new_password !== $confirm_password) {
            header("Location: ../logins/login.html?screen=reset&error=nomatch");
            exit;
        }

        if (strlen($new_password) < 8) {
            header("Location: ../logins/login.html?screen=reset&error=tooshort");
            exit;
        }

        $token_hash = hash("sha256", $token);

        // Check token validity (from `users` table)
        $sql = "SELECT * FROM users 
                WHERE email = ? 
                AND reset_token_hash = ? 
                AND reset_token_expiretime > NOW()";

        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("ss", $email, $token_hash);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            header("Location: ../logins/login.html?error=expired_token");
            exit;
        }

        // User found
        $user = $result->fetch_assoc();
        $user_type = $user["user_type"];
        $full_name = $user["full_name"];
        $user_id = $user["user_ID"];

        // Check if user is admin and get their status from admin table
        if ($user["user_type"] === "admin") {
            $admin_status_check = $mysqli->prepare("SELECT Status FROM admin WHERE user_ID = ?");
            $admin_status_check->bind_param("i", $user["user_ID"]);
            $admin_status_check->execute();
            $admin_result = $admin_status_check->get_result();
            
            if ($admin_result->num_rows > 0) {
                $admin_data = $admin_result->fetch_assoc();
                if (strtolower($admin_data["Status"]) === "inactive") {
                    header("Location: ../logins/login.html?error=inactive_admin");
                    exit;
                }
            }
        }

        // Hash new password
        $password_hash = password_hash($new_password, PASSWORD_DEFAULT);

        // Update password
        $update_sql = "UPDATE users 
                    SET password_hash = ?, 
                        ispasswordset = 1, 
                        reset_token_hash = NULL, 
                        reset_token_expiretime = NULL,
                        reset_otp = NULL,
                        reset_otp_expires_at = NULL 
                    WHERE email = ?";

        $update_stmt = $mysqli->prepare($update_sql);
        $update_stmt->bind_param("ss", $password_hash, $email);
        $update_stmt->execute();

        // Get current time in MySQL format using PHP
        $currentTime = (new DateTime())->format('Y-m-d H:i:s');

        // Update last login timestamp in role-specific table
        switch ($user_type) {
            case 'patient':
                $updateLogin = $mysqli->prepare("UPDATE patients SET last_login = ? WHERE user_ID = ?");
                $updateLogin->bind_param("si", $currentTime, $user_id);
                $updateLogin->execute();
                break;
            case 'admin':
                $updateLogin = $mysqli->prepare("UPDATE admin SET last_login = ? WHERE user_ID = ?");
                $updateLogin->bind_param("si", $currentTime, $user_id);
                $updateLogin->execute();
                break;
            case 'superadmin':
                $updateLogin = $mysqli->prepare("UPDATE superadmin SET last_login = ? WHERE user_ID = ?");
                $updateLogin->bind_param("si", $currentTime, $user_id);
                $updateLogin->execute();
                break;
        }

        // Clear reset session
        unset($_SESSION["reset_email"]);
        unset($_SESSION["reset_token"]);

        // Start user session
        $_SESSION["user_ID"] = $user_id;
        $_SESSION["full_name"] = $full_name;
        $_SESSION["email"] = $email;
        $_SESSION["user_type"] = $user_type;

        // Redirect to dashboard based on role
        switch ($user_type) {
            case 'patient':
                header("Location: ../dashboard/patient.html?username=" . urlencode($full_name) . "&email=" . urlencode($email));
                break;
            case 'admin':
                header("Location: ../dashboard/secondAdmin.html?username=" . urlencode($full_name) . "&email=" . urlencode($email));
                break;
            case 'superadmin':
                header("Location: ../dashboard/admin.html?username=" . urlencode($full_name) . "&email=" . urlencode($email));
                break;
            default:
                header("Location: ../logins/login.html?error=invalid_role");
                break;
        }

        exit;
    }

    // Direct access fallback
    header("Location: ../logins/login.html");
    exit;
?>