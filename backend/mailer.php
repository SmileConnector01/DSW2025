<?php

    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\SMTP;
    use PHPMailer\PHPMailer\Exception;

    require_once __DIR__ . "/vendor/autoload.php";
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');  // adjust path to root .env
    $dotenv->load();

    
    $mail = new PHPMailer(true);

    //$mail->SMTPDebug = SMTP::DEBUG_SERVER;

    $mail->isSMTP();
    $mail->SMTPAuth = true;

    // Brevo SMTP server settings
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Host = $_ENV['BREVO_SMTP_HOST'];
    $mail->Port = $_ENV['BREVO_SMTP_PORT'];
    $mail->Username = $_ENV['BREVO_USERNAME'];
    $mail->Password = $_ENV['BREVO_PASSWORD'];

    $mail->isHtml(true);

    return $mail;
?>