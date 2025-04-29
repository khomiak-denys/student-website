<?php
header('Content-Type: application/json');


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'should be POST method']);
    exit;
}


$data = $_POST;
error_log('Data recieved : ' . print_r($data, true));

if (isset($data['action']) && $data['action'] === 'delete') {
    if (!isset($data['id']) || !is_numeric($data['id']) || $data['id'] <= 0) {   
        echo json_encode(['error' => 'ID for delete not set ']);
        exit;
    }

    echo json_encode(['success' => true]);
    exit;
}


if (!isset($data['data']) || empty($data['data'])) {
    echo json_encode(['error' => 'Data not send']);
    exit;
}


$studentData = json_decode($data['data'], true);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['error' => 'invalid JSON format']);
    exit;
}

$required_fields = ['id', 'groupId', 'firstName', 'lastName', 'genderId', 'birthday', 'status'];
foreach ($required_fields as $field) {
    if (!isset($studentData[$field]) || $studentData[$field] === '') {
        echo json_encode(['error' => "field $field required"]);
        exit;
    }
}


if (!is_numeric($studentData['id']) || $studentData['id'] <= 0) {
    echo json_encode(['error' => 'invalid student id']);
    exit;
}
if (!is_numeric($studentData['groupId']) || $studentData['groupId'] <= 0) {
    echo json_encode(['error' => 'invalid group id']);
    exit;
}
if (empty($studentData['firstName'])) {
    echo json_encode(['error' => 'invalid  firstname']);
    exit;
}
if (empty($studentData['lastName'])) {
    echo json_encode(['error' => 'invalid lastname']);
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
echo json_encode(['success' => true, 'data' => $studentData]);
exit;
?>