<?php
/**
 * API para autenticación de usuarios
 * Valida el email y contraseña contra la base de datos
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar peticiones OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Solo permitir peticiones POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit();
}

// Incluir configuración de base de datos
require_once __DIR__ . '/../database/config.php';

// Iniciar sesión si no está iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Función para validar email institucional
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) && 
           preg_match('/@litoral\.edu\.co$/', $email);
}

try {
    // Obtener datos del POST
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Si no hay datos JSON, intentar obtener de $_POST
    if (!$data) {
        $data = $_POST;
    }
    
    // Validar que los campos requeridos estén presentes
    if (!isset($data['email']) || empty(trim($data['email']))) {
        throw new Exception("El email es requerido");
    }
    
    if (!isset($data['password']) || empty($data['password'])) {
        throw new Exception("La contraseña es requerida");
    }
    
    // Extraer y limpiar datos
    $email = trim($data['email']);
    $password = $data['password'];
    
    // Validar formato de email
    if (!validateEmail($email)) {
        throw new Exception("El email debe ser un correo institucional válido (@litoral.edu.co)");
    }
    
    // Conectar a la base de datos
    $pdo = getDBConnection();
    if (!$pdo) {
        throw new Exception("Error al conectar con la base de datos");
    }
    
    // Buscar el usuario por email
    $stmt = $pdo->prepare("SELECT id, email, password, first_name, last_name, institutional_id FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    // Verificar si el usuario existe
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Email o contraseña incorrectos'
        ]);
        exit();
    }
    
    // Verificar la contraseña
    if (!password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Email o contraseña incorrectos'
        ]);
        exit();
    }
    
    // Login exitoso - crear sesión
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_name'] = $user['first_name'] . ' ' . $user['last_name'];
    $_SESSION['institutional_id'] = $user['institutional_id'];
    $_SESSION['logged_in'] = true;
    
    // Opcional: Guardar "Remember me" si está activado
    if (isset($data['remember']) && $data['remember'] === true) {
        // Establecer cookie de sesión con duración extendida (30 días)
        ini_set('session.cookie_lifetime', 60 * 60 * 24 * 30);
    }
    
    // Respuesta exitosa
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Login exitoso',
        'data' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['first_name'] . ' ' . $user['last_name'],
            'institutional_id' => $user['institutional_id']
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos: ' . $e->getMessage()
    ]);
    error_log("Error de base de datos en login.php: " . $e->getMessage());
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

