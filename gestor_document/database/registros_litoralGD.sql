-- Base de datos para el gestor de documentos
-- Script de creación de base de datos y tabla de usuarios

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS registros_litoralGD CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE registros_litoralGD;

-- Crear la tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE COMMENT 'Email institucional (@litoral.edu.co)',
    phone VARCHAR(20) NOT NULL COMMENT 'Número de teléfono (10 dígitos)',
    first_name VARCHAR(100) NOT NULL COMMENT 'Nombres del usuario',
    last_name VARCHAR(100) NOT NULL COMMENT 'Apellidos del usuario',
    password VARCHAR(255) NOT NULL COMMENT 'Contraseña hasheada',
    institutional_id VARCHAR(20) NOT NULL UNIQUE COMMENT 'Código institucional (10 dígitos)',
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Aceptación de términos y condiciones',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
    INDEX idx_email (email),
    INDEX idx_institutional_id (institutional_id),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla de usuarios registrados';

-- Crear un usuario para la aplicación (opcional, ajustar según necesidades de seguridad)
-- CREATE USER IF NOT EXISTS 'gestor_app'@'localhost' IDENTIFIED BY 'tu_contraseña_segura';
-- GRANT SELECT, INSERT, UPDATE ON registros_litoralGD.* TO 'gestor_app'@'localhost';
-- FLUSH PRIVILEGES;

