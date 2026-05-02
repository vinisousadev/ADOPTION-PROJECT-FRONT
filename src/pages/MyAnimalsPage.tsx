import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimalPhotoCarousel } from '../components/AnimalPhotoCarousel'
import { getAnimalPhotos } from '../services/animalPhotoService'
import { deleteAnimal, getMyAnimals } from '../services/animalService'
import type { AnimalPhotoResponse, AnimalResponse } from '../types'
import {
  formatAnimalAge,
  formatAnimalLocation,
  formatAnimalSex,
  formatAnimalSize,
  formatAnimalStatus,
} from '../utils/animalFormatters'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

export function MyAnimalsPage() {
  const [animals, setAnimals] = useState<AnimalResponse[]>([])
  const [photosByAnimalId, setPhotosByAnimalId] = useState<
    Record<number, AnimalPhotoResponse[]>
  >({})
  const [successMessage, setSuccessMessage] = useState('')
  const [deletingAnimalId, setDeletingAnimalId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadMyAnimals() {
      try {
        const response = await getMyAnimals()
        const visibleAnimals = response.content.filter(
          (animal) => animal.status !== 'REMOVED',
        )
        setAnimals(visibleAnimals)

        const photoEntries = await Promise.all(
          visibleAnimals.map(async (animal) => {
            try {
              const photosResponse = await getAnimalPhotos(animal.id)
              return [animal.id, photosResponse.content] as const
            } catch {
              return [animal.id, [] as AnimalPhotoResponse[]] as const
            }
          }),
        )

        const nextPhotosByAnimalId: Record<number, AnimalPhotoResponse[]> = {}

        photoEntries.forEach(([animalId, photos]) => {
          nextPhotosByAnimalId[animalId] = photos
        })

        setPhotosByAnimalId(nextPhotosByAnimalId)
      } catch (error) {
        setMessage(getApiErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }

    loadMyAnimals()
  }, [])

  async function handleDeleteAnimal(animal: AnimalResponse) {
    const shouldDelete = window.confirm(
      `Deseja remover ${animal.animalName} da listagem?`,
    )

    if (!shouldDelete) {
      return
    }

    setMessage('')
    setSuccessMessage('')
    setDeletingAnimalId(animal.id)

    try {
      await deleteAnimal(animal.id)
      setAnimals((currentAnimals) =>
        currentAnimals.filter((currentAnimal) => currentAnimal.id !== animal.id),
      )
      setPhotosByAnimalId((currentPhotos) => {
        const nextPhotos = { ...currentPhotos }
        delete nextPhotos[animal.id]

        return nextPhotos
      })
      setSuccessMessage('Animal removido com sucesso.')
    } catch (error) {
      setMessage(getApiErrorMessage(error))
    } finally {
      setDeletingAnimalId(null)
    }
  }

  return (
    <section className="page">
      <h1>Meus animais</h1>
      <p>Animais cadastrados por voce na plataforma.</p>

      {isLoading && <p>Carregando animais...</p>}
      {message && <p className="form-error">{message}</p>}
      {successMessage && <p className="form-success">{successMessage}</p>}

      {!isLoading && !message && !successMessage && animals.length === 0 && (
        <p className="empty-state">Voce ainda nao cadastrou animais.</p>
      )}

      {animals.length > 0 && (
        <div className="animal-grid">
          {animals.map((animal) => (
            <article className="animal-card" key={animal.id}>
              <AnimalPhotoCarousel
                animalName={animal.animalName}
                photos={photosByAnimalId[animal.id] ?? []}
              />

              <div className="animal-card__header">
                <h2>{animal.animalName}</h2>
                <span>{formatAnimalStatus(animal.status)}</span>

                <p>
                  {animal.species}
                  {animal.breed ? ` - ${animal.breed}` : ''}
                </p>
              </div>

              <dl>
                <div>
                  <dt>Idade</dt>
                  <dd>{formatAnimalAge(animal.ageValue, animal.ageUnit)}</dd>
                </div>
                <div>
                  <dt>Porte</dt>
                  <dd>{formatAnimalSize(animal.animalSize)}</dd>
                </div>
                <div>
                  <dt>Sexo</dt>
                  <dd>{formatAnimalSex(animal.sex)}</dd>
                </div>
                <div>
                  <dt>Localizacao</dt>
                  <dd>{formatAnimalLocation(animal)}</dd>
                </div>
              </dl>

              <div className="actions">
                <Link
                  className="button button--secondary"
                  to={`/animals/${animal.id}/edit`}
                >
                  Editar
                </Link>
                <button
                  className="button button--danger"
                  type="button"
                  disabled={deletingAnimalId === animal.id}
                  onClick={() => handleDeleteAnimal(animal)}
                >
                  {deletingAnimalId === animal.id ? 'Removendo...' : 'Remover'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
