import { supabase } from './supabaseClient'

const animalPhotosBucket = import.meta.env.VITE_SUPABASE_ANIMAL_PHOTOS_BUCKET

if (!animalPhotosBucket) {
  throw new Error('Animal photos bucket environment variable is not configured')
}

function getFileExtension(file: File) {
  return file.name.split('.').pop()?.toLowerCase() || 'jpg'
}

function createAnimalPhotoPath(file: File) {
  const fileExtension = getFileExtension(file)
  const uniqueFileName = `${crypto.randomUUID()}.${fileExtension}`

  return `uploads/${uniqueFileName}`
}

export async function uploadAnimalPhoto(file: File) {
  const filePath = createAnimalPhotoPath(file)

  const { error } = await supabase.storage
    .from(animalPhotosBucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(error.message)
  }

  const { data } = supabase.storage
    .from(animalPhotosBucket)
    .getPublicUrl(filePath)

  return {
    filePath,
    publicUrl: data.publicUrl,
  }
}

export async function removeUploadedAnimalPhoto(filePath: string) {
  const { error } = await supabase.storage
    .from(animalPhotosBucket)
    .remove([filePath])

  if (error) {
    throw new Error(error.message)
  }
}
