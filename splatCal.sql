-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Jul 25, 2025 at 01:39 PM
-- Server version: 11.3.2-MariaDB-1:11.3.2+maria~ubu2204
-- PHP Version: 8.2.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `splatCal`
--

-- --------------------------------------------------------

--
-- Table structure for table `dataTypes`
--

CREATE TABLE IF NOT EXISTS `dataTypes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dataType` varchar(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dataTypes`
--

INSERT INTO `dataTypes` (`id`, `dataType`) VALUES
(1, 'Name'),
(2, 'Location'),
(3, 'Link'),
(4, 'Team'),
(5, 'imgUrl');

-- --------------------------------------------------------

--
-- Table structure for table `descData`
--

CREATE TABLE IF NOT EXISTS `descData` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `calId` int(11) NOT NULL,
  `locationNum` int(11) NOT NULL,
  `dataCalId` int(11) NOT NULL,
  `dataTypeId` int(11) NOT NULL,
  `data` varchar(250) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `calId` (`calId`),
  KEY `dataTypeId` (`dataTypeId`)
) ENGINE=InnoDB AUTO_INCREMENT=351 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `discordSent`
--

CREATE TABLE IF NOT EXISTS `discordSent` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `channelId` decimal(25,0) NOT NULL,
  `messageId` decimal(25,0) NOT NULL,
  `calId` int(11) NOT NULL,
  `messageType` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `discordSentCalId` (`calId`),
  KEY `sentMessageType` (`messageType`)
) ENGINE=InnoDB AUTO_INCREMENT=5173 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `eventTypes`
--

CREATE TABLE IF NOT EXISTS `eventTypes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `eventTypes`
--

INSERT INTO `eventTypes` (`id`, `event`) VALUES
(1, 'splatfest');

-- --------------------------------------------------------

--
-- Table structure for table `messageTypes`
--

CREATE TABLE IF NOT EXISTS `messageTypes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `eventId` int(11) NOT NULL,
  `messageType` varchar(15) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `messageEvent` (`eventId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messageTypes`
--

INSERT INTO `messageTypes` (`id`, `eventId`, `messageType`) VALUES
(1, 1, 'newSplatfest'),
(2, 1, 'splatfestWin');

-- --------------------------------------------------------

--
-- Table structure for table `splatCal`
--

CREATE TABLE IF NOT EXISTS `splatCal` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `eventId` int(11) NOT NULL,
  `title` varchar(20) NOT NULL,
  `startDate` datetime NOT NULL,
  `endDate` datetime NOT NULL,
  `created` datetime NOT NULL,
  `uid` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `calEvent` (`eventId`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `win`
--

CREATE TABLE IF NOT EXISTS `win` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `calId` int(11) NOT NULL,
  `descId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `winCalId` (`calId`),
  KEY `winDescId` (`descId`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `descData`
--
ALTER TABLE `descData`
  ADD CONSTRAINT `descData_ibfk_1` FOREIGN KEY (`calId`) REFERENCES `splatCal` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `descData_ibfk_2` FOREIGN KEY (`dataTypeId`) REFERENCES `dataTypes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `discordSent`
--
ALTER TABLE `discordSent`
  ADD CONSTRAINT `discordSentCalId` FOREIGN KEY (`calId`) REFERENCES `splatCal` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `sentMessageType` FOREIGN KEY (`messageType`) REFERENCES `messageTypes` (`id`);

--
-- Constraints for table `messageTypes`
--
ALTER TABLE `messageTypes`
  ADD CONSTRAINT `messageEvent` FOREIGN KEY (`eventId`) REFERENCES `eventTypes` (`id`);

--
-- Constraints for table `splatCal`
--
ALTER TABLE `splatCal`
  ADD CONSTRAINT `calEvent` FOREIGN KEY (`eventId`) REFERENCES `eventTypes` (`id`);

--
-- Constraints for table `win`
--
ALTER TABLE `win`
  ADD CONSTRAINT `winCalId` FOREIGN KEY (`calId`) REFERENCES `splatCal` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `winDescId` FOREIGN KEY (`descId`) REFERENCES `descData` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
