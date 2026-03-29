CREATE DATABASE IF NOT EXISTS vending_machine;
USE vending_machine;

-- Table to store product information
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    price DECIMAL(4,2) NOT NULL
);

-- Table to represent vending machine inventory
CREATE TABLE machine (
    slot_id VARCHAR(5) PRIMARY KEY,
    product_id INT,
    quantity INT NOT NULL DEFAULT 0,
    capacity INT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE SET NULL
);

-- Table to represent backstock inventory
CREATE TABLE backstock (
    product_id INT PRIMARY KEY,
    stock INT NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE CASCADE
);

-- Table to record purchase transactions
CREATE TABLE purchases (
    purchase_id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    price DECIMAL(4,2) NOT NULL,
    -- Added functionality to map purchase price to products
    -- Ensures price is not being used as foreign key to products, but still allows for price tracking
    product_id INT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE SET NULL
);