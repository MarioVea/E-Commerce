-- Seed data for the cap store (idempotent).
-- Run with: npx supabase db query --remote --file supabase/seed.sql --yes

DO $$
DECLARE
  v_tipo int;
  v_prov int;
  v_talla int;
  v_prod int;
  v_pt int;
  v_pc int;
  rec record;
BEGIN
  SELECT id_tipo INTO v_tipo
  FROM public.tipo_producto
  WHERE nombre_tipo = 'Gorra'
  LIMIT 1;

  IF v_tipo IS NULL THEN
    INSERT INTO public.tipo_producto (nombre_tipo)
    VALUES ('Gorra')
    RETURNING id_tipo INTO v_tipo;
  END IF;

  SELECT id_talla INTO v_talla
  FROM public.talla
  WHERE clave_talla = 'UNICA'
  LIMIT 1;

  SELECT id_proveedor INTO v_prov
  FROM public.proveedor
  WHERE nombre_proveedor = 'Proveedor Demo'
  LIMIT 1;

  IF v_prov IS NULL THEN
    INSERT INTO public.proveedor (nombre_proveedor)
    VALUES ('Proveedor Demo')
    RETURNING id_proveedor INTO v_prov;
  END IF;

  FOR rec IN
    SELECT *
    FROM (VALUES
      ('Gorra Clásica Negra', 'Gorra ajustable de algodón, color negro.', 1, 50.00, 120.00, 25),
      ('Gorra Trucker Azul', 'Gorra trucker con malla transpirable, color azul.', 4, 60.00, 150.00, 15),
      ('Gorra Snapback Roja', 'Gorra snapback de perfil alto, color rojo.', 3, 70.00, 180.00, 10)
    ) AS t(nombre, descripcion, id_color, precio_compra, precio_venta, stock)
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.producto WHERE nombre_producto = rec.nombre
    ) THEN
      INSERT INTO public.producto (id_tipo, nombre_producto, descripcion_producto)
      VALUES (v_tipo, rec.nombre, rec.descripcion)
      RETURNING id_producto INTO v_prod;

      INSERT INTO public.producto_talla (id_producto, id_talla)
      VALUES (v_prod, v_talla)
      RETURNING id_producto_talla INTO v_pt;

      INSERT INTO public.producto_color (
        id_producto_talla, id_color, id_producto, disponible,
        precio_compra, precio_venta, margen_ganancia
      )
      VALUES (
        v_pt, rec.id_color, v_prod, true,
        rec.precio_compra, rec.precio_venta, rec.precio_venta - rec.precio_compra
      )
      RETURNING id_producto_color INTO v_pc;

      INSERT INTO public.inventario (id_producto_color, id_proveedor, stock, minimo)
      VALUES (v_pc, v_prov, rec.stock, 5);
    END IF;
  END LOOP;
END $$;
