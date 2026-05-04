import { supabase } from './supabaseClient'

const feedPostPhotosBucket =
  import.meta.env.VITE_SUPABASE_FEED_POST_PHOTOS_BUCKET ||
  import.meta.env.VITE_SUPABASE_ANIMAL_PHOTOS_BUCKET

if (!feedPostPhotosBucket) {
  throw new Error('Feed post photos bucket environment variable is not configured')
}

function getFileExtension(file: File) {
  return file.name.split('.').pop()?.toLowerCase() || 'jpg'
}

function createFeedPostPhotoPath(file: File) {
  const fileExtension = getFileExtension(file)
  const uniqueFileName = `${crypto.randomUUID()}.${fileExtension}`

  return `feed/${uniqueFileName}`
}

export async function uploadFeedPostPhoto(file: File) {
  const filePath = createFeedPostPhotoPath(file)

  const { error } = await supabase.storage
    .from(feedPostPhotosBucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(error.message)
  }

  const { data } = supabase.storage
    .from(feedPostPhotosBucket)
    .getPublicUrl(filePath)

  return {
    filePath,
    publicUrl: data.publicUrl,
  }
}

export async function removeUploadedFeedPostPhoto(filePath: string) {
  const { error } = await supabase.storage
    .from(feedPostPhotosBucket)
    .remove([filePath])

  if (error) {
    throw new Error(error.message)
  }
}
