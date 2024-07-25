-- -----------------------------------------------------
-- Schema db
-- -----------------------------------------------------
USE `db`;


-- -----------------------------------------------------
-- Table `permissible`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `permissible` (
  `pbl_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`pbl_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `user` (
  `usr_id` INT UNSIGNED NOT NULL,
  `usr_name` VARCHAR(255) NOT NULL,
  `usr_email` VARCHAR(255) NOT NULL,
  `usr_password` CHAR(60) NOT NULL,
  `usr_created` DATETIME(3) NOT NULL DEFAULT NOW(3),
  PRIMARY KEY (`usr_id`),
  INDEX `fk_usr_pbl_idx` (`usr_id` ASC) VISIBLE,
  UNIQUE INDEX `usr_email_UNIQUE` (`usr_email` ASC) VISIBLE,
  CONSTRAINT `fk_usr_pbl` FOREIGN KEY (`usr_id`) REFERENCES `permissible` (`pbl_id`) ON DELETE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `role`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `role` (
  `rol_id` INT UNSIGNED NOT NULL,
  `rol_name` VARCHAR(45) NOT NULL,
  `rol_created` DATETIME(3) NOT NULL DEFAULT NOW(3),
  PRIMARY KEY (`rol_id`),
  INDEX `fk_rol_pbl_idx` (`rol_id` ASC) VISIBLE,
  UNIQUE INDEX `rol_name_UNIQUE` (`rol_name` ASC) VISIBLE,
  CONSTRAINT `fk_rol_pbl` FOREIGN KEY (`rol_id`) REFERENCES `permissible` (`pbl_id`) ON DELETE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `user_role`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_role` (
  `url_usr_id` INT UNSIGNED NOT NULL,
  `url_rol_id` INT UNSIGNED NOT NULL,
  `url_created` DATETIME(3) NOT NULL DEFAULT NOW(3),
  PRIMARY KEY (`url_usr_id`, `url_rol_id`),
  INDEX `fk_url_usr_idx` (`url_usr_id` ASC) VISIBLE,
  INDEX `fk_url_rol_idx` (`url_rol_id` ASC) VISIBLE,
  CONSTRAINT `fk_url_usr` FOREIGN KEY (`url_usr_id`) REFERENCES `user` (`usr_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_url_rol` FOREIGN KEY (`url_rol_id`) REFERENCES `role` (`rol_id`) ON DELETE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `permission`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `permission` (
  `per_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `per_name` VARCHAR(45) NOT NULL,
  `per_pbl_id` INT UNSIGNED NULL,
  `per_created` DATETIME(3) NOT NULL DEFAULT NOW(3),
  PRIMARY KEY (`per_id`),
  INDEX `fk_per_pbl_idx` (`per_pbl_id` ASC) VISIBLE,
  UNIQUE INDEX `per_UNIQUE` (`per_name` ASC, `per_pbl_id` ASC) VISIBLE,
  CONSTRAINT `fk_per_pbl` FOREIGN KEY (`per_pbl_id`) REFERENCES `permissible` (`pbl_id`) ON DELETE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `role_permission`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `role_permission` (
  `rlp_rol_id` INT UNSIGNED NOT NULL,
  `rlp_per_id` INT UNSIGNED NOT NULL,
  `rlp_created` DATETIME(3) NOT NULL DEFAULT NOW(3),
  PRIMARY KEY (`rlp_rol_id`, `rlp_per_id`),
  INDEX `fk_rlp_rol_idx` (`rlp_rol_id` ASC) VISIBLE,
  INDEX `fk_rlp_per_idx` (`rlp_per_id` ASC) VISIBLE,
  CONSTRAINT `fk_rlp_rol` FOREIGN KEY (`rlp_rol_id`) REFERENCES `role` (`rol_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rlp_per` FOREIGN KEY (`rlp_per_id`) REFERENCES `permission` (`per_id`) ON DELETE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `user_permission`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_permission` (
  `urp_usr_id` INT UNSIGNED NOT NULL,
  `urp_per_id` INT UNSIGNED NOT NULL,
  `urp_created` DATETIME(3) NOT NULL DEFAULT NOW(3),
  PRIMARY KEY (`urp_usr_id`, `urp_per_id`),
  INDEX `fk_urp_usr_idx` (`urp_usr_id` ASC) VISIBLE,
  INDEX `fk_urp_per_idx` (`urp_per_id` ASC) VISIBLE,
  CONSTRAINT `fk_urp_usr` FOREIGN KEY (`urp_usr_id`) REFERENCES `user` (`usr_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_urp_per` FOREIGN KEY (`urp_per_id`) REFERENCES `permission` (`per_id`) ON DELETE CASCADE)
ENGINE = InnoDB;
