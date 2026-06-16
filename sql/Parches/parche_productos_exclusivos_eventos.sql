ALTER TABLE `producto`
  ADD COLUMN IF NOT EXISTS `EsExclusivo` TINYINT(1) NOT NULL DEFAULT 0
  COMMENT '0 = producto normal; 1 = producto exclusivo de evento';

ALTER TABLE `producto_pertenece_evento`
  ADD UNIQUE KEY IF NOT EXISTS `uq_producto_evento` (`ID_Evento`, `ID_Producto`);

ALTER TABLE `producto`
  ADD INDEX IF NOT EXISTS `idx_producto_menu_evento` (`Disponible`, `EsExclusivo`);

ALTER TABLE `evento`
  ADD INDEX IF NOT EXISTS `idx_evento_activo_fechas` (`Activo`, `Fecha_Inicio`, `Fecha_Final`);