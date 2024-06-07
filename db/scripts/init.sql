-- -----------------------------------------------------
-- Schema db
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `db`;
USE `db`;


-- -----------------------------------------------------
-- Table `db`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db`.`user` (
  `usr_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `usr_name` VARCHAR(255) NOT NULL,
  `usr_email` VARCHAR(255) NOT NULL,
  `usr_password` CHAR(60) NOT NULL,
  `usr_created` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`usr_id`),
  UNIQUE INDEX `usr_email_UNIQUE` (`usr_email` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db`.`role`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db`.`role` (
  `rol_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `rol_name` VARCHAR(45) NOT NULL,
  `rol_created` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`rol_id`),
  UNIQUE INDEX `rol_name_UNIQUE` (`rol_name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db`.`user_role`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db`.`user_role` (
  `url_usr_id` INT UNSIGNED NOT NULL,
  `url_rol_id` INT UNSIGNED NOT NULL,
  `url_created` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`url_usr_id`, `url_rol_id`),
  INDEX `fk_url_usr_idx` (`url_usr_id` ASC) VISIBLE,
  INDEX `fk_url_rol_idx` (`url_rol_id` ASC) VISIBLE,
  CONSTRAINT `fk_url_usr` FOREIGN KEY (`url_usr_id`) REFERENCES `db`.`user` (`usr_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_url_rol` FOREIGN KEY (`url_rol_id`) REFERENCES `db`.`role` (`rol_id`) ON DELETE CASCADE)
ENGINE = InnoDB;
