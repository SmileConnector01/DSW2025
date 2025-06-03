<?php
session_start();
require_once __DIR__ . "/mailer.php";
require_once __DIR__ . "/database.php";

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Start output buffering to prevent any unwanted output
ob_start();

// Function to send error response
function sendErrorResponse($message) {
    ob_clean(); // Clear any previous output
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

// Function to send success response
function sendSuccessResponse($message) {
    ob_clean(); // Clear any previous output
    echo json_encode(['success' => true, 'message' => $message]);
    exit;
}

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Invalid request method.');
}

// Check if this is a community feedback submission
if (!isset($_POST['action']) || $_POST['action'] !== 'community_feedback') {
    sendErrorResponse('Invalid action specified.');
}

// Get the community feedback
$communityFeedback = isset($_POST['communityFeedback']) ? trim($_POST['communityFeedback']) : '';

// Validate that feedback is provided
if (empty($communityFeedback)) {
    sendErrorResponse('Please provide your community feedback before submitting.');
}

// Sanitize the feedback content
$communityFeedback = htmlspecialchars($communityFeedback, ENT_QUOTES, 'UTF-8');

// Get additional information for context
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
$ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
$timestamp = date('F j, Y \a\t g:i A');
$userSession = isset($_SESSION['full_name']) ? $_SESSION['full_name'] : 'Anonymous User';

