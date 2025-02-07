CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url VARCHAR(500),
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавляем тестовые данные
INSERT INTO products (name, description, price, category) VALUES
('Смартфон XYZ', 'Мощный смартфон с отличной камерой', 29999.99, 'Электроника'),
('Ноутбук ABC', '15.6" ноутбук для работы и учебы', 49999.99, 'Компьютеры'),
('Кофемашина DEF', 'Автоматическая кофемашина с капучинатором', 15999.99, 'Бытовая техника'); 