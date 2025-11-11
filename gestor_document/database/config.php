<?php
/**
 * Configuración de conexión a la base de datos MySQL
 * Ajusta estos valores según tu configuración de servidor
 */

// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_NAME', 'registros_litoralGD');
define('DB_USER', 'root'); // Cambia por tu usuario de MySQL
define('DB_PASS', ''); // Cambia por tu contraseña de MySQL
define('DB_CHARSET', 'utf8mb4');

/**
 * Función para obtener la conexión a la base de datos
 * @return PDO|false Retorna la conexión PDO o false en caso de error
 */
function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Error de conexión a la base de datos: " . $e->getMessage());
        return false;
    }
}

/**
 * Función para verificar si la conexión a la base de datos está activa
 * @return bool
 */
function testConnection() {
    $conn = getDBConnection();
    if ($conn) {
        $conn = null;
        return true;
    }
    return false;
}

