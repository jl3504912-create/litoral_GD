<?php
/**
 * API para registrar nuevos usuarios
 * Recibe los datos del formulario de signup.html y los guarda en la base de datos
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

/**
 * Función para validar email institucional
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) && 
           preg_match('/@litoral\.edu\.co$/', $email);
}

/**
 * Función para validar teléfono
 */
function validatePhone($phone) {
    return preg_match('/^[0-9]{10}$/', $phone);
}

/**
 * Función para validar código institucional
 */
function validateInstitutionalId($id) {
    return preg_match('/^[0-9]{10}$/', $id);
}

/**
 * Función para validar contraseña
 */
function validatePassword($password) {
    return strlen($password) >= 8 &&
           preg_match('/[A-Z]/', $password) &&
           preg_match('/[0-9]/', $password) &&
           preg_match('/[!@#$%^&*]/', $password);
}

try {
    // Obtener datos del POST
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Si no hay datos JSON, intentar obtener de $_POST
    if (!$data) {
        $data = $_POST;
    }
    
    // Validar que todos los campos requeridos estén presentes
    $required_fields = ['email', 'phone', 'firstName', 'lastName', 'password', 'institutionalId', 'terms'];
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            throw new Exception("El campo {$field} es requerido");
        }
    }
    
    // Extraer y validar datos
    $email = trim($data['email']);
    $phone = trim($data['phone']);
    $firstName = trim($data['firstName']);
    $lastName = trim($data['lastName']);
    $password = $data['password'];
    $confirmPassword = $data['confirmPassword'] ?? $data['password'];
    $institutionalId = trim($data['institutionalId']);
    $terms = filter_var($data['terms'], FILTER_VALIDATE_BOOLEAN);
    
    // Validaciones
    if (!validateEmail($email)) {
        throw new Exception("El email debe ser un correo institucional válido (@litoral.edu.co)");
    }
    
    if (!validatePhone($phone)) {
        throw new Exception("El teléfono debe tener 10 dígitos");
    }
    
    if (strlen($firstName) < 2 || strlen($lastName) < 2) {
        throw new Exception("Los nombres y apellidos deben tener al menos 2 caracteres");
    }
    
    if (!validatePassword($password)) {
        throw new Exception("La contraseña no cumple con los requisitos de seguridad");
    }
    
    if ($password !== $confirmPassword) {
        throw new Exception("Las contraseñas no coinciden");
    }
    
    if (!validateInstitutionalId($institutionalId)) {
        throw new Exception("El código institucional debe tener 10 dígitos");
    }
    
    if (!$terms) {
        throw new Exception("Debes aceptar los términos y condiciones");
    }
    
    // Conectar a la base de datos
    $pdo = getDBConnection();
    if (!$pdo) {
        throw new Exception("Error al conectar con la base de datos");
    }
    
    // Verificar si el email ya existe
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        throw new Exception("El email ya está registrado");
    }
    
    // Verificar si el código institucional ya existe
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE institutional_id = ?");
    $stmt->execute([$institutionalId]);
    if ($stmt->fetch()) {
        throw new Exception("El código institucional ya está registrado");
    }
    
    // Hash de la contraseña
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    
    // Insertar el nuevo usuario
    $stmt = $pdo->prepare("
        INSERT INTO usuarios (
            email, 
            phone, 
            first_name, 
            last_name, 
            password, 
            institutional_id, 
            terms_accepted
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    $result = $stmt->execute([
        $email,
        $phone,
        $firstName,
        $lastName,
        $hashedPassword,
        $institutionalId,
        $terms ? 1 : 0
    ]);
    
    if ($result) {
        // Obtener el ID del usuario recién creado
        $userId = $pdo->lastInsertId();
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Usuario registrado exitosamente',
            'data' => [
                'id' => $userId,
                'email' => $email,
                'firstName' => $firstName,
                'lastName' => $lastName
            ]
        ]);
    } else {
        throw new Exception("Error al registrar el usuario");
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos: ' . $e->getMessage()
    ]);
    error_log("Error de base de datos en register.php: " . $e->getMessage());
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

