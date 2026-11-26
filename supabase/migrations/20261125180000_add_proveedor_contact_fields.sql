-- Adds contact information to suppliers.

ALTER TABLE public.proveedor
  ADD COLUMN IF NOT EXISTS numero_telefono text,
  ADD COLUMN IF NOT EXISTS direccion text,
  ADD COLUMN IF NOT EXISTS correo_electronico text;
