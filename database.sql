-- ============================================================
--  BookStore Database
--  Run this file once to set up your database
-- ============================================================

CREATE DATABASE IF NOT EXISTS bookstore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bookstore;

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(150)        NOT NULL,
    email      VARCHAR(191)        NOT NULL UNIQUE,
    password   VARCHAR(255)        NOT NULL,
    role       ENUM('user','admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── CATEGORIES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ── BOOKS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS books (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255)   NOT NULL,
    author      VARCHAR(255)   NOT NULL,
    price       DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    description TEXT,
    image       VARCHAR(500)   DEFAULT '',
    category_id INT,
    created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── ORDERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT            NOT NULL,
    total_price DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    status      ENUM('pending','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── ORDER ITEMS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT           NOT NULL,
    book_id  INT           NOT NULL,
    quantity INT           NOT NULL DEFAULT 1,
    price    DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id)  REFERENCES books(id)  ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
--  SEED DATA
-- ============================================================

-- Admin user  (password: admin123)
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Admin', 'admin@bookstore.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Regular user  (password: user123)
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Ahmed Hassan', 'ahmed@example.com', '$2y$10$TKh8H1.PfbuNkLSN3jlDNePVvKPFoQbkB1v3WKKC.RwJhJxTJa9e2', 'user');

-- Categories
INSERT IGNORE INTO categories (name) VALUES
('Fiction'),
('Science'),
('History'),
('Technology'),
('Self-Help'),
('Business'),
('Children'),
('Biography');

-- Books
INSERT INTO books (title, author, price, description, image, category_id) VALUES
('The Great Gatsby',       'F. Scott Fitzgerald', 12.99, 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.', 'https://covers.openlibrary.org/b/id/8432472-L.jpg',  1),
('To Kill a Mockingbird',  'Harper Lee',          14.99, 'The story of racial injustice and the loss of innocence in the American South.', 'https://covers.openlibrary.org/b/id/8228691-L.jpg',  1),
('1984',                   'George Orwell',       10.99, 'A dystopian novel set in a totalitarian society ruled by Big Brother.', 'https://covers.openlibrary.org/b/id/8575708-L.jpg',  1),
('A Brief History of Time','Stephen Hawking',     15.99, 'From the Big Bang to black holes, a landmark volume in science writing.', 'https://covers.openlibrary.org/b/id/8481981-L.jpg',  2),
('Sapiens',                'Yuval Noah Harari',   16.99, 'A brief history of humankind from the Stone Age to the present.', 'https://covers.openlibrary.org/b/id/10305957-L.jpg', 3),
('Clean Code',             'Robert C. Martin',    29.99, 'A handbook of agile software craftsmanship.', 'https://covers.openlibrary.org/b/id/8621137-L.jpg',  4),
('The Pragmatic Programmer','David Thomas',       34.99, 'From journeyman to master — tips for programmers.', 'https://covers.openlibrary.org/b/id/6575344-L.jpg',  4),
('Atomic Habits',          'James Clear',         18.99, 'An easy and proven way to build good habits and break bad ones.', 'https://covers.openlibrary.org/b/id/10295105-L.jpg', 5),
('The 7 Habits',           'Stephen R. Covey',    13.99, '7 Habits of Highly Effective People.', 'https://covers.openlibrary.org/b/id/8231432-L.jpg',  6),
('Steve Jobs',             'Walter Isaacson',     19.99, 'The exclusive biography based on more than forty interviews.', 'https://covers.openlibrary.org/b/id/7315186-L.jpg',  8);
