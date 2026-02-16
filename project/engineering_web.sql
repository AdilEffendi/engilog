-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 16, 2026 at 09:43 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `engineering_web`
--

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `location` varchar(255) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `status` enum('aktif','tidak_aktif') DEFAULT 'aktif',
  `createdBy` varchar(255) DEFAULT NULL,
  `assetId` varchar(255) DEFAULT NULL,
  `machineName` varchar(255) DEFAULT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `serialNumber` varchar(255) DEFAULT NULL,
  `assetTag` varchar(255) DEFAULT NULL,
  `statusMesin` varchar(255) DEFAULT 'Normal',
  `tingkatPrioritas` varchar(255) DEFAULT NULL,
  `kondisiFisik` varchar(255) DEFAULT NULL,
  `jamOperasional` varchar(255) DEFAULT NULL,
  `photos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos`)),
  `floor` int(11) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `name`, `description`, `category`, `quantity`, `location`, `latitude`, `longitude`, `status`, `createdBy`, `assetId`, `machineName`, `brand`, `model`, `serialNumber`, `assetTag`, `statusMesin`, `tingkatPrioritas`, `kondisiFisik`, `jamOperasional`, `photos`, `floor`, `createdAt`, `updatedAt`) VALUES
('1', 'Item Security 01', 'Deskripsi otomatis untuk item 1 dengan koordinat acak.', 'Security', 1, 'Pentacity Mall - Area Teknis', -1.2743429433512035, 116.85693190660851, 'aktif', 'admin', 'AST-AUTO-001', 'Mesin Security Tipe-1', 'Generic Brand', 'Model-X1', 'SN-2024-1001', 'TAG-2001', 'Dipinjam', 'High', 'Sedang', '3281 Jam', '[]', 1, '2026-02-16 08:04:57', '2026-02-16 08:08:07'),
('10', 'Item Transport 10', 'Deskripsi otomatis untuk item 10 dengan koordinat acak.', 'Transport', 1, 'Pentacity Mall - Area Teknis', -1.274471085947021, 116.85704662888025, 'aktif', 'admin', 'AST-AUTO-010', 'Mesin Transport Tipe-10', 'Generic Brand', 'Model-X10', 'SN-2024-1010', 'TAG-2010', 'Standby', 'Critical', 'Bagus', '2906 Jam', '[]', 1, '2026-02-16 08:04:57', '2026-02-16 08:04:57'),
('2', 'Item Security 02', 'Deskripsi otomatis untuk item 2 dengan koordinat acak.', 'Security', 1, 'Pentacity Mall - Area Teknis', -1.2744115930721958, 116.85706778296705, 'aktif', 'admin', 'AST-AUTO-002', 'Mesin Security Tipe-2', 'Generic Brand', 'Model-X2', 'SN-2024-1002', 'TAG-2002', 'Rusak', 'High', 'Bagus', '565 Jam', '[]', 1, '2026-02-16 08:04:57', '2026-02-16 08:04:57'),
('3', 'Item Security 03', 'Deskripsi otomatis untuk item 3 dengan koordinat acak.', 'Security', 1, 'Pentacity Mall - Area Teknis', -1.2743426787740793, 116.85698754092016, 'aktif', 'admin', 'AST-AUTO-003', 'Mesin Security Tipe-3', 'Generic Brand', 'Model-X3', 'SN-2024-1003', 'TAG-2003', 'Maintenance', 'High', 'Sedang', '2049 Jam', '[]', 1, '2026-02-16 08:04:57', '2026-02-16 08:04:57'),
('4', 'Item Plumbing 04', 'Deskripsi otomatis untuk item 4 dengan koordinat acak.', 'Plumbing', 1, 'Pentacity Mall - Area Teknis', -1.2742766728334276, 116.85697450347241, 'aktif', 'admin', 'AST-AUTO-004', 'Mesin Plumbing Tipe-4', 'Generic Brand', 'Model-X4', 'SN-2024-1004', 'TAG-2004', 'Normal', 'Low', 'Buruk', '4540 Jam', '[]', 1, '2026-02-16 08:04:57', '2026-02-16 08:04:57'),
('5', 'Item Plumbing 05', 'Deskripsi otomatis untuk item 5 dengan koordinat acak.', 'Plumbing', 1, 'Pentacity Mall - Area Teknis', -1.2743199113922943, 116.85702511337064, 'aktif', 'admin', 'AST-AUTO-005', 'Mesin Plumbing Tipe-5', 'Generic Brand', 'Model-X5', 'SN-2024-1005', 'TAG-2005', 'Rusak', 'High', 'Bagus', '3682 Jam', '[]', 1, '2026-02-16 08:04:57', '2026-02-16 08:04:57'),
('6', 'Item Transport 06', 'Deskripsi otomatis untuk item 6 dengan koordinat acak.', 'Transport', 1, 'Pentacity Mall - Area Teknis', -1.2743145354725258, 116.85696470307636, 'aktif', 'admin', 'AST-AUTO-006', 'Mesin Transport Tipe-6', 'Generic Brand', 'Model-X6', 'SN-2024-1006', 'TAG-2006', 'Rusak', 'Critical', 'Bagus', '4903 Jam', '[]', 1, '2026-02-16 08:04:57', '2026-02-16 08:04:57'),
('7', 'Item Transport 07', 'Deskripsi otomatis untuk item 7 dengan koordinat acak.', 'Transport', 1, 'Pentacity Mall - Area Teknis', -1.274469815982771, 116.85702570620894, 'aktif', 'admin', 'AST-AUTO-007', 'Mesin Transport Tipe-7', 'Generic Brand', 'Model-X7', 'SN-2024-1007', 'TAG-2007', 'Normal', 'Low', 'Sedang', '1623 Jam', '[]', 1, '2026-02-16 08:04:57', '2026-02-16 08:04:57'),
('8', 'Item HVAC 08', 'Deskripsi otomatis untuk item 8 dengan koordinat acak.', 'HVAC', 1, 'Pentacity Mall - Area Teknis', -1.2744368257656038, 116.8570095696223, 'aktif', 'admin', 'AST-AUTO-008', 'Mesin HVAC Tipe-8', 'Generic Brand', 'Model-X8', 'SN-2024-1008', 'TAG-2008', 'Standby', 'Medium', 'Sedang', '2509 Jam', '[]', 1, '2026-02-16 08:04:57', '2026-02-16 08:04:57'),
('9', 'Item Transport 09', 'Deskripsi otomatis untuk item 9 dengan koordinat acak.', 'Transport', 1, 'Pentacity Mall - Area Teknis', -1.2743097190730142, 116.85703145465013, 'aktif', 'admin', 'AST-AUTO-009', 'Mesin Transport Tipe-9', 'Generic Brand', 'Model-X9', 'SN-2024-1009', 'TAG-2009', 'Standby', 'Low', 'Bagus', '4491 Jam', '[]', 1, '2026-02-16 08:04:57', '2026-02-16 08:04:57');

