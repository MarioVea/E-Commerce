# Plan de implementación — E-commerce de gorras (TypeScript + React + Docker + Supabase)

Project ref: `uetoeesorjhtdwjpilxt`
Stack: Express+TS (backend), Vite+React+TS (frontend), Supabase (DB/Auth/Storage), Docker Compose (2 contenedores).

---

## Fase 0 — Preparación del entorno

1. Verificar Node.js >= 18 y npm instalados (`node -v`, `npm -v`).
2. Verificar Docker Desktop corriendo (`docker --version`, `docker compose version`).
3. Crear carpeta raíz del proyecto `E-Commerce/` (ya existe).
4. Inicializar repositorio git (`git init`) y crear `.gitignore` (node_modules, .env, dist, supabase/.branches, etc.).

## Fase 1 — Scaffold base

5. Crear estructura de carpetas:
   - `backend/src/{config,routes,controllers,services,middleware,validators,types}/`
   - `frontend/src/{pages,components,services,hooks,types}/`
   - `supabase/{migrations}/`
6. Crear `backend/package.json` con scripts: dev, build, start, db:pull, db:push, db:new, gen:types.
7. Crear `backend/tsconfig.json` (strict, outDir dist, esModuleInterop).
8. Crear `frontend/package.json` con scripts: dev, build, preview.
9. Crear `frontend/vite.config.ts` (proxy a backend en dev).
10. Crear `frontend/tsconfig.json` y `tsconfig.node.json`.
11. Crear `docker-compose.yml` con servicios `backend` (port 4000) y `frontend` (nginx port 80).
12. Crear `backend/Dockerfile` (multi-stage: build TS → node runtime).
13. Crear `frontend/Dockerfile` (multi-stage: build Vite → nginx).
14. Crear `frontend/nginx.conf` (SPA fallback + proxy /api).
15. Crear `.env.example` en backend y frontend con placeholders (incl. SUPABASE_PROJECT_ID).
16. Crear `README.md` inicial con instrucciones.

## Fase 2 — Supabase CLI y baseline del schema

17. Instalar Supabase CLI como devDependency (`npm i -D supabase` en raíz o backend).
18. Crear `supabase/config.toml` (project_id = uetoeesorjhtdwjpilxt).
19. **Usuario ejecuta:** `npx supabase login` (abre navegador).
20. **Usuario ejecuta:** `npx supabase link --project-ref uetoeesorjhtdwjpilxt`.
21. Ejecutar `npx supabase db pull` → genera `supabase/migrations/00000000000000_baseline.sql`.
22. Revisar el SQL generado: listar tablas, columnas, FKs, RLS policies existentes.
23. Documentar en `README.md` el esquema real (nombres de tablas/columnas).
24. Ejecutar `npx supabase gen types typescript --project-id uetoeesorjhtdwjpilxt > backend/src/types/database.ts`.
25. Verificar que `database.ts` compila (`tsc --noEmit`).

## Fase 3 — Backend core

26. Instalar deps backend: express, cors, helmet, dotenv, zod, @supabase/supabase-js, multer (uploads), morgan.
27. Crear `backend/src/config/supabase.ts` (cliente anon + service role).
28. Crear `backend/src/middleware/auth.ts` (valida JWT de Supabase, carga profile).
29. Crear `backend/src/middleware/requireRole.ts` (admin/customer).
30. Crear `backend/src/middleware/errorHandler.ts`.
31. Crear `backend/src/index.ts` (Express app, cors, helmet, rutas, listen).
32. Crear validadores Zod en `backend/src/validators/`.

## Fase 4 — Auth y bootstrap admin

33. Crear ruta `POST /auth/register` (crea user en Supabase Auth + profile role=customer).
34. Crear ruta `POST /auth/login` (devuelve access token).
35. Crear ruta `GET /auth/me` (perfil autenticado).
36. Crear ruta `POST /admin/bootstrap` protegida por `ADMIN_BOOTSTRAP_SECRET` (crea primer admin; se deshabilita si ya existe admin).
37. Probar registro/login con curl/Postman.

## Fase 5 — Productos y Storage

38. Crear servicio de Storage: crear bucket `product-images` si no existe (service role).
39. Crear ruta `POST /admin/products` con upload de imagen → Storage → guarda URL pública.
40. Crear `GET /products` (listado + búsqueda `?q=` + filtro categoría + paginación).
41. Crear `GET /products/:id`.
42. Crear `PUT/DELETE /admin/products/:id`.
43. Crear rutas admin de categorías (CRUD).

## Fase 6 — Carrito

44. Crear `GET /cart` (carrito del usuario autenticado).
45. Crear `POST /cart/items` (agregar producto + cantidad).
46. Crear `PATCH /cart/items/:id` (actualizar cantidad).
47. Crear `DELETE /cart/items/:id` (eliminar item).

## Fase 7 — Pedidos, cancelación y devolución

48. Crear `POST /orders` (checkout: crea order + order_items desde carrito, vacía carrito).
49. Crear `GET /orders` (pedidos del usuario).
50. Crear `GET /orders/:id`.
51. Crear `POST /orders/:id/cancel` (solo si status permite).
52. Crear `POST /orders/:id/return` (crea registro en returns).
53. Crear endpoints admin: `GET /admin/orders`, `PATCH /admin/orders/:id/status`, `GET /admin/returns`, `PATCH /admin/returns/:id`.

## Fase 8 — Frontend

54. Instalar deps frontend: react-router-dom, @tanstack/react-query, axios, tailwindcss, postcss, autoprefixer.
55. Configurar Tailwind (`tailwind.config.js`, `index.css`).
56. Crear cliente API (`src/services/api.ts`) con interceptor de token.
57. Crear cliente Supabase (`src/services/supabase.ts`) con anon key.
58. Crear componentes: Navbar, ProductCard, ProtectedRoute (por rol).
59. Crear páginas: Home, Catalog (con búsqueda/filtros), ProductDetail, Cart, Checkout, Orders, OrderDetail, Profile, Login, Register.
60. Crear páginas admin: AdminDashboard, AdminProducts, AdminOrders, AdminReturns, AdminUsers.
61. Configurar rutas en `App.tsx` con protección por rol.
62. Integrar React Query para caché de productos/pedidos.

## Fase 9 — Docker y pruebas

63. Construir imágenes: `docker compose build`.
64. Levantar: `docker compose up`.
65. Probar flujo completo: registro → login → ver catálogo → buscar → agregar al carrito → checkout → ver pedido → cancelar/devolver.
66. Probar flujo admin: bootstrap → login admin → crear producto con imagen → ver pedidos/devoluciones.
67. Verificar imágenes servidas desde Supabase Storage.

## Fase 10 — Documentación y cierre

68. Completar `README.md`: variables de entorno, cómo correr (dev y docker), endpoints, flujo de migraciones.
69. Agregar instrucciones de bootstrap del primer admin.
70. Verificar `.gitignore` (no commitear .env ni node_modules).
71. Commit final.

---

## Notas

- Toda modificación a la DB se hará vía migraciones en `supabase/migrations/` (nunca directo en dashboard).
- El schema actual se captura en el baseline (paso 21).
- Tipos TS se regeneran tras cada migración (paso 24).
- RLS ya existe en la DB; no se modifica.