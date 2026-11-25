-- Cap store additions
-- Adds image support and soft-delete to products, tracks the sold variant,
-- and registers the "Gorra" product type.

ALTER TABLE public.producto
  ADD COLUMN IF NOT EXISTS imagen_url text;

ALTER TABLE public.producto
  ADD COLUMN IF NOT EXISTS activo boolean NOT NULL DEFAULT true;

ALTER TABLE public.venta_detalle
  ADD COLUMN IF NOT EXISTS id_producto_color integer
  REFERENCES public.producto_color(id_producto_color);

CREATE INDEX IF NOT EXISTS idx_venta_detalle_id_producto_color
  ON public.venta_detalle(id_producto_color);

INSERT INTO public.tipo_producto (nombre_tipo)
SELECT 'Gorra'
WHERE NOT EXISTS (
  SELECT 1 FROM public.tipo_producto WHERE nombre_tipo = 'Gorra'
);
