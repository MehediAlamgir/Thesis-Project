-- phpMyAdmin SQL Dump
-- version 4.0.9
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Dec 05, 2015 at 05:05 PM
-- Server version: 5.6.14
-- PHP Version: 5.5.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `wordnet_bangla`
--

-- --------------------------------------------------------

--
-- Table structure for table `banglameaning`
--

CREATE TABLE IF NOT EXISTS `banglameaning` (
  `id` int(10) NOT NULL,
  `synsetID` int(10) NOT NULL,
  `word` varchar(100) CHARACTER SET utf8 NOT NULL,
  PRIMARY KEY (`synsetID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `banglameaning`
--

INSERT INTO `banglameaning` (`id`, `synsetID`, `word`) VALUES
(65089, 108242256, 'প্রতিবেশি\n'),
(85647, 111503106, 'কুয়াশা\n'),
(431, 114572662, 'হাটতে অক্ষম '),
(91114, 115190537, 'কেও না\n');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
