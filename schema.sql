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

CREATE TABLE user_roles(
    id integer PRIMARY KEY AUTO_INCREMENT,
    user_role VARCHAR(255) NOT NULL
);

INSERT INTO user_roles (user_role)
VALUES
('Admin');
INSERT INTO user_roles (user_role)
VALUES
('Lab Assistant');

CREATE TABLE category_user_roles(
    id integer PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(255) NOT NULL,
    user_roles_ids VARCHAR(255) NOT NULL
);

INSERT INTO category_user_roles(category_id, user_roles_ids)
VALUES
(1, '1,2');

CREATE TABLE category(
    id integer PRIMARY KEY AUTO_INCREMENT,
    category_id integer NOT NULL,
    category VARCHAR(255) NOT NULL,
    stage_ids VARCHAR(255) NOT NULL,
    parent_category_id integer,
    sort integer NOT NULL,
    status VARCHAR(255) NOT NULL
);

INSERT INTO category (category_id, category, stage_ids, parent_category_id, sort, status)
VALUES
('1', 'Air', '16,17', null, 1, 'Active');