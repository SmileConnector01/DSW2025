<?php
    require_once __DIR__ . '/vendor/autoload.php';

    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../'); 
    $dotenv->load();

    $host = $_ENV['DB_HOST'];
    $dbname = $_ENV['DB_NAME'];
    $user_name = $_ENV['DB_USERNAME'];
    $password = $_ENV['DB_PASSWORD'];


    $mysqli = new mysqli(hostname: $host,
                        username: $user_name,
                        password: $password,
                        database: $dbname);
                        
    if ($mysqli->connect_errno) {
        die("Connection error: " . $mysqli->connect_error);
    }

    return $mysqli;
?>