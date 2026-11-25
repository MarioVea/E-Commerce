import { supabaseAdmin } from '../config/supabase'

export const PRODUCT_IMAGES_BUCKET = 'product-images'

/**
 * Creates the public bucket used for product images if it does not exist.
 */
export async function ensureProductImagesBucket(): Promise<void> {
  const { data: buckets, error } = await supabaseAdmin.storage.listBuckets()
  if (error) {
    throw error
  }

  if (buckets.some((bucket) => bucket.name === PRODUCT_IMAGES_BUCKET)) {
    return
  }

  const { error: createError } = await supabaseAdmin.storage.createBucket(
    PRODUCT_IMAGES_BUCKET,
    {
      public: true,
      fileSizeLimit: '5MB',
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    },
  )

  if (createError) {
    throw createError
  }
}

/**
 * Uploads an image to the product-images bucket and returns its public URL.
 */
export async function uploadProductImage(file: Express.Multer.File): Promise<string> {
  await ensureProductImagesBucket()

  const extension = file.originalname.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`

  const { error } = await supabaseAdmin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    })

  if (error) {
    throw error
  }

  const { data } = supabaseAdmin.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path)
  return data.publicUrl
}
