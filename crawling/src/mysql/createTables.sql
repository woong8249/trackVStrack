CREATE TABLE IF NOT EXISTS `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255),
  `nickname` VARCHAR(50),
  `password` VARCHAR(255),
  `created_at` DATETIME
);

CREATE TABLE IF NOT EXISTS `subscribes` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT,
  `track_id` INT,
  `created_at` DATETIME
);

CREATE TABLE IF NOT EXISTS `posts` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT,
  `type` VARCHAR(50),
  `title` VARCHAR(100),
  `text` TEXT,
  `created_at` DATETIME
);

CREATE TABLE IF NOT EXISTS `comments` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `post_id` INT,
  `parent_id` INT,
  `user_id` INT,
  `text` VARCHAR(1000),
  `created_at` DATETIME
);

CREATE TABLE IF NOT EXISTS `artists` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50),
  `nameKeyword` VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS `tracks` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(50),
  `release_date` DATE,
  `track_image` VARCHAR(255),
  `thumbnails` VARCHAR(512),
  `platforms` JSON
);

CREATE TABLE IF NOT EXISTS `trackDetails` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `artist_id` INT,
  `track_id` INT
);

ALTER TABLE `trackDetails` ADD FOREIGN KEY (`artist_id`) REFERENCES `artists` (`id`);

ALTER TABLE `trackDetails` ADD FOREIGN KEY (`track_id`) REFERENCES `tracks` (`id`);

ALTER TABLE `subscribes` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `subscribes` ADD FOREIGN KEY (`track_id`) REFERENCES `tracks` (`id`);

ALTER TABLE `posts` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `comments` ADD FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`);

ALTER TABLE `comments` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `comments` ADD FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`);
