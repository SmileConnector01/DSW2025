<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/database.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');  // adjust path to root .env
$dotenv->load();

$client = new Google\Client;
$client->setClientId($_ENV['GOOGLE_CLIENT_ID']);
$client->setClientSecret($_ENV['GOOGLE_CLIENT_SECRET']);
$client->setRedirectUri($_ENV['GOOGLE_REDIRECT_URI']);

if (!isset($_GET["code"])) {
    exit("Login failed");
}

$token = $client->fetchAccessTokenWithAuthCode($_GET["code"]);

if (isset($token['error'])) {
    exit('Google Login Error: ' . htmlspecialchars($token['error']));
}

$client->setAccessToken($token["access_token"]);
$oauth = new Google\Service\Oauth2($client);
$userinfo = $oauth->userinfo->get();

$fullName = $userinfo->name;
$email = $userinfo->email;

// Generate unique username
$firstName = explode(" ", $fullName)[0];
$randomNumbers = rand(1000, 9999);
$username = $firstName . $randomNumbers;

// Check if user already exists
$check_sql = "SELECT * FROM users WHERE email = ?";
$stmt = $mysqli->prepare($check_sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

session_start();
$_SESSION["email"] = $email;

if ($result->num_rows === 0) {
    // New user - always create as patient (default role)
    $check_username_sql = "SELECT * FROM users WHERE username = ?";
    $stmt = $mysqli->prepare($check_username_sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $username_result = $stmt->get_result();

    while ($username_result->num_rows > 0) {
        $randomNumbers = rand(1000, 9999);
        $username = $firstName . $randomNumbers;
        $stmt = $mysqli->prepare($check_username_sql);
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $username_result = $stmt->get_result();
    }

    // Insert new patient
    $insert_sql = "INSERT INTO users (username, full_name, email, ispasswordset, user_type) VALUES (?, ?, ?, 0, 'patient')";
    $stmt = $mysqli->prepare($insert_sql);
    $stmt->bind_param("sss", $username, $fullName, $email);
    $stmt->execute();

    // Redirect to password setup
    header('Location: http://localhost/SmileConnector/logins/register.html?username=' . urlencode($fullName) . '&name=' . urlencode($username));
    exit;
} else {
    //$result = $stmt->get_result();
    $user = $result->fetch_assoc();
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

    $_SESSION["user_ID"] = $user["user_ID"];
    $_SESSION["username"] = $user["username"];
    $_SESSION["user_type"] = $user["user_type"];
    $_SESSION["full_name"] = $user["full_name"];

    if ($user["ispasswordset"] == 1) {
        // Password is set - proceed with login
        $currentTime = (new DateTime())->format('Y-m-d H:i:s');

        // Update last_login in role-specific table
        switch ($user["user_type"]) {
            case 'patient':
                $updateRoleLogin = $mysqli->prepare("UPDATE patients SET last_login = ? WHERE user_ID = ?");
                $updateRoleLogin->bind_param("si", $currentTime, $user["user_ID"]);
                $updateRoleLogin->execute();
                header("Location: ../dashboard/patient.html?username=" . urlencode($user["full_name"]) . "&email=" . urlencode($user["email"]));
                break;
            case 'admin':
            case 'superadmin':
                $_SESSION["google_auth_block"] = false;

                // Admins can use Google login only after setting password
                $updateRoleLogin = $mysqli->prepare("UPDATE " . $user["user_type"] . " SET last_login = ? WHERE user_ID = ?");
                $updateRoleLogin->bind_param("si", $currentTime, $user["user_ID"]);
                $updateRoleLogin->execute();
                header("Location: ../dashboard/" . 
                    ($user["user_type"] === 'superadmin' ? 'admin' : 'secondAdmin') . 
                    ".html?username=" . urlencode($user["full_name"]) . 
                    "&email=" . urlencode($user["email"]));
                break;
            default:
                header("Location: ../logins/login.html?error=invalid_role");
                break;
        }
        exit;
    } else {
        // No password set yet
        if ($user["user_type"] === 'patient') {
            // Patient can set password directly
            header('Location: http://localhost/SmileConnector/logins/register.html?username=' . urlencode($user["full_name"]) . '&name=' . urlencode($user["username"]));
            exit;
        } else {
            // Admin/Superadmin must use OTP first
            $_SESSION["google_auth_block"] = true;
            header('Location: ../logins/login.html?error=admin_google_auth');
            exit;
        }
    }
}

?>