-- --------------------------------------------------------

--
-- Table structure for table `loanrecords`
--

CREATE TABLE `loanrecords` (
  `id` int(11) NOT NULL,
  `borrowerName` varchar(255) NOT NULL,
  `department` varchar(255) DEFAULT NULL,
  `borrowDate` datetime NOT NULL,
  `returnDate` datetime DEFAULT NULL,
  `condition` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `returnedBy` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `itemId` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `maintenancerecords`
--

CREATE TABLE `maintenancerecords` (
  `id` int(11) NOT NULL,
  `tanggalKerusakan` datetime DEFAULT NULL,
  `penyebab` text DEFAULT NULL,
  `tindakan` text DEFAULT NULL,
  `kondisiAkhir` varchar(255) DEFAULT NULL,
  `teknisi` varchar(255) DEFAULT NULL,
  `tanggalSelesai` datetime DEFAULT NULL,
  `foto` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `itemId` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `passwordPlaintext` varchar(255) DEFAULT NULL,
  `role` enum('superadmin','admin','peminjam','teknisi') NOT NULL DEFAULT 'peminjam',
  `nik` varchar(255) DEFAULT NULL,
  `division` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `password`, `passwordPlaintext`, `role`, `nik`, `division`, `createdAt`, `updatedAt`) VALUES
('1', 'admin', 'password', NULL, 'admin', NULL, NULL, '2026-02-16 08:04:57', '2026-02-16 08:04:57'),
('2', 'superadmin', 'password', NULL, 'superadmin', NULL, NULL, '2026-02-16 08:04:57', '2026-02-16 08:04:57'),
('3', 'peminjam', 'peminjam', NULL, 'peminjam', NULL, NULL, '2026-02-16 08:04:57', '2026-02-16 08:04:57'),
('4', 'teknisi', 'teknisi', NULL, 'teknisi', NULL, NULL, '2026-02-16 08:04:57', '2026-02-16 08:04:57'),
('5', 'epi', 'epi', NULL, 'peminjam', NULL, NULL, '2026-02-16 08:04:57', '2026-02-16 08:04:57');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `loanrecords`
--
ALTER TABLE `loanrecords`
  ADD PRIMARY KEY (`id`),
  ADD KEY `itemId` (`itemId`);

--
-- Indexes for table `maintenancerecords`
--
ALTER TABLE `maintenancerecords`
  ADD PRIMARY KEY (`id`),
  ADD KEY `itemId` (`itemId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `loanrecords`
--
ALTER TABLE `loanrecords`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `maintenancerecords`
--
ALTER TABLE `maintenancerecords`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `loanrecords`
--
ALTER TABLE `loanrecords`
  ADD CONSTRAINT `loanrecords_ibfk_1` FOREIGN KEY (`itemId`) REFERENCES `items` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `loanrecords_ibfk_2` FOREIGN KEY (`itemId`) REFERENCES `items` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `maintenancerecords`
--
ALTER TABLE `maintenancerecords`
  ADD CONSTRAINT `maintenancerecords_ibfk_1` FOREIGN KEY (`itemId`) REFERENCES `items` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `maintenancerecords_ibfk_2` FOREIGN KEY (`itemId`) REFERENCES `items` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
