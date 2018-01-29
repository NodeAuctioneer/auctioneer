DROP DATABASE IF EXISTS greatbaydb;

CREATE DATABASE greatbaydb;

USE greatbaydb;

CREATE TABLE users (
	id INT(11) NOT NULL AUTO_INCREMENT,
	userName VARCHAR(45),
	password VARCHAR(45),
	PRIMARY KEY (id)
);

CREATE TABLE items (
	id INT(11) NOT NULL AUTO_INCREMENT,
	itemName VARCHAR(45),
	posterUserId VARCHAR(45),
	highestBidId INT(11) NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE bids (
	id INT(11) NOT NULL AUTO_INCREMENT,
	itemId INT(11),
	biddingUserId INT(11),
	bid INT(11),
	PRIMARY KEY (id)
);

