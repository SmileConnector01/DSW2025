<?php
$is_invalid = false;

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    
    $mysqli = require_once __DIR__ . "/database.php";
    
    $identifier = $_POST["identifier"];
    $password = $_POST["password"] ?? null;
    
    // Determine whether it's email or username
    if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
        $sql = sprintf(
            "SELECT * FROM users WHERE email = '%s'",
            $mysqli->real_escape_string($identifier)
        );
    } else {
        $sql = sprintf(
            "SELECT * FROM users WHERE username = '%s'",
            $mysqli->real_escape_string($identifier)
        );
    }
    
    $result = $mysqli->query($sql);
    $user = $result->fetch_assoc();

    if ($user) {      

        // Handle admin/superadmin first-time login (password not set yet)
        if (($user["user_type"] === "admin" || $user["user_type"] === "superadmin") && $user["ispasswordset"] == 0) {
            // Verify OTP (temporary password)
            if ($password === $user["reset_otp"]) {
                session_start();
                session_regenerate_id();
                
                $_SESSION["user_ID"] = $user["user_ID"];
                $_SESSION["full_name"] = $user["full_name"];
                $_SESSION["email"] = $user["email"];
                $_SESSION["user_type"] = $user["user_type"];
                $_SESSION["setup_admin"] = true; // Flag for password setup
                
                // Redirect to password setup page
                header("Location: ../logins/adminRegister.html?username=" . urlencode($user["full_name"]) . "&email=" . urlencode($user["email"]));
                exit;
            } else {
                $is_invalid = true;
            }
        }
        // Regular login with password
        elseif ($user["ispasswordset"] == 1 && password_verify($password, $user["password_hash"])) {
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

            session_start();
            session_regenerate_id();
            
            $_SESSION["user_ID"] = $user["user_ID"];
            $_SESSION["full_name"] = $user["full_name"];
            $_SESSION["email"] = $user["email"];
            $_SESSION["user_type"] = $user["user_type"];

            // Get current time in MySQL format using PHP
            $currentTime = (new DateTime())->format('Y-m-d H:i:s');

            // Update last_login in role-specific table
            switch ($user["user_type"]) {
                case 'patient':
                    $updateRoleLogin = $mysqli->prepare("UPDATE patients SET last_login = ? WHERE user_ID = ?");
                    $updateRoleLogin->bind_param("si", $currentTime, $user["user_ID"]);
                    $updateRoleLogin->execute();
                    
                    // After updating last_login for patient
                    $patientId = null;
                    $getPatientId = $mysqli->prepare("SELECT patient_id FROM patients WHERE user_ID = ?");
                    $getPatientId->bind_param("i", $user["user_ID"]);
                    $getPatientId->execute();
                    $getPatientIdResult = $getPatientId->get_result();
                    if ($row = $getPatientIdResult->fetch_assoc()) {
                        $patientId = $row['patient_id'];
                    }
                    header("Location: ../dashboard/patient.html?username=" . urlencode($user["full_name"]) . 
                        "&email=" . urlencode($user["email"]) . 
                        "&patient_id=" . urlencode($patientId));
                    break;
                case 'admin':
                    $updateRoleLogin = $mysqli->prepare("UPDATE admin SET last_login = ? WHERE user_ID = ?");
                    $updateRoleLogin->bind_param("si", $currentTime, $user["user_ID"]);
                    $updateRoleLogin->execute();

                    // --- AUDIT LOGGING ---
                    $adminName = $user["full_name"];
                    $ip = $_SERVER['REMOTE_ADDR'];
                    $action = 'Login';
                    $targetType = 'admin';
                    $targetId = $user["user_ID"];
                    $details = "Admin $adminName logged in.";
                    $auditStmt = $mysqli->prepare("INSERT INTO audit_logs (action, admin, target_type, target_ID, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)");
                    $auditStmt->bind_param("ssssss", $action, $adminName, $targetType, $targetId, $details, $ip);
                    $auditStmt->execute();
                    $auditStmt->close();
                    header("Location: ../dashboard/secondAdmin.html?username=" . urlencode($user["full_name"]) . "&email=" . urlencode($user["email"]));
                    break;

                case 'superadmin':
                    $updateRoleLogin = $mysqli->prepare("UPDATE superadmin SET last_login = ? WHERE user_ID = ?");
                    $updateRoleLogin->bind_param("si", $currentTime, $user["user_ID"]);
                    $updateRoleLogin->execute();
                    header("Location: ../dashboard/admin.html?username=" . urlencode($user["full_name"]) . "&email=" . urlencode($user["email"]));
                    break;

                default:
                    header("Location: ../logins/login.html?error=invalid_role");
                    break;
            }
            exit;
        } else {
            $is_invalid = true;
        }
    } else {
        $is_invalid = true;
    }
}

// If login fails
if ($is_invalid) {
    header("Location: ../logins/login.html?error=invalid");
    exit;
}

// If accessed directly without POST
header("Location: ../logins/login.html");
exit;
?>