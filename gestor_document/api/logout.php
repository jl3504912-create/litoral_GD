<?php
/**
 * API para cerrar sesión
 */

header('Content-Type: application/json; charset=utf-8');

// Iniciar sesión si no está iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Destruir todas las variables de sesión
$_SESSION = array();

// Si se desea eliminar la cookie de sesión, también se debe hacer lo siguiente:
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Finalmente, destruir la sesión
session_destroy();

echo json_encode([
    'success' => true,
    'message' => 'Sesión cerrada exitosamente'
]);

