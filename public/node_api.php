<?php

$nodeServerUrl = 'http://localhost:3000';

function callNodeApi($endpoint, $method = 'POST', $data = null) {
    global $nodeServerUrl; 
    
    $url = rtrim($nodeServerUrl, '/') . '/' . ltrim($endpoint, '/');
    
    $options = [
        'http' => [
            'header' => "Content-Type: application/json\r\n" . 
                        "Accept: application/json\r\n",        
            'method' => $method,                               
            'ignore_errors' => true                             
        ]
    ];
    
    
    if ($data && $method === 'POST' ) {
        $options['http']['content'] = json_encode($data); 
    }
    $context = stream_context_create($options);
    $result = @file_get_contents($url, false, $context); 
    
    if ($result === false) {
        return null;
    }
    return json_decode($result, true);
}

function getConnectedUsers() {
    return callNodeApi('api/connected-users') ?: [];
}

function getChatRooms() {
    return callNodeApi('api/rooms') ?: []; 
}

function getChatMessages($roomId) {
    return callNodeApi("api/rooms/{$roomId}/messages") ?: []; 
}
