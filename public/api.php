<?php
header('Content-Type: application/json');


$data = $_POST;

error_log('Отримано дані: ' . print_r($data, true));
if (isset($data['action']) && $data['action'] === 'delete') {
    if (empty($data['ids']) || !is_array($data['ids'])) {
        echo json_encode(['error' => 'Не вказано ID для видалення']);
        exit;
    }

    echo json_encode(['success' => true]);
    exit;
}


if (!isset($data['data']) || empty($data['data'])) {
    echo json_encode(['error' => 'Дані не надіслано']);
    exit;
}

$studentData = json_decode($data['data'], true);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['error' => 'Некоректний формат JSON']);
    exit;
}

$required_fields = ['id', 'groupId', 'firstName', 'lastName', 'genderId', 'birthday', 'status'];
foreach ($required_fields as $field) {
    if (!isset($studentData[$field]) || $studentData[$field] === '') {

        echo json_encode(['error' => "Поле $field є обов'язковим"]);
        exit;
    }
}


if (!is_numeric($studentData['id']) || $studentData['id'] <= 0) {
    echo json_encode(['error' => 'Некоректний ID студента']);
    exit;
}
if (!is_numeric($studentData['groupId']) || $studentData['groupId'] <= 0) {
    echo json_encode(['error' => 'Некоректний ID групи']);
    exit;
}
if (empty($studentData['firstName']) || !preg_match('/^[a-zA-Zа-яА-ЯёЁ\s-]+$/u', $studentData['firstName'])) {
    echo json_encode(['error' => 'Некоректне ім\'я']);
    exit;
}
if (empty($studentData['lastName']) || !preg_match('/^[a-zA-Zа-яА-ЯёЁ\s-]+$/u', $studentData['lastName'])) {
    echo json_encode(['error' => 'Некоректне прізвище']);
    exit;
}
if (!in_array($studentData['genderId'], ['1', '2'])) {
    echo json_encode(['error' => 'Некоректна стать']);
    exit;
}
if (!DateTime::createFromFormat('Y-m-d', $studentData['birthday'])) {
    echo json_encode(['error' => 'Некоректна дата народження']);
    exit;
}
if ($studentData['status'] !== true && $studentData['status'] !== false) {

    echo json_encode(['error' => 'Некоректний статус']);
    exit;
}


echo json_encode(['success' => true, 'data' => $studentData]);

exit;
?>