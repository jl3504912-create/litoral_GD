# Instalación de Base de Datos MySQL - Gestor de Documentos

## Pasos Rápidos de Instalación

### 1. Crear la Base de Datos

Ejecuta el siguiente comando en tu terminal MySQL:

```bash
mysql -u root -p < database/schema.sql
```

O importa el archivo `database/schema.sql` desde phpMyAdmin.

### 2. Configurar la Conexión

Edita el archivo `database/config.php` y actualiza las credenciales:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'registros_litoralGD');
define('DB_USER', 'tu_usuario');      // Cambia esto
define('DB_PASS', 'tu_contraseña');   // Cambia esto
```

### 3. Verificar que PHP Puede Conectarse

Crea un archivo de prueba `test_connection.php` en la raíz:

```php
<?php
require_once 'database/config.php';

if (testConnection()) {
    echo "✓ Conexión exitosa a la base de datos";
} else {
    echo "✗ Error de conexión. Verifica las credenciales en database/config.php";
}
```

Accede a este archivo desde tu navegador para verificar la conexión.

### 4. Configurar el Servidor Web

Asegúrate de que tu servidor web (Apache/Nginx) esté configurado para:
- Ejecutar PHP
- Tener acceso a los archivos del proyecto
- Permitir peticiones desde `signup.html` a `api/register.php`

### 5. Probar el Registro

1. Abre `src/signup.html` en tu navegador
2. Completa el formulario de registro
3. Verifica que los datos se guarden en la base de datos

## Estructura de Archivos

```
gestor_document/
├── database/
│   ├── schema.sql          # Script de creación de BD
│   ├── config.php          # Configuración de conexión
│   └── README.md           # Documentación detallada
├── api/
│   ├── register.php        # Endpoint de registro
│   └── .htaccess           # Configuración de servidor
└── src/
    ├── signup.html         # Formulario de registro
    └── login.html          # Formulario de login
```

## Verificar Datos en la Base de Datos

Para ver los usuarios registrados:

```sql
USE registros_litoralGD;
SELECT id, email, first_name, last_name, institutional_id, created_at 
FROM usuarios;
```

## Solución de Problemas

### Error 404 al enviar el formulario
- Verifica que la ruta a `api/register.php` sea correcta
- Si `signup.html` está en `src/`, la ruta `../api/register.php` debería funcionar
- Si accedes desde la raíz, la ruta debería ser `api/register.php`

### Error de conexión a la base de datos
- Verifica que MySQL esté ejecutándose
- Verifica las credenciales en `database/config.php`
- Verifica que el usuario tenga permisos en la base de datos

### Error de CORS
- El archivo `.htaccess` en `api/` debería manejar CORS
- Si usas Nginx, configura los headers CORS manualmente

## Seguridad

⚠️ **Importante**: Antes de poner en producción:
1. Cambia las credenciales de la base de datos
2. Crea un usuario específico para la aplicación (no uses `root`)
3. Protege el archivo `config.php` con permisos adecuados
4. Considera usar HTTPS
5. Implementa rate limiting para prevenir ataques

## Más Información

Consulta `database/README.md` para información más detallada sobre la estructura de la base de datos y configuración avanzada.

