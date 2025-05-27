<?php

try {
    $pdo = new PDO('mysql:host=localhost;dbname=student_management', 'student_user', '1234');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die('Database connection failed: ' . $e->getMessage());
}

$students = $pdo->query("SELECT id, group_id, first_name, last_name, gender_id, birthday, status 
                         FROM students")->fetchAll(PDO::FETCH_ASSOC);
 
$groups = [
    1 => 'PZ-21',
    2 => 'PZ-22',
    3 => 'PZ-23',
    4 => 'PZ-24',
    5 => 'PZ-25'
];

$genders = [
    1 => 'Male',
    2 => 'Female',
    3 => 'Other'
];
?>

