import multer from 'multer'

/** In-memory upload; the file is forwarded to Supabase Storage. */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
})