// Try to send the email
try {
    // Configure the mailer
    $mail->setFrom('noreplysmileconnector@gmail.com', 'SmileConnector Community Portal');
    $mail->addAddress('divindaniel58@gmail.com', 'Divin Daniel');
    
    // Set email subject
    $mail->Subject = 'New Community Feedback - SmileConnector Portal';
    
    // Create the professional HTML email content
    $mail->Body = "
    <!DOCTYPE html>
    <html lang='en'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Community Feedback Received</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 700px;
                margin: 0 auto;
                padding: 0;
                background-color: #f4f4f4;
            }
            .email-container {
                background-color: #ffffff;
                margin: 20px auto;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 30px 20px;
                text-align: center;
                color: white;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 300;
                letter-spacing: 1px;
            }
            .header .subtitle {
                margin: 10px 0 0 0;
                font-size: 16px;
                opacity: 0.9;
                font-weight: 300;
            }
            .content {
                padding: 40px 30px;
            }
            .feedback-section {
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                border-radius: 8px;
                padding: 25px;
                margin: 20px 0;
                border-left: 4px solid #667eea;
                position: relative;
            }
            .feedback-section::before {
                content: '💬';
                position: absolute;
                top: -5px;
                right: 15px;
                font-size: 24px;
                background: white;
                padding: 5px 8px;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .feedback-section h3 {
                color: #4a5568;
                margin: 0 0 15px 0;
                font-size: 18px;
                font-weight: 600;
            }
            .feedback-text {
                background-color: #ffffff;
                padding: 20px;
                border-radius: 6px;
                font-style: italic;
                font-size: 16px;
                line-height: 1.7;
                border: 1px solid #e2e8f0;
                box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
                color: #2d3748;
            }
            .meta-info {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border: 1px solid #e9ecef;
            }
            .meta-info h4 {
                color: #495057;
                margin: 0 0 15px 0;
                font-size: 16px;
                font-weight: 600;
                display: flex;
                align-items: center;
            }
            .meta-info h4::before {
                content: 'ℹ️';
                margin-right: 8px;
            }
            .meta-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                padding: 8px 0;
                border-bottom: 1px solid #e9ecef;
            }
            .meta-row:last-child {
                border-bottom: none;
            }
            .meta-label {
                font-weight: 600;
                color: #6c757d;
                flex: 1;
            }
            .meta-value {
                flex: 2;
                color: #495057;
                text-align: right;
            }
            .cta-section {
                background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
            }
            .cta-section h4 {
                color: #065f46;
                margin: 0 0 10px 0;
                font-size: 18px;
            }
            .cta-section p {
                color: #047857;
                margin: 0;
                font-size: 14px;
            }
            .footer {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                border-top: 1px solid #e9ecef;
                color: #6c757d;
                font-size: 12px;
            }
            .footer p {
                margin: 5px 0;
            }
            .highlight {
                background-color: #fff3cd;
                padding: 2px 4px;
                border-radius: 3px;
                font-weight: 600;
            }
            @media (max-width: 600px) {
                .email-container {
                    margin: 10px;
                }
                .content {
                    padding: 20px 15px;
                }
                .meta-row {
                    flex-direction: column;
                }
                .meta-value {
                    text-align: left;
                    margin-top: 5px;
                }
            }
        </style>
    </head>
    <body>
        <div class='email-container'>
            <div class='header'>
                <h1>SmileConnector</h1>
                <p class='subtitle'>Community Feedback Portal</p>
            </div>
            
            <div class='content'>
                <p style='font-size: 16px; color: #4a5568; margin: 0 0 20px 0;'>
                    Hello Admin,
                </p>
                
                <p style='font-size: 14px; color: #718096; margin: 0 0 30px 0;'>
                    You have received new community feedback through the SmileConnector portal. 
                    Please review the details below and take appropriate action if needed.
                </p>
                
                <div class='feedback-section'>
                    <h3>Community Feedback</h3>
                    <div class='feedback-text'>
                        " . nl2br($communityFeedback) . "
                    </div>
                </div>
                
                <div class='meta-info'>
                    <h4>Submission Details</h4>
                    <div class='meta-row'>
                        <span class='meta-label'>Submitted by:</span>
                        <span class='meta-value highlight'>{$userSession}</span>
                    </div>
                    <div class='meta-row'>
                        <span class='meta-label'>Date & Time:</span>
                        <span class='meta-value'>{$timestamp}</span>
                    </div>
                    
                    <div class='meta-row'>
                        <span class='meta-label'>Character Count:</span>
                        <span class='meta-value'>" . strlen($communityFeedback) . " characters</span>
                    </div>
                </div>
                
                <div class='cta-section'>
                    <h4>Next Steps</h4>
                    <p>Review this feedback and consider implementing improvements to enhance community oral health initiatives.</p>
                </div>
                
                <p style='font-size: 14px; color: #718096; margin: 30px 0 0 0; text-align: center;'>
                    This feedback was submitted through the SmileConnector Community Settings portal.
                </p>
            </div>
            
            <div class='footer'>
                <p><strong>SmileConnector</strong> - Connecting Communities for Better Oral Health</p>
                <p>This is an automated message from the SmileConnector portal system.</p>
                <p>&copy; " . date('Y') . " SmileConnector. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Create plain text version for email clients that don't support HTML
    $mail->AltBody = "SmileConnector - New Community Feedback Received\n\n" .
        "Hello Admin,\n\n" .
        "You have received new community feedback through the SmileConnector portal.\n\n" .
        "FEEDBACK:\n" .
        "========================================\n" .
        $communityFeedback . "\n" .
        "========================================\n\n" .
        "SUBMISSION DETAILS:\n" .
        "Submitted by: {$userSession}\n" .
        "Date & Time: {$timestamp}\n" .
        "IP Address: {$ipAddress}\n" .
        "Character Count: " . strlen($communityFeedback) . " characters\n\n" .
        "Please review this feedback and consider implementing improvements to enhance community oral health initiatives.\n\n" .
        "This feedback was submitted through the SmileConnector Community Settings portal.\n\n" .
        "SmileConnector - Connecting Communities for Better Oral Health\n" .
        "© " . date('Y') . " SmileConnector. All rights reserved.";
    
    // Send the email
    if ($mail->send()) {
        sendSuccessResponse('Thank you for your valuable feedback! Your suggestions have been sent to our team and will help us improve our community oral health initiatives.');
    } else {
        sendErrorResponse('There was an issue sending your feedback. Please try again later or contact support.');
    }
    
} catch (Exception $e) {
    // Log the error for debugging (you can customize this based on your logging setup)
    error_log("Community Feedback Mailer Error: " . $e->getMessage());
    sendErrorResponse('We encountered a technical issue while processing your feedback. Please try again later.');
}

// Clean up output buffer
ob_end_flush();
?>