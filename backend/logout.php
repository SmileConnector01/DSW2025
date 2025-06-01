<?php
    session_start();
    session_unset(); 
    session_destroy();

    // // Set proper headers for fetch() request
    // http_response_code(200); // Return OK status
    // echo json_encode(["message" => "Logged out successfully"]);
?>
