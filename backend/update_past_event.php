<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// DB connection
$conn = require_once __DIR__ . '/database.php';

// Get POST data
$id           = intval($_POST['id'] ?? 0);
$cavities     = intval($_POST['cavities'] ?? 0);
$gumdisease   = intval($_POST['gumdisease'] ?? 0);
$toothloss    = intval($_POST['toothloss'] ?? 0);
$other        = trim($_POST['other'] ?? '');
$treatments   = intval($_POST['treatments'] ?? 0);
$followUps    = intval($_POST['followUps'] ?? 0);
$video_title  = trim($_POST['video_title'] ?? '');
$video_desc   = trim($_POST['video_description'] ?? '');
$video_cat    = trim($_POST['video_category'] ?? '');
$video_dur    = floatval($_POST['video_duration'] ?? 0);

// Prepare filename
$filename = '';
$hasFile = isset($_FILES['video_file']) && $_FILES['video_file']['error'] === UPLOAD_ERR_OK;

if ($hasFile) {
    $uploadDir = __DIR__ . '/upload_video/';
    
    // Create directory if it doesn't exist
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
        echo json_encode(['success' => false, 'message' => 'Failed to create upload directory']);
        exit;
    }

    // Sanitize the video title to create a safe filename
    $sanitizedTitle = preg_replace('/[^a-zA-Z0-9\-_]/', '', str_replace(' ', '_', $video_title));
    if (empty($sanitizedTitle)) {
        $sanitizedTitle = 'video_' . uniqid();
    }

    // Get file extension
    $fileExt = strtolower(pathinfo($_FILES['video_file']['name'], PATHINFO_EXTENSION));
    
    // Allowed video extensions
    $allowedExts = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
    
    if (!in_array($fileExt, $allowedExts)) {
        echo json_encode(['success' => false, 'message' => 'Invalid file type. Only video files are allowed.']);
        exit;
    }

    // Create filename: sanitized_title + timestamp + extension
    $filename = $sanitizedTitle . '_' . time() . '.' . $fileExt;
    $targetPath = $uploadDir . $filename;

    // Move uploaded file
    if (!move_uploaded_file($_FILES['video_file']['tmp_name'], $targetPath)) {
        echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file']);
        exit;
    }
}

// Build the SQL using your actual column names
$sql = "UPDATE past_event SET
    cavities = ?,
    gumdisease = ?,
    toothloss = ?,
    `other` = ?,
    treatments = ?,
    followUps = ?,
    title = ?,              
    description = ?,        
    category = ?,           
    duration = ?" . 
    ($hasFile ? ", filename = ?" : "") .  // Changed from video_url
    " WHERE id = ?";

// Prepare & bind
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
    exit;
}

if ($hasFile) {
    $stmt->bind_param(
        "iiisiisssdsi",  // Notice the types match your variables
        $cavities,
        $gumdisease,
        $toothloss,
        $other,
        $treatments,
        $followUps,
        $video_title,     // This variable name can stay the same
        $video_desc,      // This variable name can stay the same
        $video_cat,       // This variable name can stay the same
        $video_dur,       // This variable name can stay the same
        $filename,        // This goes to the filename column
        $id
    );
} else {
    $stmt->bind_param(
        "iiisiisssdi",
        $cavities,
        $gumdisease,
        $toothloss,
        $other,
        $treatments,
        $followUps,
        $video_title,
        $video_desc,
        $video_cat,
        $video_dur,
        $id
    );
}


// Execute
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Event updated', 'filename' => $hasFile ? $filename : null]);
} else {
    // If there was an error, delete the uploaded file if it was created
    if ($hasFile && file_exists($uploadDir . $filename)) {
        unlink($uploadDir . $filename);
    }
    echo json_encode(['success' => false, 'message' => 'Update failed: ' . $stmt->error]);
}

$stmt->close();
$conn->close();