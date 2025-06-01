<?php
// header('Content-Type: application/json');
// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Methods: POST');
// header('Access-Control-Allow-Headers: Content-Type, multipart/form-data');

// // Handle preflight requests
// if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
//     exit(0);
// }

// if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
//     http_response_code(405);
//     echo json_encode(['success' => false, 'message' => 'Method not allowed']);
//     exit;
// }

// try {
//     // Validate required fields
//     if (empty($_POST['recipient_email']) || empty($_POST['subject']) || empty($_POST['message'])) {
//         throw new Exception('Missing required fields: recipient_email, subject, or message');
//     }

//     if (empty($_FILES['pdf_file'])) {
//         throw new Exception('No PDF file uploaded');
//     }

//     $recipientEmail = filter_var($_POST['recipient_email'], FILTER_VALIDATE_EMAIL);
//     if (!$recipientEmail) {
//         throw new Exception('Invalid email address');
//     }

//     $subject = htmlspecialchars(trim($_POST['subject']));
//     $message = htmlspecialchars(trim($_POST['message']));
//     $senderName = isset($_POST['sender_name']) ? htmlspecialchars(trim($_POST['sender_name'])) : 'SmileConnect Admin';

//     // Handle file upload
//     $uploadedFile = $_FILES['pdf_file'];
    
//     // Validate file
//     if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
//         throw new Exception('File upload error: ' . $uploadedFile['error']);
//     }

//     // Check file type
//     $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
//     $mimeType = finfo_file($fileInfo, $uploadedFile['tmp_name']);
//     finfo_close($fileInfo);

//     if ($mimeType !== 'application/pdf') {
//         throw new Exception('Invalid file type. Only PDF files are allowed.');
//     }

//     // Check file size (limit to 10MB)
//     if ($uploadedFile['size'] > 10 * 1024 * 1024) {
//         throw new Exception('File too large. Maximum size is 10MB.');
//     }

//     // Load PHPMailer
//     require_once __DIR__ . "/mailer.php";
    
//     // Configure the mailer (assuming $mail is returned from mailer.php)
//     $mail->clearAddresses();
//     $mail->clearAttachments();
    
//     // Set sender and recipient
//     $mail->setFrom('noreplysmileconnector@gmail.com', 'SmileConnect Portal');
//     $mail->addAddress($recipientEmail);
    
//     // Set subject
//     $mail->Subject = $subject;
    
//     // Create professional HTML email template
//     $htmlMessage = createEmailTemplate($message, $senderName, $subject);
//     $mail->Body = $htmlMessage;
    
//     // Create plain text version
//     $plainMessage = strip_tags(str_replace(['<br>', '<br/>', '<br />'], "\n", $message));
//     $mail->AltBody = $plainMessage . "\n\n" .
//         "Sent by: $senderName\n" .
//         "SmileConnect Dental Initiative\n" .
//         "© " . date('Y') . " SmileConnect. All rights reserved.";
    
//     // Attach the PDF file
//     $mail->addAttachment($uploadedFile['tmp_name'], $uploadedFile['name'], 'base64', 'application/pdf');
    
//     // Send the email
//     if ($mail->send()) {
//         // Log successful email (optional)
//         error_log("PDF email sent successfully to: $recipientEmail");
        
//         echo json_encode([
//             'success' => true,
//             'message' => "Email sent successfully to $recipientEmail",
//             'details' => [
//                 'recipient' => $recipientEmail,
//                 'subject' => $subject,
//                 'attachment' => $uploadedFile['name'],
//                 'file_size' => round($uploadedFile['size'] / 1024, 1) . ' KB',
//                 'sent_at' => date('Y-m-d H:i:s')
//             ]
//         ]);
//     } else {
//         throw new Exception('Failed to send email: ' . $mail->ErrorInfo);
//     }

// } catch (Exception $e) {
//     error_log("Email sending error: " . $e->getMessage());
//     http_response_code(400);
//     echo json_encode([
//         'success' => false,
//         'message' => $e->getMessage()
//     ]);
// }

