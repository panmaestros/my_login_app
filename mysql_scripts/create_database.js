
CREATE SCHEMA `Mark` ;
CREATE TABLE `mark`.`users` (
 `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
 `username` VARCHAR(45) NOT NULL,
 `password` VARCHAR(60) NOT NULL,
 PRIMARY KEY (`id`),
 UNIQUE INDEX `id_UNIQUE` (`id` ASC),
 UNIQUE INDEX `username_UNIQUE` (`username` ASC));

ALTER TABLE `mark`.`users`
ADD COLUMN `failedloginAttempts` INT(11) NOT NULL DEFAULT 0 AFTER `password`;

ALTER TABLE `mark`.`users`
ADD COLUMN `salt` VARCHAR(60) NOT NULL AFTER `failedLoginAttempts`;


CREATE TABLE `mark`.`ipslocked` (
  `ipaddress` VARCHAR(45) NOT NULL,
  `lastLockedTime` DATETIME NULL,
  PRIMARY KEY (`ipaddress`),
  UNIQUE INDEX `ipaddress_UNIQUE` (`ipaddress` ASC));
