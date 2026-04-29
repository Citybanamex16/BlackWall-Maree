/*
  Parche: crema batida por producto
  Objetivo:
  1. Agregar control individual por producto.
  2. Inicializar el nuevo campo con la configuración actual de cada categoría.
*/

ALTER TABLE `producto`
ADD COLUMN `Permite_Crema_Batida` tinyint(1) NOT NULL DEFAULT 0 AFTER `Imagen`;

UPDATE `producto` p
LEFT JOIN `categoría` c ON c.Nombre = p.`Categoría`
SET p.`Permite_Crema_Batida` = COALESCE(c.`Permite_Crema_Batida`, 0);
