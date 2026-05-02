import { useState } from 'react'
import type { AnimalPhotoResponse } from '../types'

type AnimalPhotoCarouselProps = {
  animalName: string
  photos: AnimalPhotoResponse[]
}

export function AnimalPhotoCarousel({
  animalName,
  photos,
}: AnimalPhotoCarouselProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const orderedPhotos = [...photos].sort((currentPhoto, nextPhoto) => {
    if (currentPhoto.isMain === nextPhoto.isMain) {
      return currentPhoto.id - nextPhoto.id
    }

    return currentPhoto.isMain === 'Y' ? -1 : 1
  })

  const currentPhoto = orderedPhotos[currentPhotoIndex]
  const hasMultiplePhotos = orderedPhotos.length > 1

  function showPreviousPhoto() {
    setCurrentPhotoIndex((currentIndex) =>
      currentIndex === 0 ? orderedPhotos.length - 1 : currentIndex - 1,
    )
  }

  function showNextPhoto() {
    setCurrentPhotoIndex((currentIndex) =>
      currentIndex === orderedPhotos.length - 1 ? 0 : currentIndex + 1,
    )
  }

  if (!currentPhoto) {
    return (
      <div className="animal-card__photo animal-card__photo--empty">
        Sem foto
      </div>
    )
  }

  return (
    <div className="animal-card__photo-frame">
      <img
        className="animal-card__photo"
        src={currentPhoto.photoUrl}
        alt={`Foto de ${animalName}`}
      />

      {hasMultiplePhotos && (
        <>
          <button
            className="animal-card__photo-button animal-card__photo-button--previous"
            type="button"
            onClick={showPreviousPhoto}
            aria-label="Foto anterior"
          >
            ‹
          </button>
          <button
            className="animal-card__photo-button animal-card__photo-button--next"
            type="button"
            onClick={showNextPhoto}
            aria-label="Proxima foto"
          >
            ›
          </button>
          <span className="animal-card__photo-count">
            {currentPhotoIndex + 1}/{orderedPhotos.length}
          </span>
        </>
      )}
    </div>
  )
}
