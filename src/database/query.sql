CREATE DATABASE app_pelis;

USE app_pelis;

CREATE TABLE usuarios(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    contraseña LONGTEXT NOT NULL,
    es_admin TINYINT NOT NULL DEFAULT 0
);

CREATE TABLE categorias(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE peliculas(
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(50) NOT NULL,
    descripcion LONGTEXT NOT NULL,
    puntaje DECIMAL(3, 1) NOT NULL,
    imagen LONGBLOB NOT NULL,
    nombre_imagen VARCHAR(50) NOT NULL,
    id_categoria INT NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id)
);

CREATE TABLE puntuaciones(
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_pelicula INT NOT NULL,
    id_usuario INT NOT NULL,
    puntaje DECIMAL(3, 1),
    FOREIGN KEY (id_pelicula) REFERENCES peliculas(id),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

INSERT INTO categorias (nombre) VALUES 
('terror'),
('acción'),
('drama'),
('ciencia ficción');

INSERT INTO usuarios (nombre, apellido, email, contraseña, es_admin) VALUES 
('Administrador', '', 'admin@admin.com', '$2b$10$qIeSc5SyuJRmbqspViRhVOP.zvjohfvxla0hNHp.Pe4Unn/vHDAKC', 1);

