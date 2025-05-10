<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'should be POST method']);
    exit;
} else {

try {
    $pdo = new PDO('mysql:host=localhost;dbname=student_management', 'student_user', '1234');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['error' => 'database connection failed']);
    exit;
}

$data = $_POST;

if (isset($data['action']) && $data['action'] === 'delete') {
    if (!isset($data['id']) || !is_numeric($data['id']) || $data['id'] <= 0) {
        echo json_encode(['error' => 'ID for delete not set']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id FROM list_students WHERE id = :id");
    $stmt->execute(['id' => $data['id']]);
    if (!$stmt->fetchColumn()) {
        echo json_encode(['error' => 'student not found']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM list_students WHERE id = :id");
    $stmt->execute(['id' => $data['id']]);

    echo json_encode(['success' => true]);
    exit;
}

if (!isset($data['data']) || empty($data['data'])) {
    echo json_encode(['error' => 'data not sent']);
    exit;
}

$studentData = json_decode($data['data'], true);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['error' => 'invalid JSON format']);
    exit;
}

$required_fields = ['groupId', 'firstName', 'lastName', 'genderId', 'birthday', 'status'];
if (isset($studentData['id'])) {
    $required_fields[] = 'id';
}

foreach ($required_fields as $field) {
    if (!isset($studentData[$field]) || $studentData[$field] === '') {
        echo json_encode(['error' => "field $field required"]);
        exit;
    }
}

if (isset($studentData['id']) && (!is_numeric($studentData['id']) || $studentData['id'] <= 0)) {
    echo json_encode(['error' => 'invalid student id']);
    exit;
}
if (!is_numeric($studentData['groupId']) || $studentData['groupId'] <= 0) {
    echo json_encode(['error' => 'invalid group id']);
    exit;
}
if (empty($studentData['firstName'])) {
    echo json_encode(['error' => 'invalid first name']);
    exit;
}
if (empty($studentData['lastName'])) {
    echo json_encode(['error' => 'invalid last name']);
    exit;
}
if (!is_numeric($studentData['genderId']) || $studentData['genderId'] <= 0) {
    echo json_encode(['error' => 'invalid gender']);
    exit;
}
if (!DateTime::createFromFormat('Y-m-d', $studentData['birthday'])) {
    echo json_encode(['error' => 'invalid birthday']);
    exit;
}
if ($studentData['status'] !== true && $studentData['status'] !== false) {
    echo json_encode(['error' => 'invalid status']);
    exit;
}

$stmt = $pdo->prepare("SELECT id FROM groups WHERE id = :groupId");
$stmt->execute(['groupId' => $studentData['groupId']]);
if (!$stmt->fetchColumn()) {
    echo json_encode(['error' => 'invalid group id']);
    exit;
}

$stmt = $pdo->prepare("SELECT id FROM genders WHERE id = :genderId");
$stmt->execute(['genderId' => $studentData['genderId']]);
if (!$stmt->fetchColumn()) {
    echo json_encode(['error' => 'invalid gender id']);
    exit;
}

if (isset($studentData['id'])) {
    $stmt = $pdo->prepare("SELECT id FROM list_students WHERE id = :id");
    $stmt->execute(['id' => $studentData['id']]);
    if (!$stmt->fetchColumn()) {
        echo json_encode(['error' => 'student not found']);
        exit;
    }

    $stmt = $pdo->prepare("
        UPDATE list_students 
        SET group_id = :groupId, first_name = :firstName, last_name = :lastName, 
            gender_id = :genderId, birthday = :birthday, status = :status 
        WHERE id = :id
    ");
    $stmt->execute([
        'id' => $studentData['id'],
        'groupId' => $studentData['groupId'],
        'firstName' => $studentData['firstName'],
        'lastName' => $studentData['lastName'],
        'genderId' => $studentData['genderId'],
        'birthday' => $studentData['birthday'],
        'status' => $studentData['status'] ? 1 : 0
    ]);
} else {
    $stmt = $pdo->prepare("
        INSERT INTO list_students (group_id, first_name, last_name, gender_id, birthday, status)
        VALUES (:groupId, :firstName, :lastName, :genderId, :birthday, :status)
    ");
    $stmt->execute([
        'groupId' => $studentData['groupId'],
        'firstName' => $studentData['firstName'],
        'lastName' => $studentData['lastName'],
        'genderId' => $studentData['genderId'],
        'birthday' => $studentData['birthday'],
        'status' => $studentData['status'] ? 1 : 0
    ]);
    $studentData['id'] = $pdo->lastInsertId();
}

echo json_encode(['success' => true, 'data' => $studentData]);
exit;
}
?>