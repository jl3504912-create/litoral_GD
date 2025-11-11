# Base de Datos MySQL - Gestor de Documentos

## Descripción
Este directorio contiene los archivos necesarios para configurar la base de datos MySQL que almacena la información de los usuarios registrados a través del formulario de signup.html.

## Archivos

- `schema.sql`: Script SQL para crear la base de datos y la tabla de usuarios
- `config.php`: Archivo de configuración de conexión a la base de datos
- `README.md`: Este archivo con las instrucciones

## Instalación

### 1. Requisitos Previos
- Servidor MySQL (MySQL 5.7 o superior, o MariaDB 10.2 o superior)
- PHP 7.4 o superior
- Extensión PDO de PHP habilitada
- Servidor web (Apache, Nginx, etc.)

### 2. Crear la Base de Datos

#### Opción A: Desde la línea de comandos
```bash
mysql -u root -p < schema.sql
```

#### Opción B: Desde phpMyAdmin o MySQL Workbench
1. Abre phpMyAdmin o MySQL Workbench
2. Importa el archivo `schema.sql`
3. Ejecuta el script

#### Opción C: Manualmente
```sql
-- Conéctate a MySQL
mysql -u root -p

-- Ejecuta los comandos del archivo schema.sql
SOURCE /ruta/a/schema.sql;
```

### 3. Configurar la Conexión

Edita el archivo `database/config.php` y ajusta las siguientes constantes según tu configuración:

```php
define('DB_HOST', 'localhost');        // Host de MySQL
define('DB_NAME', 'registros_litoralGD');  // Nombre de la base de datos
define('DB_USER', 'root');             // Usuario de MySQL
define('DB_PASS', '');                 // Contraseña de MySQL
```

### 4. Permisos de Archivos

Asegúrate de que el servidor web tenga permisos de lectura en el archivo `config.php`:

```bash
chmod 644 database/config.php
```

### 5. Seguridad (Recomendado)

Para mayor seguridad, crea un usuario específico para la aplicación en lugar de usar `root`:

```sql
-- Crear usuario
CREATE USER 'gestor_app'@'localhost' IDENTIFIED BY 'tu_contraseña_segura';

-- Otorgar permisos
GRANT SELECT, INSERT, UPDATE ON registros_litoralGD.* TO 'gestor_app'@'localhost';

-- Aplicar cambios
FLUSH PRIVILEGES;
```

Luego actualiza `config.php` con las credenciales del nuevo usuario.

## Estructura de la Tabla

La tabla `usuarios` contiene los siguientes campos:

- `id`: ID único del usuario (auto-incremental)
- `email`: Email institucional (@litoral.edu.co) - ÚNICO
- `phone`: Número de teléfono (10 dígitos)
- `first_name`: Nombres del usuario
- `last_name`: Apellidos del usuario
- `password`: Contraseña hasheada (bcrypt)
- `institutional_id`: Código institucional (10 dígitos) - ÚNICO
- `terms_accepted`: Aceptación de términos y condiciones (boolean)
- `created_at`: Fecha de creación (timestamp)
- `updated_at`: Fecha de última actualización (timestamp)

## Validaciones

El sistema valida:
- Email debe ser del dominio @litoral.edu.co
- Teléfono debe tener exactamente 10 dígitos
- Contraseña debe tener:
  - Mínimo 8 caracteres
  - Al menos una mayúscula
  - Al menos un número
  - Al menos un carácter especial (!@#$%^&*)
- Código institucional debe tener exactamente 10 dígitos
- Email y código institucional deben ser únicos

## Uso

Una vez configurada la base de datos, los usuarios pueden registrarse a través del formulario en `src/signup.html`. Los datos se envían al endpoint `api/register.php` que los valida y guarda en la base de datos.

## Verificación

Para verificar que la base de datos está funcionando correctamente:

```sql
-- Conectarte a la base de datos
USE registros_litoralGD;

-- Ver la estructura de la tabla
DESCRIBE usuarios;

-- Ver los usuarios registrados (sin mostrar contraseñas)
SELECT id, email, first_name, last_name, institutional_id, created_at 
FROM usuarios;
```

## Solución de Problemas

### Error de conexión
- Verifica que MySQL esté ejecutándose
- Verifica las credenciales en `config.php`
- Verifica que el usuario tenga permisos en la base de datos

### Error de permisos
- Verifica los permisos del usuario de MySQL
- Asegúrate de que el usuario tenga permisos SELECT, INSERT, UPDATE

### Error de charset
- La base de datos usa utf8mb4 para soportar caracteres especiales
- Verifica que tu servidor MySQL soporte utf8mb4

## Soporte

Para problemas o preguntas, consulta la documentación de MySQL y PHP.

