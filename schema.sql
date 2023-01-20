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

CREATE TABLE stage_master(
    id integer PRIMARY KEY AUTO_INCREMENT,
    stage VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    sort integer NOT NULL
);

INSERT INTO stage_master (stage, status, sort)
VALUES
('Inspection', 'Active', 1);