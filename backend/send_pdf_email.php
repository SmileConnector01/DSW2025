<?php
header('Content-Type: application/json');

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/database.php';
$mail = require __DIR__ . '/mailer.php';

use PHPMailer\PHPMailer\Exception;

// Validate request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['error' => 'Method not allowed']));
}

// Check required fields
$required = ['name', 'email', 'subject', 'body'];
foreach ($required as $field) {
    if (empty($_POST[$field])) {
        http_response_code(400);
        die(json_encode(['error' => "Missing required field: $field"]));
    }
}

// Validate email
if (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    die(json_encode(['error' => 'Invalid email address']));
}

// Check if email exists in database
$mysqli = require __DIR__ . '/database.php';
$checkEmail = $mysqli->prepare("SELECT email FROM users WHERE email = ?");
$checkEmail->bind_param("s", $_POST['email']);
$checkEmail->execute();
$checkResult = $checkEmail->get_result();

if ($checkResult->num_rows === 0) {
    http_response_code(400);
    die(json_encode(['error' => 'Recipient email not found in our system']));
}

// Validate file upload
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    die(json_encode(['error' => 'File upload failed']));
}

$file_path = $_FILES['file']['tmp_name'];
$file_name = $_FILES['file']['name'];
$file_type = mime_content_type($file_path);

if (!is_uploaded_file($file_path)) {
    http_response_code(400);
    die(json_encode(['error' => 'Invalid file upload']));
}

if ($_FILES['file']['size'] > 5 * 1024 * 1024) {
    http_response_code(400);
    die(json_encode(['error' => 'File too large (max 5MB)']));
}

if ($file_type !== 'application/pdf') {
    http_response_code(400);
    die(json_encode(['error' => 'Only PDF files are allowed']));
}

// Prepare and send email
try {
    $mail->setFrom('noreplysmileconnector@gmail.com', 'SmileConnector Team');
    $mail->addAddress($_POST['email'], $_POST['name']);

    $mail->Subject = $_POST['subject'];
    
    $mail->isHTML(true);
    $mail->Body = "
    <!DOCTYPE html>
    <html lang='en'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>{$_POST['subject']}</title>
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
                background-color: #2c3e50;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
            }
            .header h1 {
                color: white;
                margin: 0;
                font-size: 20px;
            }
            .content {
                padding: 25px;
                background-color: #f9f9f9;
                border-radius: 0 0 5px 5px;
                border: 1px solid #e1e1e1;
                border-top: none;
            }
            .attachment-info {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin: 15px 0;
                border: 1px solid #ddd;
            }
            .attachment-info h3 {
                color: #3498db;
                margin-top: 0;
            }
            .footer {
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid #eee;
                font-size: 12px;
                color: #7f8c8d;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class='header'>
            <h1>SmileConnector Report</h1>
        </div>
        <div class='content'>
            <p>" . nl2br(htmlspecialchars($_POST['body'])) . "</p>
            
            <div class='attachment-info'>
                <h3>Attached Document:</h3>
                <p><i class='fas fa-file-pdf'></i> <strong>$file_name</strong></p>
                <p>This document is attached to this email for your reference.</p>
            </div>

            <p>If you have any questions about this report, please contact our support team.</p>

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
    
    $mail->AltBody = strip_tags($_POST['body']) . "\n\n" .
        "Attached Document: $file_name\n\n" .
        "Best regards,\n" .
        "The SmileConnector Team\n\n" .
        "© " . date('Y') . " SmileConnector. All rights reserved.";

    $mail->addAttachment($file_path, $file_name);

    if ($mail->send()) {
        echo json_encode(['success' => true, 'message' => 'Message sent']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Mailer error: ' . $mail->ErrorInfo]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}