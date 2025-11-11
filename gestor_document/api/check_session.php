<?php
/**
 * API para verificar si el usuario está autenticado
 * Útil para proteger páginas que requieren autenticación
 */

header('Content-Type: application/json; charset=utf-8');

// Iniciar sesión si no está iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Verificar si el usuario está autenticado
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    echo json_encode([
        'authenticated' => true,
        'user' => [
            'id' => $_SESSION['user_id'] ?? null,
            'email' => $_SESSION['user_email'] ?? null,
            'name' => $_SESSION['user_name'] ?? null,
            'institutional_id' => $_SESSION['institutional_id'] ?? null
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode([
        'authenticated' => false,
        'message' => 'Usuario no autenticado'
    ]);
}

