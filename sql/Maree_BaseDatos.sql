-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 06, 2026 at 02:12 PM
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
-- Database: `marée`
--

-- --------------------------------------------------------

--
-- Table structure for table `cliente`
--

CREATE TABLE `cliente` (
  `nombre` varchar(100) NOT NULL,
  `número_telefónico` varchar(20) NOT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `género` varchar(10) DEFAULT NULL,
  `fecha_de_nacimiento` date NOT NULL,
  `código_verificación` varchar(10) NOT NULL,
  `visitas_actual` int(11) NOT NULL,
  `nombre_royalty` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Dumping data for table `cliente`
--

INSERT INTO `cliente` (`nombre`, `número_telefónico`, `correo`, `género`, `fecha_de_nacimiento`, `código_verificación`, `visitas_actual`, `nombre_royalty`) VALUES
('Andrea Iliana Cantú Mayorga', '55-1156-9800', 'ailiana@gmail.com', 'f', '0000-00-00', '463572', 9, 'Fan'),
('David Antonio Gandara Ruiz', '55-1827-6651', 'dgandara@gmail.com', 'm', '0000-00-00', '270060', 12, 'Super Fan'),
('Isabela Ruiz Velasco Angeles', '55-2006-6063', 'ivelasco@gmail.com', 'f', '0000-00-00', '942856', 5, 'Fan'),
('Brenda Vázquez Rodríguez', '55-2435-6781', 'bvazquez@gmail.com', 'f', '0000-00-00', '750110', 15, 'Super Fan'),
('Ana Camila Cuevas González', '55-2669-1307', 'acuevas@gmail.com', 'f', '0000-00-00', '455047', 14, 'Super Fan'),
('Eduardo Hernández Alonso', '55-2884-7043', 'ehernandez@gmail.com', 'm', '0000-00-00', '383373', 12, 'Super Fan'),
('Alexis Yaocalli Berthou Haas', '55-3225-9858', 'aberthou@gmail.com', 'm', '0000-00-00', '996451', 13, 'Super Fan'),
('Ximena Guadalupe Córdoba Ángeles', '55-3251-9266', 'xcordoba@gmail.com', 'f', '0000-00-00', '918667', 17, 'Mega Fan'),
('Dana Izel Martínez García', '55-3647-8536', 'dmartinez@gmail.com', 'f', '0000-00-00', '282194', 11, 'Super Fan'),
('Alejandro Contreras Magallanes', '55-3672-3148', 'acontreras@gmail.com', 'm', '0000-00-00', '894831', 15, 'Super Fan'),
('Mariana Frías Olguín', '55-3885-6878', 'mfrias@gmail.com', 'f', '1999-08-05', '441515', 19, 'Mega Fan'),
('Hannah Carolina Hernández Reyes', '55-3938-1454', 'hhernandez@gmail.com', 'f', '0000-00-00', '520465', 18, 'Mega Fan'),
('Samantha García Cárdenas', '55-3975-4081', 'sgarcia@gmail.com', 'f', '0000-00-00', '459900', 15, 'Super Fan'),
('Ricardo Cortés Espinosa', '55-4203-5221', 'rcortes@gmail.com', 'm', '0000-00-00', '490857', 7, 'Fan'),
('Ilian Judith Castillo Beristain', '55-4217-5522', 'icastillo@gmail.com', 'f', '2001-10-11', '125835', 10, 'Fan'),
('Héctor Alejandro Barrón Tamayo', '55-4606-3624', 'hbarron@gmail.com', 'm', '0000-00-00', '665953', 19, 'Mega Fan'),
('Jessica Hernández Tejeda', '55-4768-9613', 'jhernandez@gmail.com', 'f', '1999-05-10', '569740', 18, 'Mega Fan'),
('Armando Montealegre Villagrán', '55-5018-5507', 'amontealegre@gmail.com', 'm', '0000-00-00', '358235', 16, 'Mega Fan'),
('Suri Reyes Vega', '55-5824-6563', 'sureyes@gmail.com', 'f', '0000-00-00', '796714', 12, 'Super Fan'),
('Maria Fernanda Padme Lakshmi Martínez Jara', '55-6026-1598', 'mlakshmi@gmail.com', 'f', '0000-00-00', '327107', 13, 'Super Fan'),
('Víctor Hugo Esquivel Feregrino', '55-6788-4484', 'vesquivel@gmail.com', 'm', '0000-00-00', '332981', 10, 'Fan'),
('Gabriela Frías Quiroz', '55-7095-1397', 'gfrias@gmail.com', 'f', '0000-00-00', '539454', 13, 'Super Fan'),
('Santiago Barjau Hernández', '55-7110-9468', 'sbarjau@gmail.com', 'm', '0000-00-00', '121627', 10, 'Fan'),
('Fernanda Rosales Herrera', '55-7260-4596', 'frosales@gmail.com', 'f', '0000-00-00', '374378', 19, 'Mega Fan'),
('Jonathan de Jesús Anaya Correa', '55-7378-3019', 'janaya@gmail.com', 'm', '0000-00-00', '138131', 9, 'Fan'),
('Diego Alberto Pasaye González', '55-7564-5136', 'dpasaye@gmail.com', 'm', '0000-00-00', '475536', 7, 'Fan'),
('Carlos Delgado Contreras', '55-7634-3304', 'cdelgado@gmail.com', 'm', '0000-00-00', '312461', 9, 'Fan'),
('Renata Martínez Ozumbilla', '55-7731-4202', 'rmartinez@gmail.com', 'f', '0000-00-00', '686799', 9, 'Fan'),
('Emiliano Murillo Ruiz', '55-7869-6124', 'emurillo@gmail.com', 'm', '0000-00-00', '574288', 15, 'Super Fan'),
('Yamine Dávila Bejos', '55-7877-5755', 'ydavila@gmail.com', 'f', '0000-00-00', '556567', 20, 'Mega Fan'),
('Sofía Alondra Reyes Gómez', '55-8034-2908', 'sreyes@gmail.com', 'f', '0000-00-00', '158903', 5, 'Fan'),
('Jesús Osvaldo Ramos Pérez', '55-8069-3709', 'jramos@gmail.com', 'm', '0000-00-00', '673732', 20, 'Mega Fan'),
('Oscar Alexander Vilchis Soto', '55-8317-4862', 'ovilchis@gmail.com', 'm', '0000-00-00', '207219', 12, 'Super Fan'),
('Katya Jiménez Antonio', '55-8361-8067', 'kjimenez@gmail.com', 'f', '0000-00-00', '683000', 18, 'Mega Fan'),
('Alberto Barba Arroyo', '55-8616-1973', 'abarba@gmail.com', 'm', '0000-00-00', '147820', 15, 'Super Fan'),
('Francisco Rafael Arreola Corona', '55-8634-4784', 'farreola@gmail.com', 'm', '0000-00-00', '556518', 11, 'Super Fan'),
('Ana Sofía Moreno Hernández', '55-8842-2908', 'amoreno@gmail.com', 'f', '0000-00-00', '784241', 17, 'Mega Fan'),
('Fernanda Curiel Perez', '55-8913-8427', 'fcuriel@gmail.com', 'f', '0000-00-00', '788239', 17, 'Mega Fan'),
('Juan Pablo Juárez Ortiz', '55-8962-5930', 'jjuarez@@gmail.com', 'm', '0000-00-00', '871479', 14, 'Super Fan'),
('Sebastián Mansilla Cots', '55-9026-7777', 'smansilla@gmail.com', 'm', '0000-00-00', '886150', 7, 'Fan'),
('Iker Arnoldo Grajeda Campaña', '55-9188-6863', 'igrajeda@gmail.com', 'm', '0000-00-00', '255495', 6, 'Fan'),
('Ana Valeria Machuca Miranda', '55-9221-5175', 'amachuca@gmail.com', 'f', '0000-00-00', '586529', 20, 'Mega Fan'),
('Juan Pablo Domínguez Ángel', '55-9297-8935', 'jdominguez@gmail.com', 'm', '2000-08-08', '274784', 18, 'Mega Fan'),
('Diego Serrano Pardo', '55-9661-9093', 'dserrano@gmail.com', 'm', '0000-00-00', '168129', 17, 'Mega Fan'),
('Ricardo Antonio Gutiérrez García', '55-9783-5924', 'rgutierrez@gmail.com', 'm', '0000-00-00', '622953', 7, 'Fan'),
('Ramón Eliezer De Santos García', '55-9862-4951', 'rgarcia@gmail.com', 'm', '0000-00-00', '786963', 18, 'Mega Fan'),
('Rodrigo Alejandro Hurtado Cortés', '55-9956-8802', 'rhurtado@gmail.com', 'm', '0000-00-00', '130506', 17, 'Mega Fan');

-- --------------------------------------------------------

--
-- Table structure for table `colaborador`
--

CREATE TABLE `colaborador` (
  `nombre` varchar(100) NOT NULL,
  `turno` varchar(20) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `id_sucursal` varchar(10) NOT NULL,
  `nombre_rol` varchar(100) NOT NULL,
  `id_colaborador` varchar(10) NOT NULL,
  `contraseña` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Dumping data for table `colaborador`
--

INSERT INTO `colaborador` (`nombre`, `turno`, `telefono`, `id_sucursal`, `nombre_rol`, `id_colaborador`, `contraseña`) VALUES
('Alejandro Beníitez Bravo', 'Vespertino', '55-4653-8141', 'S73', 'Colaborador', 'A130', '47993'),
('Ana Paula Ortega', 'Matutino', '55-4454-5306', 'S66', 'Colaborador', 'A363', '1829'),
('Alondra Lizeth Landín Vega', 'Vespertino', '55-7659-5672', 'S67', 'Colaborador', 'A408', '9004'),
('Andra Nava Ortiz', 'Vespertino', '55-9190-6834', 'S75', 'Colaborador', 'A588', '29344'),
('Andrea Cifuentes Ortega', 'Vespertino', '55-5442-8602', 'S69', 'Colaborador', 'A685', '40540'),
('Betzabeth Durán Solorza', 'Matutino', '55-1575-6667', 'S70', 'Colaborador', 'B474', '48530'),
('Benjamín Valdéz Aguirre', 'Vespertino', '55-9481-7258', 'S71', 'Colaborador', 'B682', '27478'),
('Covadonga Rodriguez Rodriguez', 'Vespertino', '55-7198-6838', 'S71', 'Colaborador', 'C122', '40047'),
('César Daniel Aguilar Kuri', 'Matutino', '55-1036-3460', 'S70', 'Colaborador', 'C500', '3232'),
('David Espino Barron', 'Matutino', '55-6553-4885', 'S72', 'Colaborador', 'D333', '36818'),
('Diego Lopez Pastor', 'Matutino', '55-5512-4179', 'S72', 'Colaborador', 'D382', '30948'),
('Daniel Lopez Portillo', 'Matutino', '55-9761-2001', 'S68', 'Colaborador', 'D448', '624'),
('Dulce Sarai Gonzalez Gonzalez', 'Matutino', '55-7117-1867', 'S68', 'Colaborador', 'D496', '22893'),
('Daniela Suarez Loy', 'Matutino', '55-5077-6018', 'S74', 'Colaborador', 'D666', '26425'),
('David Alejandro Robles Camacho', 'Vespertino', '55-8954-8038', 'S73', 'Colaborador', 'D742', '33897'),
('Diana Itzel Guerra Calva', 'Matutino', '55-1283-4841', 'S70', 'Colaborador', 'D888', '22821'),
('Dante Hernández Ramírez', 'Matutino', '55-4605-3241', 'S72', 'Colaborador', 'D932', '27471'),
('Daniela Ire Esquinca Caballero', 'Vespertino', '55-6346-8374', 'S73', 'Colaborador', 'D936', '23483'),
('Emilio Hernandez', 'Vespertino', '55-6846-8744', 'S75', 'Colaborador', 'E585', '42915'),
('Grezia Trujillo', 'Vespertino', '55-6848-5856', 'S75', 'Colaborador', 'G158', '19049'),
('Iñaki Mancera Llano', 'Matutino', '55-8625-3009', 'S68', 'Colaborador', 'I669', '33827'),
('Iker Rodríguez Amaro', 'Matutino', '55-4742-8697', 'S74', 'Colaborador', 'I731', '19043'),
('Juan Pablo Sanchez Gonzalez', 'Matutino', '55-4458-5723', 'S72', 'Colaborador', 'J232', '42927'),
('Juan Jose Garcia Escamilla', 'Vespertino', '55-9988-9137', 'S75', 'Colaborador', 'J294', '30027'),
('Jose Manuel Chavez', 'Vespertino', '55-4990-1334', 'S67', 'Colaborador', 'J721', '6950'),
('Jacquelin Suarez Anaya', 'Vespertino', '55-9352-5349', 'S73', 'Colaborador', 'J744', '4121'),
('Joel Guadalupe García Guzmán', 'Vespertino', '55-8574-4802', 'S75', 'Colaborador', 'J796', '37588'),
('Juan Pablo Cedillo Peréz', 'Matutino', '55-1462-6229', 'S68', 'Administrador', 'J901', '26010'),
('Jorge Rubén Nieto Vega', 'Matutino', '55-3671-2874', 'S72', 'Colaborador', 'J973', '10477'),
('Luis Eduardo Gutiérrez Chavarría', 'Matutino', '55-2983-6290', 'S66', 'Colaborador', 'L479', '7439'),
('Luis Fernando Martínez Barragán', 'Matutino', '55-4617-9340', 'S70', 'Colaborador', 'L506', '3993'),
('Maria Paulina Quezada Maldonado', 'Vespertino', '55-4702-2963', 'S69', 'Colaborador', 'M156', '27746'),
('Martin Mendoza-Ceja', 'Vespertino', '55-1171-1189', 'S71', 'Colaborador', 'M219', '1432'),
('Maria Emillia Morales', 'Vespertino', '55-3149-1346', 'S69', 'Colaborador', 'M386', '24615'),
('Maria Guadalupe Padilla Vazquez', 'Vespertino', '55-2468-1224', 'S67', 'Colaborador', 'M442', '14172'),
('Mario Alberto Guzman Garza', 'Vespertino', '55-8336-3694', 'S71', 'Colaborador', 'M497', '31633'),
('Maria Jose Pedraza Padilla', 'Matutino', '55-8065-2254', 'S68', 'Colaborador', 'M610', '16820'),
('Marianna Quiroz Zuñiga', 'Matutino', '55-7785-6853', 'S70', 'Colaborador', 'M672', '42492'),
('Mia Yanet Escarcega Villareal', 'Vespertino', '55-2626-1752', 'S71', 'Colaborador', 'M723', '4944'),
('Mariana Gayon Garcia', 'Vespertino', '55-5212-8595', 'S67', 'Colaborador', 'M887', '11999'),
('Natalia Martinez Feregrino', 'Matutino', '55-6001-2287', 'S74', 'Colaborador', 'N718', '32919'),
('Osiris Abdallah Garcia Hernandez', 'Matutino', '55-4101-9557', 'S66', 'Colaborador', 'O541', '35647'),
('Pablo Israel Luna Lopez', 'Vespertino', '55-5040-3754', 'S73', 'Colaborador', 'P409', '10382'),
('Pablo Solana', 'Matutino', '55-1509-5251', 'S66', 'Colaborador', 'P441', '28618'),
('Renata Barcenas Mila', 'Vespertino', '55-4879-4067', 'S67', 'Colaborador', 'R758', '32144'),
('Sara Flores Gonzalez', 'Matutino', '55-5173-9260', 'S74', 'Colaborador', 'S256', '43125'),
('Santiago Martín del Campo Soler', 'Vespertino', '55-1608-1196', 'S69', 'Colaborador', 'S727', '38147'),
('Victor Adrián García Galván', 'Matutino', '55-6767-1731', 'S74', 'Colaborador', 'V201', '20761'),
('Valentina Gonzalez Salas', 'Vespertino', '55-3460-2460', 'S69', 'Colaborador', 'V308', '26162'),
('Valeria Aguirre Nova', 'Matutino', '55-7960-2715', 'S66', 'Administrador', 'V570', '40566');

-- --------------------------------------------------------

--
-- Table structure for table `colaborador_orden`
--

CREATE TABLE `colaborador_orden` (
  `id_colaborador` varchar(10) NOT NULL,
  `id_orden` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Dumping data for table `colaborador_orden`
--

INSERT INTO `colaborador_orden` (`id_colaborador`, `id_orden`) VALUES
('A130', '45674'),
('A363', '18610'),
('A408', '69087'),
('A588', '76395'),
('A685', '18994'),
('B474', '96249'),
('B682', '68221'),
('C122', '99264'),
('C500', '57561'),
('D333', '25360'),
('D448', '77665'),
('D496', '24325'),
('D666', '40328'),
('D742', '14076'),
('D888', '72025'),
('D932', '59947'),
('D936', '91774'),
('E585', '68089'),
('G158', '30336'),
('I669', '69293'),
('I731', '30809'),
('J232', '25655'),
('J294', '72981'),
('J721', '74073'),
('J796', '69220'),
('J901', '89881'),
('J973', '93830'),
('L479', '32456'),
('L506', '64821'),
('M156', '13667'),
('M219', '98082'),
('M386', '39421'),
('M442', '50475'),
('M497', '22463'),
('M672', '44654'),
('M723', '98863'),
('M887', '99897'),
('N718', '34005'),
('O541', '57450'),
('P409', '65081'),
('P441', '18698'),
('R758', '68903'),
('S256', '61721'),
('S727', '14394'),
('V201', '98893'),
('V308', '18773'),
('V570', '19971');

-- --------------------------------------------------------

--
-- Table structure for table `evento`
--

CREATE TABLE `evento` (
  `id_evento` varchar(10) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `descripción` longtext NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Dumping data for table `evento`
--

INSERT INTO `evento` (`id_evento`, `fecha_inicio`, `fecha_fin`, `descripción`, `nombre`) VALUES
('43', '0009-04-26', '0007-10-26', '\"Evento nocturno con ambiente romántico y luces cálidas, ideal para disfrutar crepas dulces bajo una atmósfera íntima.\"', 'Noche Crepas & Estrellas'),
('45', '0001-07-26', '0002-08-26', '\"Experiencia de degustación donde los asistentes prueban distintas versiones hasta elegir su favorita.\"', 'Ruta de la Crepa Perfecta'),
('52', '2023-05-26', '0001-11-26', '\"Día especial donde se preparan crepas frente al público, mostrando técnicas y recetas clásicas y modernas.\"', 'Sábado de Sartenes'),
('55', '2020-01-26', '2017-11-26', '\"Evento gastronómico que explora distintas combinaciones de rellenos y texturas en cada crepa.\"', 'Encuentro Sabores en Capas'),
('72', '2025-01-26', '2021-10-26', '\"Celebración dedicada al arte de lograr la crepa perfecta: delgada, uniforme y dorada. Incluye demostraciones en vivo y degustaciones especiales.\"', 'Festival Giro Dorado'),
('84', '2020-02-26', '2017-09-26', '\"Muestra enfocada en crepas dulces con combinaciones creativas, desde frutas frescas hasta salsas artesanales.\"', 'Feria Dulce Espiral');

-- --------------------------------------------------------

--
-- Table structure for table `evento_promocion`
--

CREATE TABLE `evento_promocion` (
  `id_promo` varchar(10) NOT NULL,
  `id_evento` varchar(10) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripción` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Dumping data for table `evento_promocion`
--

INSERT INTO `evento_promocion` (`id_promo`, `id_evento`, `nombre`, `descripción`) VALUES
('1126', '43', 'Noche Crepas & Estrellas', '10%'),
('2475', '84', 'Feria Dulce Espiral', '10%'),
('3584', '72', 'Festival Giro Dorado', '20%'),
('3645', '52', 'Sábado de Sartenes', '25%'),
('4046', '84', 'Carnaval Relleno Supremo', '20%'),
('7942', '55', 'Encuentro Sabores en Capas', '10%'),
('9473', '45', 'Ruta de la Crepa Perfecta', '10%');

-- --------------------------------------------------------

--
-- Table structure for table `insumo`
--

CREATE TABLE `insumo` (
  `id_insumo` varchar(10) NOT NULL,
  `nombre_insumo` varchar(100) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `precio` int(11) NOT NULL,
  `activo` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Dumping data for table `insumo`
--

INSERT INTO `insumo` (`id_insumo`, `nombre_insumo`, `tipo`, `precio`, `activo`) VALUES
('10285', 'Vainilla', 'Latte', 15, 0),
('10570', 'queso parmesano', 'Salado', 15, 0),
('10668', 'Salsa de tomate', 'Salado', 15, 0),
('13503', 'pistache natural', 'Salado', 15, 0),
('14593', 'Crema Irlandesa', 'Cappuccino', 15, 0),
('15149', 'jamón', 'Salado', 15, 0),
('17810', 'Vainilla', 'Iced Latte', 15, 0),
('21280', 'Chai', 'Iced Latte', 15, 0),
('22749', 'Manzana verde', 'Dulce', 15, 0),
('23502', 'Madreselva', 'Infusiones', 15, 0),
('23829', 'Elote', 'Salado', 15, 0),
('24083', 'Flor de naranja', 'Infusiones', 15, 0),
('24155', 'Plátano', 'Dulce', 15, 0),
('24163', 'Chocolate cookies n\' cream', 'Dulce', 15, 0),
('24215', 'Cajeta', 'Dulce', 15, 0),
('24449', 'Fresa ', 'Dulce', 15, 0),
('24739', 'Huevo', 'Salado', 15, 0),
('25807', 'Pesto', 'Salado', 15, 0),
('26252', 'Vainilla', 'Cappuccino', 15, 0),
('26804', 'Bubulubu', 'Dulce', 15, 0),
('27369', 'Nuez', 'Dulce', 15, 0),
('27952', 'Arándanos', 'Dulce', 15, 0),
('28118', 'galleta lotus', 'Dulce', 15, 0),
('29882', 'Miel de maple', 'Dulce', 15, 0),
('30121', 'Philadelphia', 'Dulce', 15, 0),
('30431', 'Lechera', 'Dulce', 15, 0),
('32122', 'Queso mozzarella', 'Salado', 15, 0),
('32790', 'Ferrero', 'Dulce', 15, 0),
('34003', 'Nieve de vainilla', 'Dulce', 15, 0),
('35113', 'arugula', 'Salado', 15, 0),
('36723', 'crema de chile poblano', 'Salado', 15, 0),
('37534', 'Chai', 'Cappuccino', 15, 0),
('37822', 'Pollo', 'Salado', 15, 0),
('37919', 'Leche de soya', 'Extras', 15, 0),
('38746', 'Avellana', 'Latte', 15, 0),
('41756', 'Zarzamora', 'Infusiones', 15, 0),
('42025', 'peperoni', 'Salado', 15, 0),
('42030', 'Nutella', 'Cappuccino', 20, 0),
('42202', 'Mermelada de zarzamora', 'Dulce', 15, 0),
('43626', 'Avellana', 'Iced Latte', 15, 0),
('44303', 'Caramelo', 'Latte', 15, 0),
('45882', 'Gansito', 'Dulce', 15, 0),
('48186', 'Chocolate blanco', 'Dulce', 15, 0),
('49610', 'Frambuesa', 'Dulce', 15, 0),
('50175', 'Almendra', 'Dulce', 15, 0),
('50585', 'Crema Irlandesa', 'Latte', 15, 0),
('52162', 'Moras Azules', 'Infusiones', 15, 0),
('56396', 'Jamón serrano', 'Salado', 15, 0),
('57961', 'Paleta Magnum', 'Dulce', 15, 0),
('58375', 'Fresa', 'Dulce', 15, 0),
('59969', 'M&M\'s', 'Dulce', 15, 0),
('62394', 'Oreo', 'Dulce', 15, 0),
('64037', 'Frambuesa', 'Infusiones', 15, 0),
('68471', 'Crema de pistáche', 'Dulce', 15, 0),
('68919', 'Crema Irlandesa', 'Iced Latte', 15, 0),
('68945', 'Plátano', 'Dulce', 15, 0),
('69631', 'Kit Kat', 'Dulce', 15, 0),
('69747', 'Leche deslactosada', 'Leche', 10, 0),
('70433', 'Fresa', 'Infusiones', 15, 0),
('70773', 'Rajas de chile poblano', 'Salado', 15, 0),
('72023', 'Fresas naturales', 'Dulce', 15, 0),
('72357', 'Mocha', 'Latte', 15, 0),
('72595', 'Crema de almendra', 'Dulce', 15, 0),
('73794', 'Jamaica', 'Infusiones', 15, 0),
('73864', 'Leche de coco', 'Extras', 15, 0),
('74528', 'Crema de lotus', 'Dulce', 15, 0),
('76346', 'Caramelo', 'Iced Latte', 15, 0),
('76505', 'Mocha', 'Cappuccino', 15, 0),
('78180', 'Limón', 'Infusiones', 15, 0),
('78378', 'Cajeta de la casa', 'Dulce', 15, 0),
('78387', 'Azúcar', 'Dulce', 15, 0),
('79080', 'Mermelada de fresa', 'Dulce', 15, 0),
('79237', 'Caramelo', 'Cappuccino', 15, 0),
('79813', 'Nutella', 'Dulce', 15, 0),
('79869', 'frosting', 'Dulce', 15, 0),
('79895', 'Leche de almendra', 'Extras', 15, 0),
('80439', 'champiñones', 'Salado', 15, 0),
('81765', 'Cebolla', 'Salado', 15, 0),
('83644', 'Avellana', 'Cappuccino', 15, 0),
('85075', 'Snickers', 'Dulce', 15, 0),
('85527', 'Kinder Delice', 'Dulce', 15, 0),
('87000', 'Mocha', 'Iced Latte', 15, 0),
('88210', 'Zarzamora', 'Dulce', 15, 0),
('88236', 'Chai', 'Latte', 15, 0),
('88959', 'Crema de cacahuate', 'Dulce', 15, 0),
('89642', 'Mazapán', 'Dulce', 15, 0),
('90187', 'Albahaca', 'Infusiones', 15, 0),
('91034', 'tres quesos', 'Salado', 15, 0),
('92454', 'Nieve', 'Dulce', 25, 0),
('94575', 'Canela', 'Dulce', 15, 0),
('94842', 'Nutella', 'Iced Latte', 20, 0),
('94890', 'Mora Azul', 'Dulce', 15, 0),
('94999', 'Manzana', 'Dulce', 15, 0),
('97730', 'Leche de avena', 'Extras', 15, 0),
('98127', 'Chispas de Chocolate', 'Dulce', 15, 0),
('98217', 'Coco Tostado', 'Dulce', 15, 0),
('ID_Insumos', 'Nombre', 'Tipo', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `insumo_producto`
--

CREATE TABLE `insumo_producto` (
  `id_insumo` varchar(10) NOT NULL,
  `id_producto` varchar(10) NOT NULL,
  `precio` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Dumping data for table `insumo_producto`
--

INSERT INTO `insumo_producto` (`id_insumo`, `id_producto`, `precio`) VALUES
('10285', '14838', 15),
('10570', '93086', 15),
('10668', '80089', 15),
('13503', '46063', 15),
('14593', '71217', 15),
('15149', '87326', 15),
('22749', '76088', 15),
('23829', '37226', 15),
('24155', '97160', 15),
('24163', '46738', 15),
('24215', '46829', 15),
('24449', '21739', 15),
('24739', '69785', 15),
('25807', '80612', 15),
('26252', '19590', 15),
('26804', '16343', 15),
('27369', '85454', 15),
('27952', '39803', 15),
('28118', '56703', 15),
('29882', '15341', 15),
('30121', '58851', 15),
('30431', '90364', 15),
('32122', '16710', 15),
('32790', '36208', 15),
('34003', '19143', 15),
('35113', '54049', 15),
('36723', '75147', 15),
('37534', '41733', 15),
('37822', '22580', 15),
('37919', '56018', 15),
('38746', '14651', 15),
('42025', '59594', 15),
('42030', '83088', 15),
('42202', '32054', 15),
('44303', '59720', 15),
('45882', '19525', 15),
('48186', '24224', 15),
('49610', '78423', 15),
('50175', '57121', 15),
('50585', '81284', 15),
('56396', '99145', 15),
('57961', '59913', 15),
('58375', '95308', 15),
('59969', '89465', 15),
('62394', '65224', 15),
('68471', '97101', 15),
('68945', '14874', 15),
('69631', '21445', 15),
('69747', '15401', 15),
('70773', '72325', 15),
('72023', '75381', 15),
('72357', '92030', 15),
('72595', '23512', 15),
('73864', '30154', 15),
('74528', '27080', 15),
('76505', '41463', 15),
('78378', '19171', 15),
('78387', '69624', 15),
('79080', '84023', 15),
('79237', '83691', 15),
('79813', '15900', 15),
('79869', '65317', 15),
('79895', '81057', 15),
('80439', '74003', 15),
('81765', '74139', 15),
('83644', '44551', 15),
('83644', '93751', 15),
('85075', '73317', 15),
('85527', '56854', 15),
('88210', '41376', 15),
('88236', '27851', 15),
('88959', '57372', 15),
('89642', '73716', 15),
('91034', '78294', 15),
('92454', '74504', 15),
('94575', '14948', 15),
('94890', '71183', 15),
('94999', '69844', 15),
('97730', '57278', 15),
('98127', '33456', 15),
('98217', '77851', 15);

-- --------------------------------------------------------

--
-- Table structure for table `orden`
--

CREATE TABLE `orden` (
  `id_orden` varchar(10) NOT NULL,
  `id_sucursal` varchar(10) NOT NULL,
  `número_cliente` varchar(20) NOT NULL,
  `id_producto` varchar(10) NOT NULL,
  `mesa` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `dirección` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Dumping data for table `orden`
--

INSERT INTO `orden` (`id_orden`, `id_sucursal`, `número_cliente`, `id_producto`, `mesa`, `fecha`, `dirección`) VALUES
('13667', 'S69', '55-7378-3019', '69624', 1, '2021-03-26', '\"Calle Pirules 38, Col. Lomas Verdes, Naucalpan, Estado de México, C.P. 53120\"'),
('14076', 'S73', '55-2006-6063', '59594', 2, '2029-10-26', '\"Calle Horizonte 77, Col. Vista Alegre, Pachuca, Hidalgo, C.P. 42080\"'),
('14394', 'S69', '55-7564-5136', '59913', 4, '0003-08-26', '\"Calle Fresno 149, Col. El Carmen, Tuxtla Gutiérrez, Chiapas, C.P. 29000\"'),
('18610', 'S66', '55-8069-3709', '69844', 5, '2011-11-26', '\"Blvd. Morelos 1500, Col. Centro, Hermosillo, Sonora, C.P. 83000\"'),
('18698', 'S66', '55-7877-5755', '21445', 2, '0009-07-26', '\"Blvd. Atlixco 780, Col. La Paz, Puebla, Puebla, C.P. 72160\"'),
('18773', 'S69', '55-1827-6651', '39803', 4, '2026-08-26', '\"Calle Encino 1456, Col. Del Valle, San Pedro Garza García, Nuevo León, C.P. 66220\"'),
('18994', 'S69', '55-8962-5930', '32054', 2, '2024-07-26', '\"Calle 5 de Mayo 778, Col. Centro Histórico, Puebla, Puebla, C.P. 72000\"'),
('19971', 'S66', '55-1156-9800', '15900', 5, '2018-04-26', '\"Av. Los Olivos 124, Col. Jardines del Sol, Guadalajara, Jalisco, C.P. 45050\"'),
('22463', 'S71', '55-9956-8802', '77851', 5, '0003-11-26', '\"Calle Azucena 88, Col. Bugambilias, Zapopan, Jalisco, C.P. 45110\"'),
('24325', 'S68', '55-6788-4484', '57121', 5, '2018-09-26', '\"Av. Las Torres 309, Col. San Andrés Cholula, Puebla, C.P. 72810\"'),
('25360', 'S72', '55-8634-4784', '46829', 2, '2013-12-26', '\"Av. Universidad 1890, Col. Copilco, CDMX, C.P. 04360\"'),
('25655', 'S72', '55-4217-5522', '56703', 3, '0006-08-26', '\"Blvd. Colosio 2089, Col. Altavista, Tampico, Tamaulipas, C.P. 89240\"'),
('30336', 'S75', '55-2435-6781', '74003', 3, '2023-11-26', '\"Calle Amanecer 333, Col. Nueva Esperanza, Matamoros, Tamaulipas, C.P. 87300\"'),
('30809', 'S74', '55-9661-9093', '87326', 1, '0006-02-26', '\"Blvd. Del Valle 509, Col. Del Valle, Tepic, Nayarit, C.P. 63000\"'),
('32456', 'S66', '55-7731-4202', '78423', 5, '2028-03-26', '\"Blvd. Constitución 2222, Col. Centro, Durango, Durango, C.P. 34000\"'),
('34005', 'S74', '55-6026-1598', '14874', 5, '0004-11-26', '\"Av. Constituyentes 314, Col. Centro Sur, Querétaro, Querétaro, C.P. 76090\"'),
('39421', 'S69', '55-3975-4081', '19171', 3, '2025-11-26', '\"Calle Mar Caribe 642, Col. Costa Verde, Boca del Río, Veracruz, C.P. 94294\"'),
('40328', 'S74', '55-3251-9266', '56854', 1, '2028-07-26', '\"Av. Tecnológico 1345, Col. Tecnológico, Chihuahua, Chihuahua, C.P. 31125\"'),
('44654', 'S70', '55-8616-1973', '65317', 3, '2021-11-26', '\"Av. Del Parque 654, Col. La Paz, San Luis Potosí, San Luis Potosí, C.P. 78216\"'),
('45674', 'S73', '55-4768-9613', '19525', 2, '2027-11-26', '\"Calle Palma 376, Col. Reforma, Veracruz, Veracruz, C.P. 91910\"'),
('50475', 'S67', '55-8317-4862', '97101', 5, '0003-03-26', '\"Calle Girasol 412, Col. Primavera, Culiacán, Sinaloa, C.P. 80010\"'),
('57450', 'S66', '55-4203-5221', '76088', 3, '0001-06-26', '\"Av. Reforma 1208, Col. Juárez, CDMX, C.P. 06600\"'),
('57561', 'S70', '55-9188-6863', '73716', 1, '2019-02-26', '\"Av. Solidaridad 1290, Col. Centro, Morelia, Michoacán, C.P. 58000\"'),
('59947', 'S72', '55-3938-1454', '16343', 2, '2020-05-26', '\"Blvd. Insurgentes 890, Col. Centro, Villahermosa, Tabasco, C.P. 86000\"'),
('61721', 'S74', '55-3225-9858', '95308', 3, '2025-05-26', '\"Blvd. Hidalgo 404, Col. Centro, León, Guanajuato, C.P. 37000\"'),
('64821', 'S70', '55-8034-2908', '46738', 2, '2028-04-26', '\"Blvd. Lázaro Cárdenas 1717, Col. Centro, Mexicali, Baja California, C.P. 21000\"'),
('65081', 'S73', '55-9221-5175', '23512', 2, '2021-06-26', '\"Calle Coral 990, Col. Costa Azul, Acapulco, Guerrero, C.P. 39850\"'),
('68089', 'S75', '55-8913-8427', '65224', 4, '2019-08-26', '\"Calle Olmo 260, Col. Residencial del Norte, Saltillo, Coahuila, C.P. 25280\"'),
('68221', 'S71', '55-9783-5924', '75381', 5, '0007-06-26', '\"Calle Cedro 215, Col. Santa María, Reynosa, Tamaulipas, C.P. 88630\"'),
('68903', 'S67', '55-7634-3304', '90364', 1, '2014-06-26', '\"Calle Río Sena 845, Col. Cuauhtémoc, CDMX, C.P. 06500\"'),
('69087', 'S67', '55-5018-5507', '21739', 5, '0005-05-26', '\"Calle Bugambilia 803, Col. San Rafael, Cuernavaca, Morelos, C.P. 62000\"'),
('69220', 'S75', '55-3647-8536', '41376', 2, '0006-11-26', '\"Calle Cantera 59, Col. Lomas del Valle, Colima, Colima, C.P. 28017\"'),
('69293', 'S68', '55-7869-6124', '71183', 2, '0006-05-26', '\"Av. Universidad 978, Col. Zona Universitaria, Zacatecas, Zacatecas, C.P. 98060\"'),
('72025', 'S70', '55-2884-7043', '33456', 1, '2030-11-26', '\"Blvd. Aeropuerto 1780, Col. Industrial, Toluca, Estado de México, C.P. 50200\"'),
('72981', 'S75', '55-3672-3148', '97160', 1, '0009-04-26', '\"Calle Luna 233, Fracc. Real del Valle, Mazatlán, Sinaloa, C.P. 82124\"'),
('74073', 'S67', '55-9862-4951', '73317', 2, '2012-05-26', '\"Calle Magnolia 94, Col. Las Flores, Cancún, Quintana Roo, C.P. 77500\"'),
('76395', 'S75', '55-8842-2908', '14948', 4, '2024-11-26', '\"Calle Sauce 271, Col. Las Fuentes, Aguascalientes, Aguascalientes, C.P. 20239\"'),
('77665', 'S68', '55-7095-1397', '89465', 1, '0003-12-26', '\"Av. Patria 3001, Col. Jardines Universidad, Zapopan, Jalisco, C.P. 45110\"'),
('89881', 'S68', '55-9026-7777', '58851', 3, '2013-11-26', '\"Blvd. Independencia 2301, Col. Centro, Torreón, Coahuila, C.P. 27000\"'),
('91774', 'S73', '55-4606-3624', '15341', 2, '2016-01-26', '\"Calle Jacarandas 915, Col. Vista Hermosa, Monterrey, Nuevo León, C.P. 64620\"'),
('93830', 'S72', '55-7260-4596', '78294', 1, '0003-07-26', '\"Av. Del Sol 1120, Col. Las Palmas, La Paz, Baja California Sur, C.P. 23000\"'),
('96249', 'S70', '55-3885-6878', '84023', 3, '2012-03-26', '\"Av. Paseo del Bosque 56, Col. Las Águilas, Querétaro, Querétaro, C.P. 76030\"'),
('98082', 'S71', '55-5824-6563', '80089', 1, '2030-08-26', '\"Calle Mirador 604, Col. Cumbres, Monterrey, Nuevo León, C.P. 64610\"'),
('98863', 'S71', '55-9297-8935', '57372', 1, '2020-07-26', '\"Calle Monte Albán 342, Col. Narvarte, CDMX, C.P. 03020\"'),
('98893', 'S74', '55-8361-8067', '19143', 4, '2026-11-26', '\"Av. Los Pinos 1432, Col. Arboledas, Celaya, Guanajuato, C.P. 38060\"'),
('99264', 'S71', '55-7110-9468', '27080', 3, '2028-09-26', '\"Calle Roble 173, Col. Campestre, Mérida, Yucatán, C.P. 97120\"'),
('99897', 'S67', '55-2669-1307', '85454', 1, '2014-12-26', '\"Calle Naranjo 67, Col. El Mirador, Tijuana, Baja California, C.P. 22010\"');

-- --------------------------------------------------------

--
-- Table structure for table `privilegio`
--

CREATE TABLE `privilegio` (
  `nombre` varchar(100) NOT NULL,
  `transferible` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Dumping data for table `privilegio`
--

INSERT INTO `privilegio` (`nombre`, `transferible`) VALUES
('Modifica ingrediente de platillo seleccionado', 0),
('Modifica platillo existente.', 0),
('Modifica promocion', 0),
('Modifica promociones', 0),
('Modifica roles y privilegios de empleados.', 0),
('Modifica royalty.', 0),
('Modifica status royalty', 0),
('Modifica status royalty.', 0),
('Modificar menu (tentativo).', 0),
('Nombre', 0),
('Reclama premio royalty.', 0),
('Regista inicio de sesión', 0),
('Registra creación de cuenta', 0),
('Registra días hábiles.', 0),
('Registra evento', 0),
('Registra ingrediente agotado', 0),
('Registra ingrediente nuevo', 0),
('Registra nuevo mensaje a usuarios.', 0),
('Registra platillo agotado.', 0),
('Registra platillo especial.', 0),
('Registra platillo nuevo', 0),
('Registrar ingrediente nuevo.', 0),
('Registrar orden ', 0),
('Selecciona lugar de consumo', 0),
('Visualiza días hábiles.', 0),
('Visualiza el nivel de lealtad de los clientes.', 0),
('Visualiza feedback de clientes.', 0),
('Visualiza historial de comentarios (rating).', 0),
('Visualiza información royalty', 0),
('Visualiza la cantidad de visitas de royalty.', 0),
('Visualiza menu', 0),
('Visualiza métricas.', 0),
('Visualiza promociones', 0),
('Visualiza resumen de pedido', 0),
('Visualiza su nivel de lealtad', 0);

-- --------------------------------------------------------

--
-- Table structure for table `producto`
--

CREATE TABLE `producto` (
  `nombre_producto` varchar(100) NOT NULL,
  `id_producto` varchar(10) NOT NULL,
  `precio` int(11) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `etiqueta` varchar(100) NOT NULL,
  `tipo` varchar(100) NOT NULL,
  `tamaño` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Dumping data for table `producto`
--

INSERT INTO `producto` (`nombre_producto`, `id_producto`, `precio`, `activo`, `etiqueta`, `tipo`, `tamaño`) VALUES
('Chocolate abuelita', '14651', 0, 0, 'Frappes', 'Bebidas', 'Chico'),
('Carlos V', '14838', 0, 0, 'Frappes', 'Bebidas', 'Chico'),
('Bubulubu', '14874', 0, 0, 'Especiales', 'Platillo', 'Chico'),
('Gansito', '14948', 0, 0, 'Especiales', 'Platillo', 'Chico'),
('Rol de Canela', '15341', 0, 0, 'Artesanales', 'Platillo', 'Chico'),
('Jamaica con fresa, limón y flor de naranja', '15401', 0, 0, 'Infusiones', 'Bebidas', 'Chico'),
('Un ingrediente', '15900', 0, 0, 'Arma tu crepa', 'Platilo', 'Chico'),
('Espresso', '16343', 0, 0, 'Bebidas Calientes', 'Bebidas', 'Chico'),
('Mocha Frío', '16710', 0, 0, 'Bebidas Frías', 'Bebidas', 'Chico'),
('Americano', '19143', 0, 0, 'Bebidas Calientes', 'Bebidas', 'Chico'),
('Rajas', '19171', 0, 0, 'Saladas', 'Platillo', 'Chico'),
('Macchiato', '19525', 0, 0, 'Bebidas Calientes', 'Bebidas', 'Chico'),
('Cajeta', '19590', 0, 0, 'Frappes', 'Bebidas', 'Chico'),
('Maree Crepe', '21445', 0, 0, 'Saladas', 'Platillo', 'Chico'),
('Flat Whiite', '21739', 0, 0, 'Capuccinos & Lattes', 'Bebidas', 'Chico'),
('Matcha Frío', '22580', 0, 0, 'Bebidas Frías', 'Bebidas', 'Chico'),
('Mazapán', '23512', 0, 0, 'Especiales', 'Platillo', 'Chico'),
('La Dolce Phila', '24224', 0, 0, 'Especiales', 'Platillo', 'Chico'),
('Magnum', '27080', 0, 0, 'Especiales', 'Platillo', 'Chico'),
('Dirty Matcha Frappe', '27851', 0, 0, 'Frappes', 'Bebidas', 'Chico'),
('Fresa', '30154', 0, 0, 'Malteadas', 'Bebidas', 'Chico'),
('Coco Almond', '32054', 0, 0, 'Artesanales', 'Platillo', 'Chico'),
('Kit Kat', '33456', 0, 0, 'Especiales', 'Platillo', 'Chico'),
('La Pizzeria', '36208', 0, 0, 'Saladas', 'Platillo', 'Chico'),
('Chai Frío', '37226', 0, 0, 'Bebidas Frías', 'Bebidas', 'Chico'),
('Oreo', '39803', 0, 0, 'Especiales', 'Platillo', 'Chico'),
('Cappuccino', '41376', 0, 0, 'Capuccinos & Lattes', 'Bebidas', 'Chico'),
('Nutella', '41463', 0, 0, 'Frappes', 'Bebidas', 'Chico'),
('Oreo', '41733', 0, 0, 'Frappes', 'Bebidas', 'Chico'),
('Mazapán', '44551', 0, 0, 'Frappes', 'Bebidas', 'Chico'),
('Chai', '46063', 0, 0, 'Frappes', 'Bebidas', 'Chico'),
('Mocha Latte', '46738', 0, 0, 'Capuccinos & Lattes', 'Bebidas', 'Chico'),
('White Pistachio', '46829', 0, 0, 'Artesanales', 'Platillo', 'Chico'),
('Frapuccino', '54049', 0, 0, 'Frappes', 'Bebidas', 'Chico'),
('Vainilla', '56018', 0, 0, 'Malteadas', 'Bebidas', 'Chico'),
('Cookies N\' Cream', '56703', 0, 0, 'Especiales', 'Platillo', 'Chico'),
('4 Quesos', '56854', 0, 0, 'Saladas', 'Platillo', 'Chico'),
('Kinder Delice', '57121', 0, 0, 'Especiales', 'Platillo', 'Chico'),
('Oreo', '57278', 0, 0, 'Malteadas', 'Bebidas', 'Chico'),
('Cinn-Almond Crepe', '57372', 0, 0, 'Artesanales', 'Platillo', 'Chico'),
('Tres ingredientes', '58851', 0, 0, 'Arma tu crepa', 'Platillo', 'Chico'),
('Té Verde Jazmín', '59594', 0, 0, 'Tés e Infusiones', 'Bebidas', 'Chico'),
('Manzanilla con moras zules y albahaca', '59720', 0, 0, 'Infusiones', 'Bebidas', 'Chico'),
('Dirty Chai', '59913', 0, 0, 'Capuccinos & Lattes', 'Bebidas', 'Chico'),
('La Española', '65224', 0, 0, 'Saladas', 'Platillo', 'Chico'),
('Choco Berries', '65317', 0, 0, 'Especiales', 'Platillo', 'Chico'),
('Honey Honey', '69624', 0, 0, 'Especiales', 'Platillo', 'Chico'),
('Dirty Chai Frappe', '69785', 0, 0, 'Frappes', 'Bebidas', 'Chico'),
('Reese\'s', '69844', 0, 0, 'Especiales', 'Platillo', 'Chico'),
('Chai Latte', '71183', 0, 0, 'Capuccinos & Lattes', 'Bebidas', 'Chico'),
('Chamoyada Jamaica', '71217', 0, 0, 'Frappes', 'Bebidas', 'Chico'),
('Americano Frío', '72325', 0, 0, 'Bebidas Frías', 'Bebidas', 'Chico'),
('La Verde', '73317', 0, 0, 'Saladas', 'Platillo', 'Chico'),
('Poblana', '73716', 0, 0, 'Saladas', 'Platillo', 'Chico'),
('Agua', '74003', 0, 0, 'Otras Bebidas', 'Bebidas', 'Chico'),
('Iced Dirty Chai', '74139', 0, 0, 'Bebidas Frías', 'Bebidas', 'Chico'),
('M&M´s', '74504', 0, 0, 'Especiales', 'Platillo', 'Chico'),
('Iced Dirty Matcha', '75147', 0, 0, 'Bebida Fría', 'Bebidas', 'Chico'),
('Rosendo Nieblas', '75381', 0, 0, 'Saladas', 'Platillo', 'Chico'),
('Lotus de Nuez', '76088', 0, 0, 'Especiales', 'Platillo', 'Chico'),
('Snickers', '77851', 0, 0, 'Especiales', 'Platillo', 'Chico'),
('Té Verde Clásico', '78294', 0, 0, 'Tés e Infusiones', 'Bebidas', 'Chico'),
('Latte', '78423', 0, 0, 'Capuccinos & Lattes', 'Bebidas', 'Chico'),
('Choocolate caliente', '80089', 0, 0, 'Capuccinos & Lattes', 'Bebidas', 'Chico'),
('Motchai Frío', '80612', 0, 0, 'Bebida Frío', 'Bebidas', 'Chico'),
('Chocolate', '81057', 0, 0, 'Malteadas', 'Bebidas', 'Chico'),
('Manzanilla con zarzamora, frambuesa y jamaica', '81284', 0, 0, 'Infusiones', 'Bebidas', 'Chico'),
('Matcha', '83088', 0, 0, 'Frappes', 'Bebidas', 'Chico'),
('Chamoyada Mango', '83691', 0, 0, 'Frappes', 'Bebidas', 'Chico'),
('Cinn-Apple', '84023', 0, 0, 'Artesanales', 'Platillo', 'Chico'),
('Ferrero Rocher', '85454', 0, 0, 'Especiales', 'Platillo', 'Chico'),
('Refresco', '87326', 0, 0, 'Otras Bebidas', 'Bebidas', 'Chico'),
('La Champi', '89465', 0, 0, 'Saladas', 'Platillo', 'Chico'),
('Dos ingredientes', '90364', 0, 0, 'Arma tu crepa', 'Platilo', 'Chico'),
('Matchai', '92030', 0, 0, 'Frappes', 'Bebidas', 'Chico'),
('Mocha', '93086', 0, 0, 'Frappes', 'Bebidas', 'Chico'),
('Jamaica con arándanos, lima y madreselva', '93751', 0, 0, 'Infusiones', 'Bebidas', 'Chico'),
('Golden Bites', '95308', 0, 0, 'Especiales', 'Platillo', 'Chico'),
('Manzane', '97101', 0, 0, 'Especiales', 'Platillo', 'Chico'),
('Berry Lotus', '97160', 0, 0, 'Especiales', 'Platillo', 'Chico'),
('Iced Latte', '99145', 0, 0, 'Bebidas Frías', 'Bebidas', 'Chico'),
('Nombre_producto', 'ID_Product', 0, 0, 'Etiqueta', 'Tipo', 'Tamaño');

-- --------------------------------------------------------

--
-- Table structure for table `producto_evento`
--

CREATE TABLE `producto_evento` (
  `id_evento` varchar(10) NOT NULL,
  `id_producto` varchar(10) NOT NULL,
  `cantidad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Dumping data for table `producto_evento`
--

INSERT INTO `producto_evento` (`id_evento`, `id_producto`, `cantidad`) VALUES
('43', '90364', 263),
('45', '57372', 384),
('52', '32054', 201),
('55', '84023', 290),
('72', '15900', 319),
('84', '46829', 299),
('84', '58851', 236);

-- --------------------------------------------------------

--
-- Table structure for table `promociones`
--

CREATE TABLE `promociones` (
  `nombre` varchar(100) NOT NULL,
  `descuento` float NOT NULL,
  `condición` longtext NOT NULL,
  `id_promo` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Dumping data for table `promociones`
--

INSERT INTO `promociones` (`nombre`, `descuento`, `condición`, `id_promo`) VALUES
('Noche Crepas & Estrellas', 0.1, 'Evento', '1126'),
('Promoción Año Nuevo', 0.1, '1 de enero', '130'),
('Expo Toppings Infinitos', 0.3, 'Evento', '1306'),
('Jornada Masa en Movimiento', 0.2, 'Evento', '1329'),
('Promoción Halloween', 0.1, '30 de octubre', '146'),
('Tarde Fruta & Chocolate', 0.1, 'Evento', '1638'),
('Feria Dulce Espiral', 0.1, 'Evento', '2475'),
('Promoción San Valentin', 0.1, '14 de febrero', '287'),
('Festival Giro Dorado', 0.2, 'Evento', '3584'),
('Sábado de Sartenes', 0.25, 'Evento', '3645'),
('Gala Sabor Circular', 0.1, 'Evento', '3741'),
('Carnaval Relleno Supremo', 0.2, 'Evento', '4046'),
('Tarde Azúcar & Canela', 0.1, 'Evento', '5060'),
('Brunch La Vuelta Francesa', 0.1, 'Evento', '5259'),
('Promoción Cumpleaños', 0.5, 'el dia de tu cumpleaños', '553'),
('Torneo Maestro Crepero', 0.1, 'Evento', '6530'),
('Semana del Antojo Feliz', 0.1, 'Evento', '6936'),
('Promoción Semana Santa', 0.1, '2 y 3 de abril', '747'),
('Feria Sabores del Mundo en Crepa', 0.2, 'Evento', '7529'),
('Encuentro Sabores en Capas', 0.1, 'Evento', '7942'),
('Promoción Aniversario', 0.3, '5 de junio', '837'),
('Cumbre del Relleno Secreto', 0.1, 'Evento', '8507'),
('Promoción Navidad', 0.2, '25 de diciembre', '866'),
('Festival Crepa Lovers', 0.5, 'Evento', '8967'),
('Promoción Dia de la independencia', 0.1, '16 de septiembre', '909'),
('Maratón 12 Sabores', 0.1, 'Evento', '9238'),
('Noche Fuego y Nutella', 0.2, 'Evento', '9445'),
('Ruta de la Crepa Perfecta', 0.1, 'Evento', '9473'),
('Nombre', 0, 'Condición', 'ID_Promo');

-- --------------------------------------------------------

--
-- Table structure for table `review`
--

CREATE TABLE `review` (
  `id_review` varchar(10) NOT NULL,
  `id_orden` varchar(10) NOT NULL,
  `puntaje` double NOT NULL,
  `fecha` date NOT NULL,
  `comentario` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Dumping data for table `review`
--

INSERT INTO `review` (`id_review`, `id_orden`, `puntaje`, `fecha`, `comentario`) VALUES
('1N133', '57450', 5, '2016-07-26', '\"Las bebidas tardaron demasiado en llegar, incluso más que los platillos principales. Es extraño tener que esperar tanto por algo tan básico.\"'),
('1N193', '50475', 1, '2014-06-26', '\"La comida tenía buena presentación, pero el sabor fue bastante simple y sin personalidad. Esperaba algo más elaborado por el precio que pagamos.\"'),
('1N208', '69293', 1, '2010-01-26', '\"El postre fue lo más decepcionante; estaba demasiado dulce y mal balanceado.\"'),
('1N273', '96249', 3, '0001-10-26', '\"Pedí un platillo específico y lo trajeron mal dos veces. Al final decidí quedarme con lo que trajeron porque ya había pasado demasiado tiempo. No hubo ninguna compensación por el error.\"'),
('1N291', '40328', 3, '2015-04-26', '\"Tuvimos que esperar mucho tiempo incluso para que nos trajeran cubiertos. Son detalles pequeños que hacen ver falta de atención.\"'),
('1N347', '30809', 2, '2012-06-26', '\"No se siente un trato personalizado ni interés en que el cliente regrese.\"'),
('1N391', '98893', 3, '2015-07-26', '\"El estacionamiento es muy limitado y no ofrecen alternativas claras\"'),
('1N487', '39421', 2, '2013-11-26', '\"El arroz estaba mal cocido y con textura extraña. Es un acompañamiento básico que debería estar bien hecho.\"'),
('1N511', '64821', 5, '2018-12-26', '\"La espera para recibir la cuenta fue innecesariamente larga.\"'),
('1N515', '69220', 2, '2012-07-26', '\"La experiencia en general fue promedio, pero el precio sugiere algo mucho mejor.\"'),
('1N544', '45674', 4, '2018-01-26', '\"La comida llegó con exceso de grasa, lo que hizo que el platillo fuera pesado y poco agradable.\"'),
('1N570', '22463', 4, '2017-02-26', '\"El postre llegó congelado por dentro, lo que indica que no fue preparado correctamente. Fue el cierre perfecto para una mala experiencia.\"'),
('1N656', '74073', 2, '2015-11-26', '\"No hubo ninguna cortesía ni disculpa cuando cometieron errores en el pedido. La actitud fue indiferente.\"'),
('1N698', '34005', 4, '2016-01-26', '\"La presentación del platillo fue descuidada, con salsa derramada en el borde del plato. Parece un detalle menor, pero suma a la percepción negativa.\"'),
('1N707', '32456', 3, '2011-03-26', '\"El personal parecía más enfocado en otras mesas que en la nuestra.\"'),
('1N714', '44654', 2, '2018-09-26', '\"El lugar estaba demasiado lleno y el ruido era excesivo. No se podía disfrutar la comida con tranquilidad.\"'),
('1N743', '91774', 4, '2015-03-26', '\"El personal parecía desorganizado. Los meseros se confundían con las mesas y varios pedidos llegaron a personas equivocadas.\"'),
('1N829', '18773', 1, '2011-04-26', '\"La comida estaba excesivamente salada. Intentaron justificarlo diciendo que era parte del estilo del platillo, pero claramente fue un error en la preparación.\"'),
('1N860', '24325', 2, '2011-05-26', '\"El menú se ve atractivo, pero los sabores no cumplen lo que prometen. Mucha expectativa y poco resultado.\"'),
('2N135', '61721', 4, '0002-08-26', '\"La carne estaba sobrecocida y seca. Cuando pedí que la cambiaran, regresó igual o incluso más hecha.\"'),
('2N143', '68089', 4, '2021-03-26', '\"La carne estaba dura y difícil de cortar. No parecía un corte de buena calidad.\"'),
('2N150', '99264', 1, '2029-10-26', '\"La sopa estaba tibia y parecía recalentada. No tenía la textura ni el sabor de algo recién preparado.\"'),
('2N155', '89881', 3, '2028-12-26', '\"El servicio fue extremadamente lento. Esperamos casi una hora por nuestros platillos y nadie se acercó a explicarnos la demora. La falta de comunicación fue lo más frustrante.\"'),
('2N178', '18698', 1, '2023-12-26', '\"La carne estaba dura y difícil de cortar. No parecía un corte de buena calidad.\"'),
('2N241', '18994', 1, '0002-07-26', '\"El restaurante se veía descuidado. Las mesas estaban sucias y el piso tenía restos de comida. Eso genera desconfianza inmediata sobre la higiene en la cocina.\"'),
('2N280', '68903', 3, '2022-05-26', '\"La comida llegó fría y claramente llevaba tiempo preparada. El sabor no era malo, pero la temperatura arruinó completamente la experiencia. Por el precio que cobran, esperaba mucho más cuidado.\"'),
('2N314', '77665', 2, '2020-12-26', '\"El restaurante se ve bonito, pero la experiencia no está a la altura de la imagen que proyecta.\"'),
('2N319', '59947', 5, '2028-03-26', '\"El servicio fue lento incluso en un día que no parecía estar muy concurrido.\"'),
('2N342', '30336', 5, '2025-10-26', '\"En general, la visita dejó más frustración que satisfacción, y no considero que valga la pena repetirla.\"'),
('2N351', '13667', 3, '2029-09-26', '\"El mesero nunca volvió a la mesa después de traer la comida. Tuvimos que levantarnos para pedir la cuenta.\"'),
('2N545', '25360', 5, '2020-01-26', '\"La música estaba demasiado fuerte, lo que hacía imposible mantener una conversación tranquila. No es un ambiente cómodo para ir en familia o tener una reunión.\"'),
('2N635', '99897', 2, '2024-11-26', '\"No respetaron nuestra reservación y nos hicieron esperar más de 30 minutos. No ofrecieron ninguna disculpa clara por el inconveniente.\"'),
('2N660', '93830', 2, '2024-09-26', '\"La ensalada no parecía fresca y los ingredientes estaban marchitos.\"'),
('2N769', '72025', 2, '0002-01-26', '\"El ambiente se siente poco acogedor. La iluminación es demasiado tenue y el mobiliario se ve desgastado.\"'),
('3N104', '14394', 4, '2031-07-26', '\"La música no iba acorde al ambiente del lugar y resultaba incómoda.\"'),
('3N271', '18610', 3, '0003-02-26', '\"Desde que llegamos notamos falta de organización. Tardaron en atendernos y el personal parecía confundido con las mesas. La comida no compensó la mala primera impresión.\"'),
('3N425', '69087', 3, '0003-12-26', '\"Las porciones no corresponden al costo. Pagas más por la decoración que por la calidad.\"'),
('3N537', '14076', 3, '2031-01-26', '\"La experiencia fue inconsistente: algunos detalles buenos, pero demasiados errores pequeños acumulados.\"'),
('3N700', '57561', 3, '2030-10-26', '\"La cuenta llegó con cargos incorrectos. Tuvimos que revisar cuidadosamente y pedir que la corrigieran.\"'),
('4N879', '76395', 2, '0004-07-26', '\"En general, la experiencia no fue satisfactoria. Entre la demora, la falta de atención y la calidad promedio de la comida, no es un lugar al que regresaría ni recomendaría.\"'),
('5N605', '98082', 2, '0005-06-26', '\"El lugar tenía un olor extraño al entrar, lo que no fue una buena señal.\"'),
('8N192', '72981', 2, '0008-07-26', '\"El baño estaba en malas condiciones, sin papel y con mal olor. Ese tipo de detalles influyen mucho en la percepción general del lugar.\"'),
('8N753', '98863', 2, '0008-12-26', '\"Las porciones son muy pequeñas en comparación con el precio. La presentación es buena, pero la cantidad no justifica el costo.\"'),
('8N902', '68221', 2, '0008-02-26', '\"La iluminación es demasiado baja, lo que dificulta incluso leer el menú.\"'),
('9N298', '25655', 5, '0009-05-26', '\"El menú ofrecía muchas opciones, pero varias no estaban disponibles. Eso limitó bastante nuestra elección.\"'),
('9N716', '19971', 1, '0009-11-26', '\"La experiencia fue bastante decepcionante desde el inicio. Tardaron mucho en asignarnos una mesa aun cuando el lugar no estaba lleno. Además, el personal no fue amable ni atento durante el servicio\"');

-- --------------------------------------------------------

--
-- Table structure for table `rol`
--

CREATE TABLE `rol` (
  `nombre` varchar(100) NOT NULL,
  `activo` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Dumping data for table `rol`
--

INSERT INTO `rol` (`nombre`, `activo`) VALUES
('Administrador', 0),
('Colaborador', 0),
('Usuario', 0),
('Usuario No registrado', 0);

-- --------------------------------------------------------

--
-- Table structure for table `rol_privilegio`
--

CREATE TABLE `rol_privilegio` (
  `nombre_rol` varchar(100) NOT NULL,
  `nombre_privilegio` varchar(100) NOT NULL,
  `activo` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Dumping data for table `rol_privilegio`
--

INSERT INTO `rol_privilegio` (`nombre_rol`, `nombre_privilegio`, `activo`) VALUES
('Administrador', 'Modifica ingrediente de platillo seleccionado', 0),
('Administrador', 'Modifica platillo existente.', 0),
('Administrador', 'Modifica promocion', 0),
('Administrador', 'Modifica promociones', 0),
('Administrador', 'Modifica roles y privilegios de empleados.', 0),
('Administrador', 'Modifica royalty.', 0),
('Administrador', 'Modifica status royalty', 0),
('Administrador', 'Modifica status royalty.', 0),
('Administrador', 'Modificar menu (tentativo).', 0),
('Administrador', 'Reclama premio royalty.', 0),
('Administrador', 'Regista inicio de sesión', 0),
('Administrador', 'Registra creación de cuenta', 0),
('Administrador', 'Registra días hábiles.', 0),
('Administrador', 'Registra evento', 0),
('Administrador', 'Registra ingrediente agotado', 0),
('Administrador', 'Registra ingrediente nuevo', 0),
('Administrador', 'Registra nuevo mensaje a usuarios.', 0),
('Administrador', 'Registra platillo agotado.', 0),
('Administrador', 'Registra platillo especial.', 0),
('Administrador', 'Registra platillo nuevo', 0),
('Administrador', 'Registrar orden ', 0),
('Administrador', 'Selecciona lugar de consumo', 0),
('Administrador', 'Visualiza días hábiles.', 0),
('Administrador', 'Visualiza el nivel de lealtad de los clientes.', 0),
('Administrador', 'Visualiza feedback de clientes.', 0),
('Administrador', 'Visualiza historial de comentarios (rating).', 0),
('Administrador', 'Visualiza información royalty', 0),
('Administrador', 'Visualiza la cantidad de visitas de royalty.', 0),
('Administrador', 'Visualiza menu', 0),
('Administrador', 'Visualiza métricas.', 0),
('Administrador', 'Visualiza promociones', 0),
('Administrador', 'Visualiza resumen de pedido', 0),
('Administrador', 'Visualiza su nivel de lealtad', 0),
('Colaborador', 'Registrar ingrediente nuevo.', 0);

-- --------------------------------------------------------

--
-- Table structure for table `royalty_desbloquea_promocion`
--

CREATE TABLE `royalty_desbloquea_promocion` (
  `nombre_royalty` varchar(100) NOT NULL,
  `id_promociones` varchar(10) NOT NULL,
  `numero_visitas_desbloquear` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Dumping data for table `royalty_desbloquea_promocion`
--

INSERT INTO `royalty_desbloquea_promocion` (`nombre_royalty`, `id_promociones`, `numero_visitas_desbloquear`) VALUES
('Fan', '287', 5),
('Mega Fan', '837', 16),
('Super Fan', '866', 11);

-- --------------------------------------------------------

--
-- Table structure for table `status_royalty`
--

CREATE TABLE `status_royalty` (
  `nombre` varchar(100) NOT NULL,
  `descripción` longtext DEFAULT NULL,
  `max_visitas` int(11) NOT NULL,
  `min_visitas` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Dumping data for table `status_royalty`
--

INSERT INTO `status_royalty` (`nombre`, `descripción`, `max_visitas`, `min_visitas`) VALUES
('Fan', '\"En este nivel normalmente se ofrecen beneficios exclusivos: acceso anticipado a contenido, mercancía especial, descuentos mayores, eventos privados, interacción más directa con el creador o la marca, e incluso reconocimiento público dentro de la comunidad. La idea es premiar la lealtad y el compromiso constante.\"', 10, 5),
('Mega Fan', '\"El nivel mega fan va un paso más allá. Está pensado para quienes demuestran un compromiso más fuerte y continuo. En este nivel pueden ofrecerse ventajas más destacadas como experiencias más personalizadas, eventos exclusivos, productos especiales o menciones directas. Se convierte en un espacio más selecto dentro de la comunidad, donde el vínculo con la marca o creador es más cercano y visible.\nEs una especie de escalera de compromiso: cada nivel no solo ofrece beneficios, sino también mayor pertenencia y conexión.\"', 20, 16),
('Super Fan', '\"Un nivel super fan representa a quienes ya no solo siguen el contenido, sino que participan activamente en la comunidad. Aquí suele haber beneficios atractivos como acceso anticipado a publicaciones, contenido exclusivo adicional, descuentos especiales o dinámicas privadas. También puede incluir interacción más cercana con el creador o reconocimiento dentro del grupo. La intención es recompensar la constancia y el entusiasmo.\"', 15, 11);

-- --------------------------------------------------------

--
-- Table structure for table `sucursal`
--

CREATE TABLE `sucursal` (
  `id_sucursal` varchar(10) NOT NULL,
  `país` varchar(100) NOT NULL,
  `ciudad` varchar(100) NOT NULL,
  `estado` varchar(100) NOT NULL,
  `municipio` varchar(100) NOT NULL,
  `calle` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Dumping data for table `sucursal`
--

INSERT INTO `sucursal` (`id_sucursal`, `país`, `ciudad`, `estado`, `municipio`, `calle`) VALUES
('S66', 'Mexico', 'Mazatlan', 'Sinaloa', 'Mazatlan', '123. Av. Humberto'),
('S67', 'Mexico', 'Culiacan', 'Sinaloa', 'Culiacan', '456. Blvd. Zapata'),
('S68', 'Mexico', 'Gdl', 'Jalisco', 'Gdl', '789. Av. Americas'),
('S69', 'Mexico', 'Monterrey', 'Nuevo Leon', 'Monterrey', '101. Av. Construcción'),
('S70', 'Mexico', 'CDMX', 'Ciudad de México', 'CDMX', '202. Paseo la Reforma'),
('S71', 'Mexico', 'Puebla', 'Puebla', 'Puebla', '303. Av Juarez'),
('S72', 'Mexico', 'Querétaro', 'Querétaro', 'Querétaro', '404. Av. Tecnologico'),
('S73', 'Mexico', 'Cancún', 'Quintana Roo', 'Cancún', '101. Av. Cocobongo'),
('S74', 'Mexico', 'Tijuana', 'Baja California', 'Tijuana', '283. Av. Revolucion'),
('S75', 'Mexico', 'Mérida', 'Yucatan', 'Mérida', '402. Paseo de Montejo');

-- --------------------------------------------------------

--
-- Table structure for table `tamaño`
--

CREATE TABLE `tamaño` (
  `tamaño` varchar(100) NOT NULL,
  `multiplicador` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Dumping data for table `tamaño`
--

INSERT INTO `tamaño` (`tamaño`, `multiplicador`) VALUES
('Chico', 1),
('Grande', 1.5),
('Meidano', 1.25),
('Tamaño', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`número_telefónico`),
  ADD KEY `fk_cliente_royalty` (`nombre_royalty`);

--
-- Indexes for table `colaborador`
--
ALTER TABLE `colaborador`
  ADD PRIMARY KEY (`id_colaborador`),
  ADD KEY `fk_sucursal` (`id_sucursal`),
  ADD KEY `fk_colaborador_rol` (`nombre_rol`);

--
-- Indexes for table `colaborador_orden`
--
ALTER TABLE `colaborador_orden`
  ADD PRIMARY KEY (`id_colaborador`,`id_orden`),
  ADD KEY `fk_colaborador` (`id_colaborador`),
  ADD KEY `fk_orden` (`id_orden`);

--
-- Indexes for table `evento`
--
ALTER TABLE `evento`
  ADD PRIMARY KEY (`id_evento`);

--
-- Indexes for table `evento_promocion`
--
ALTER TABLE `evento_promocion`
  ADD PRIMARY KEY (`id_promo`,`id_evento`),
  ADD KEY `fk_ep_promo` (`id_promo`),
  ADD KEY `fk_ep_evento` (`id_evento`);

--
-- Indexes for table `insumo`
--
ALTER TABLE `insumo`
  ADD PRIMARY KEY (`id_insumo`);

--
-- Indexes for table `insumo_producto`
--
ALTER TABLE `insumo_producto`
  ADD PRIMARY KEY (`id_insumo`,`id_producto`),
  ADD KEY `fk_ip_insumo` (`id_insumo`),
  ADD KEY `fk_ip_producto` (`id_producto`);

--
-- Indexes for table `orden`
--
ALTER TABLE `orden`
  ADD PRIMARY KEY (`id_orden`),
  ADD KEY `fk_orden_sucursal` (`id_sucursal`),
  ADD KEY `fk_orden_cliente` (`número_cliente`),
  ADD KEY `fk_orden_producto` (`id_producto`);

--
-- Indexes for table `privilegio`
--
ALTER TABLE `privilegio`
  ADD PRIMARY KEY (`nombre`);

--
-- Indexes for table `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_producto`);

--
-- Indexes for table `producto_evento`
--
ALTER TABLE `producto_evento`
  ADD PRIMARY KEY (`id_evento`,`id_producto`),
  ADD KEY `fk_pe_evento` (`id_evento`),
  ADD KEY `fk_pe_producto` (`id_producto`);

--
-- Indexes for table `promociones`
--
ALTER TABLE `promociones`
  ADD PRIMARY KEY (`id_promo`);

--
-- Indexes for table `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`id_review`),
  ADD KEY `fk_review_orden` (`id_orden`);

--
-- Indexes for table `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`nombre`);

--
-- Indexes for table `rol_privilegio`
--
ALTER TABLE `rol_privilegio`
  ADD PRIMARY KEY (`nombre_rol`,`nombre_privilegio`),
  ADD KEY `fk_rp_rol` (`nombre_rol`),
  ADD KEY `fk_rp_privilegio` (`nombre_privilegio`);

--
-- Indexes for table `royalty_desbloquea_promocion`
--
ALTER TABLE `royalty_desbloquea_promocion`
  ADD PRIMARY KEY (`nombre_royalty`,`id_promociones`),
  ADD KEY `fk_rdp_royalty` (`nombre_royalty`),
  ADD KEY `fk_rdp_promo` (`id_promociones`);

--
-- Indexes for table `status_royalty`
--
ALTER TABLE `status_royalty`
  ADD PRIMARY KEY (`nombre`);

--
-- Indexes for table `sucursal`
--
ALTER TABLE `sucursal`
  ADD PRIMARY KEY (`id_sucursal`);

--
-- Indexes for table `tamaño`
--
ALTER TABLE `tamaño`
  ADD PRIMARY KEY (`tamaño`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cliente`
--
ALTER TABLE `cliente`
  ADD CONSTRAINT `fk_cliente_royalty` FOREIGN KEY (`nombre_royalty`) REFERENCES `status_royalty` (`nombre`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `colaborador`
--
ALTER TABLE `colaborador`
  ADD CONSTRAINT `fk_colaborador_rol` FOREIGN KEY (`nombre_rol`) REFERENCES `rol` (`nombre`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `colaborador_orden`
--
ALTER TABLE `colaborador_orden`
  ADD CONSTRAINT `fk_colaborador` FOREIGN KEY (`id_colaborador`) REFERENCES `colaborador` (`id_colaborador`),
  ADD CONSTRAINT `fk_orden` FOREIGN KEY (`id_orden`) REFERENCES `orden` (`id_orden`);

--
-- Constraints for table `evento_promocion`
--
ALTER TABLE `evento_promocion`
  ADD CONSTRAINT `fk_ep_evento` FOREIGN KEY (`id_evento`) REFERENCES `evento` (`id_evento`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ep_promo` FOREIGN KEY (`id_promo`) REFERENCES `promociones` (`id_promo`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `insumo_producto`
--
ALTER TABLE `insumo_producto`
  ADD CONSTRAINT `fk_ip_insumo` FOREIGN KEY (`id_insumo`) REFERENCES `insumo` (`id_insumo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ip_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `orden`
--
ALTER TABLE `orden`
  ADD CONSTRAINT `fk_orden_cliente` FOREIGN KEY (`número_cliente`) REFERENCES `cliente` (`número_telefónico`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orden_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orden_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `producto_evento`
--
ALTER TABLE `producto_evento`
  ADD CONSTRAINT `fk_pe_evento` FOREIGN KEY (`id_evento`) REFERENCES `evento` (`id_evento`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pe_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `review`
--
ALTER TABLE `review`
  ADD CONSTRAINT `fk_review_orden` FOREIGN KEY (`id_orden`) REFERENCES `orden` (`id_orden`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `rol_privilegio`
--
ALTER TABLE `rol_privilegio`
  ADD CONSTRAINT `fk_rp_privilegio` FOREIGN KEY (`nombre_privilegio`) REFERENCES `privilegio` (`nombre`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rp_rol` FOREIGN KEY (`nombre_rol`) REFERENCES `rol` (`nombre`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `royalty_desbloquea_promocion`
--
ALTER TABLE `royalty_desbloquea_promocion`
  ADD CONSTRAINT `fk_rdp_promo` FOREIGN KEY (`id_promociones`) REFERENCES `promociones` (`id_promo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rdp_royalty` FOREIGN KEY (`nombre_royalty`) REFERENCES `status_royalty` (`nombre`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
