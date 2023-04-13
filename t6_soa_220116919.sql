/*
SQLyog Community v13.2.0 (64 bit)
MySQL - 8.0.30 : Database - t6_soa_220116919
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`t6_soa_220116919` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `t6_soa_220116919`;

/*Table structure for table `kendaraan` */

DROP TABLE IF EXISTS `kendaraan`;

CREATE TABLE `kendaraan` (
  `id` varchar(5) COLLATE utf8mb4_general_ci NOT NULL,
  `nomor_plat` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `jenis` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `kurir` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `kendaraan` */

insert  into `kendaraan`(`id`,`nomor_plat`,`jenis`,`kurir`) values 
('KD001','L 1234 ABC','Honda SupraX 125CC','Bambang');

/*Table structure for table `orders` */

DROP TABLE IF EXISTS `orders`;

CREATE TABLE `orders` (
  `id` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nama_pengirim` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `nama_penerima` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `no_telp_penerima` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `alamat_penerima` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `nama_barang` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `berat_barang` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `biaya` int NOT NULL,
  `status` enum('Menunggu Pembayaran','Menunggu Kurir','Sedang Mengirim','Paket Terkirimkan') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Menunggu Pembayaran',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `orders` */

insert  into `orders`(`id`,`nama_pengirim`,`nama_penerima`,`no_telp_penerima`,`alamat_penerima`,`nama_barang`,`berat_barang`,`biaya`,`status`) values 
('OX230413001','Christian Chen','maria','0823402335','Jalan Sehat 34','Tepung Beras Rose Brand','1.2kg',37000,'Paket Terkirimkan'),
('OX230413002','Lawrence Patrick','maria','0823402335','Jalan Sehat 34','Tepung Beras Rose Brand','1.2kg',15000,'Menunggu Pembayaran');

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `username` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `nama` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `no_telp` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `jenis` enum('C','K') COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `users` */

insert  into `users`(`username`,`nama`,`no_telp`,`jenis`,`password`) values 
('bambang','Bambang','0812345678','K','bbg'),
('christian','Christian Chen','0812345678','C','abcde'),
('lawrence','Lawrence Patrick','0812345678','C','law');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