// function createEmailTemplate($message, $senderName, $subject) {
//     $currentYear = date('Y');
//     $currentDate = date('F j, Y \a\t g:i A');
    
//     return "
//     <!DOCTYPE html>
//     <html lang='en'>
//     <head>
//         <meta charset='UTF-8'>
//         <meta name='viewport' content='width=device-width, initial-scale=1.0'>
//         <title>$subject</title>
//         <style>
//             body {
//                 font-family: 'Arial', sans-serif;
//                 line-height: 1.6;
//                 color: #333;
//                 max-width: 600px;
//                 margin: 0 auto;
//                 padding: 0;
//                 background-color: #f4f4f4;
//             }
//             .container {
//                 background-color: white;
//                 margin: 20px;
//                 border-radius: 8px;
//                 overflow: hidden;
//                 box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//             }
//             .header {
//                 background: linear-gradient(135deg, #0077ff, #0056cc);
//                 padding: 30px 20px;
//                 text-align: center;
//                 color: white;
//             }
//             .header h1 {
//                 margin: 0;
//                 font-size: 24px;
//                 font-weight: 300;
//             }
//             .header .logo {
//                 font-size: 32px;
//                 margin-bottom: 10px;
//             }
//             .content {
//                 padding: 30px;
//                 background-color: white;
//             }
//             .message-content {
//                 background-color: #f8f9fa;
//                 padding: 20px;
//                 border-radius: 6px;
//                 border-left: 4px solid #0077ff;
//                 margin: 20px 0;
//                 white-space: pre-line;
//             }
//             .attachment-info {
//                 background-color: #e3f2fd;
//                 border: 1px solid #2196f3;
//                 border-radius: 6px;
//                 padding: 15px;
//                 margin: 20px 0;
//                 text-align: center;
//             }
//             .attachment-info .icon {
//                 font-size: 24px;
//                 color: #0077ff;
//                 margin-bottom: 8px;
//             }
//             .footer {
//                 background-color: #f8f9fa;
//                 padding: 20px;
//                 text-align: center;
//                 border-top: 1px solid #eee;
//             }
//             .footer p {
//                 margin: 5px 0;
//                 font-size: 12px;
//                 color: #666;
//             }
//             .contact-info {
//                 margin: 15px 0;
//                 font-size: 13px;
//                 color: #666;
//             }
//             .btn {
//                 display: inline-block;
//                 padding: 10px 20px;
//                 background-color: #0077ff;
//                 color: white;
//                 text-decoration: none;
//                 border-radius: 5px;
//                 margin: 10px 0;
//             }
//         </style>
//     </head>
//     <body>
//         <div class='container'>
//             <div class='header'>
//                 <div class='logo'>🦷</div>
//                 <h1>SmileConnect Dental Initiative</h1>
//                 <p>Professional Dental Care Reports</p>
//             </div>
            
//             <div class='content'>
//                 <p><strong>Dear Recipient,</strong></p>
                
//                 <div class='message-content'>
//                     $message
//                 </div>
                
//                 <div class='attachment-info'>
//                     <div class='icon'>📎</div>
//                     <strong>PDF Report Attached</strong>
//                     <p>This email contains a PDF attachment with the requested report from SmileConnect.</p>
//                 </div>
                
//                 <div class='contact-info'>
//                     <p><strong>Sent by:</strong> $senderName</p>
//                     <p><strong>Date:</strong> $currentDate</p>
//                 </div>
                
//                 <p>If you have any questions about this report, please don't hesitate to contact us.</p>
                
//                 <p>Best regards,<br>
//                 <strong>SmileConnect Admin Team</strong></p>
//             </div>
            
//             <div class='footer'>
//                 <p><strong>SmileConnect Dental Initiative</strong></p>
//                 <p>123 Health Avenue, Johannesburg, South Africa</p>
//                 <p>Phone: +27 11 123 4567 | Email: info@smileconnect.org</p>
//                 <p style='margin-top: 15px;'>This is an automated message. Please do not reply directly to this email.</p>
//                 <p>&copy; $currentYear SmileConnect. All rights reserved.</p>
//             </div>
//         </div>
//     </body>
//     </html>
//     ";
// }
?>