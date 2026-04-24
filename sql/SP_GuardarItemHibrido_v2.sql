-- Corre este script en tu BD para actualizar el stored procedure.
-- Soporta tipo_cambio: 'base', 'extra', 'quitado'

DROP PROCEDURE IF EXISTS `SP_GuardarItemHibrido`;

DELIMITER $$

CREATE PROCEDURE `SP_GuardarItemHibrido` (
    IN `p_idOrden`      VARCHAR(10)  CHARSET utf8mb4,
    IN `p_idProducto`   VARCHAR(50)  CHARSET utf8mb4,
    IN `p_precioVenta`  DECIMAL(10,2),
    IN `p_jsonExtras`   TEXT         CHARSET utf8mb4
)
BEGIN
    DECLARE v_id_orden_producto INT;
    DECLARE v_json_length       INT          DEFAULT 0;
    DECLARE i                   INT          DEFAULT 0;
    DECLARE v_id_insumo         VARCHAR(50)  CHARSET utf8mb4;
    DECLARE v_precio_extra      DECIMAL(10,2);
    DECLARE v_tipo_cambio       VARCHAR(20);

    -- 1. Insertar el producto en la orden
    INSERT INTO orden_tiene_producto (ID_Orden, ID_Producto, Cantidad, Precio_Venta)
    VALUES (p_idOrden, p_idProducto, 1, p_precioVenta);

    SET v_id_orden_producto = LAST_INSERT_ID();

    -- 2. Procesar ingredientes del JSON
    IF p_jsonExtras IS NOT NULL AND p_jsonExtras != '[]' AND p_jsonExtras != '' THEN
        SET v_json_length = JSON_LENGTH(p_jsonExtras);

        WHILE i < v_json_length DO
            SET v_id_insumo = JSON_UNQUOTE(JSON_EXTRACT(p_jsonExtras, CONCAT('$[', i, '].id_insumo')));

            SET v_precio_extra = CAST(
                IFNULL(JSON_UNQUOTE(JSON_EXTRACT(p_jsonExtras, CONCAT('$[', i, '].precio'))), '0')
                AS DECIMAL(10,2)
            );

            -- Si el JSON trae tipo_cambio lo usa; si no (crepa personalizada legacy) usa 'base'
            SET v_tipo_cambio = IFNULL(
                JSON_UNQUOTE(JSON_EXTRACT(p_jsonExtras, CONCAT('$[', i, '].tipo_cambio'))),
                'base'
            );

            INSERT INTO detalle_orden_insumos
                (id_orden_producto, ID_Orden, ID_Insumo, tipo_cambio, precio_momento)
            VALUES
                (v_id_orden_producto, p_idOrden, v_id_insumo, v_tipo_cambio, v_precio_extra);

            SET i = i + 1;
        END WHILE;
    END IF;
END$$

DELIMITER ;
