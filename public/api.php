<?php
header('Content-Type: application/json');

// Отримуємо дані з $_POST
$data = $_POST;

// Перевірка, чи це запит на видалення
if (isset($data['action']) && $data['action'] === 'delete') {
    if (empty($data['ids']) || !is_array($data['ids'])) {
        echo json_encode(['error' => 'Не вказано ID для видалення']);
        exit;
    }

    // Логіка видалення (тут можна додати взаємодію з базою даних)
    // Для прикладу просто повертаємо успіх
    echo json_encode(['success' => true]);
    exit;
}

// Перевірка обов'язкових полів для додавання/редагування
$required_fields = ['id', 'groupId', 'firstName', 'lastName', 'genderId', 'birthday', 'status'];
foreach ($required_fields as $field) {
    if (!isset($data[$field])) {
        echo json_encode(['error' => "Поле $field є обов'язковим"]);
        exit;
    }
}

// Перевірка коректності даних
if (!is_numeric($data['groupId']) || $data['groupId'] <= 0) {
    echo json_encode(['error' => 'Некоректний ID групи']);
    exit;
}
if (empty($data['firstName']) || !preg_match('/^[a-zA-Zа-яА-ЯёЁ\s-]+$/u', $data['firstName'])) {
    echo json_encode(['error' => 'Некоректне ім\'я']);
    exit;
}
if (empty($data['lastName']) || !preg_match('/^[a-zA-Zа-яА-ЯёЁ\s-]+$/u', $data['lastName'])) {
    echo json_encode(['error' => 'Некоректне прізвище']);
    exit;
}
if (!in_array($data['genderId'], ['1', '2'])) {
    echo json_encode(['error' => 'Некоректна стать']);
    exit;
}
if (!DateTime::createFromFormat('Y-m-d', $data['birthday'])) {
    echo json_encode(['error' => 'Некоректна дата народження']);
    exit;
}
if (!is_bool($data['status']) && !in_array($data['status'], ['true', 'false', 0, 1])) {
    echo json_encode(['error' => 'Некоректний статус']);
    exit;
}

// Логіка збереження/редагування (тут можна додати взаємодію з базою даних)
// Для прикладу просто повертаємо успіх із даними
echo json_encode(['success' => true, 'data' => $data]);
exit;
?>