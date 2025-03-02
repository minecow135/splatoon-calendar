-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Mar 02, 2025 at 10:46 PM
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

CREATE TABLE `dataTypes` (
  `id` int(11) NOT NULL,
  `dataType` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

CREATE TABLE `descData` (
  `id` int(11) NOT NULL,
  `calId` int(11) NOT NULL,
  `locationNum` int(11) NOT NULL,
  `dataCalId` int(11) NOT NULL,
  `dataTypeId` int(11) NOT NULL,
  `data` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `discordSent`
--

CREATE TABLE `discordSent` (
  `id` int(11) NOT NULL,
  `channelId` decimal(25,0) NOT NULL,
  `messageId` decimal(25,0) NOT NULL,
  `calId` int(11) NOT NULL,
  `messageType` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `eventTypes`
--

CREATE TABLE `eventTypes` (
  `id` int(11) NOT NULL,
  `event` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `eventTypes`
--

INSERT INTO `eventTypes` (`id`, `event`) VALUES
(1, 'splatfest');

-- --------------------------------------------------------

--
-- Table structure for table `messageTypes`
--

CREATE TABLE `messageTypes` (
  `id` int(11) NOT NULL,
  `eventId` int(11) NOT NULL,
  `messageType` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

CREATE TABLE `splatCal` (
  `id` int(11) NOT NULL,
  `eventId` int(11) NOT NULL,
  `title` varchar(20) NOT NULL,
  `startDate` datetime NOT NULL,
  `endDate` datetime NOT NULL,
  `created` datetime NOT NULL,
  `uid` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `win`
--

CREATE TABLE `win` (
  `id` int(11) NOT NULL,
  `calId` int(11) NOT NULL,
  `descId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `dataTypes`
--
ALTER TABLE `dataTypes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `descData`
--
ALTER TABLE `descData`
  ADD PRIMARY KEY (`id`),
  ADD KEY `calId` (`calId`),
  ADD KEY `dataTypeId` (`dataTypeId`);

--
-- Indexes for table `discordSent`
--
ALTER TABLE `discordSent`
  ADD PRIMARY KEY (`id`),
  ADD KEY `discordSentCalId` (`calId`),
  ADD KEY `sentMessageType` (`messageType`);

--
-- Indexes for table `eventTypes`
--
ALTER TABLE `eventTypes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `messageTypes`
--
ALTER TABLE `messageTypes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `messageEvent` (`eventId`);

--
-- Indexes for table `splatCal`
--
ALTER TABLE `splatCal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `calEvent` (`eventId`);

--
-- Indexes for table `win`
--
ALTER TABLE `win`
  ADD PRIMARY KEY (`id`),
  ADD KEY `winCalId` (`calId`),
  ADD KEY `winDescId` (`descId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `dataTypes`
--
ALTER TABLE `dataTypes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `descData`
--
ALTER TABLE `descData`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `discordSent`
--
ALTER TABLE `discordSent`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `eventTypes`
--
ALTER TABLE `eventTypes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `messageTypes`
--
ALTER TABLE `messageTypes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `splatCal`
--
ALTER TABLE `splatCal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `win`
--
ALTER TABLE `win`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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