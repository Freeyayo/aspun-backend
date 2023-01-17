CREATE DATABASE aspun;
USE aspun;

CREATE TABLE users(
    id integer PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO users (username, password)
VALUES
('admin', 'admin');