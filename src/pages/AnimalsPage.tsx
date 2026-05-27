import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { AnimalPhotoCarousel } from '../components/AnimalPhotoCarousel'
import { useAuth } from '../contexts/AuthContext'
import { getAnimalPhotos } from '../services/animalPhotoService'
import { deleteAnimal, getAvailableAnimals } from '../services/animalService'
import type { AnimalPhotoResponse, AnimalResponse } from '../types'
import {
  formatAnimalAge,
  formatAnimalLocation,
  formatAnimalOwnerName,
  formatAnimalSex,
} from '../utils/animalFormatters'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'
import {
  pageMotion,
  staggerContainerMotion,
  staggerItemMotion,
} from '../utils/motionVariants'

export function AnimalsPage() {
  const { user } = useAuth()
  const [animals, setAnimals] = useState<AnimalResponse[]>([])
  const [photosByAnimalId, setPhotosByAnimalId] = useState<
    Record<number, AnimalPhotoResponse[]>
  >({})
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [deletingAnimalId, setDeletingAnimalId] = useState<number | null>(null)

  const isAdmin = user?.userType === 'ADMIN'

  useEffect(() => {
    async function loadAnimals() {
      try {
        const response = await getAvailableAnimals()
        setAnimals(response.content)

        const photoEntries = await Promise.all(
          response.content.map(async (animal) => {
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
        setErrorMessage(getApiErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }

    loadAnimals()
  }, [])

  async function handleDeleteAnimal(animal: AnimalResponse) {
    const shouldDelete = window.confirm(
      `Deseja remover ${animal.animalName} da listagem?`,
    )

    if (!shouldDelete) {
      return
    }

    setErrorMessage('')
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
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setDeletingAnimalId(null)
    }
  }

  return (
    <motion.section className="page" {...pageMotion}>
      <div>
        <p className="eyebrow">Animais</p>
        <h1>Animais disponiveis</h1>
      </div>

      <p>Conheca os animais que estao aguardando uma nova familia.</p>

      {isLoading && <p>Carregando animais...</p>}
      {errorMessage && <p className="form-error">{errorMessage}</p>}
      {successMessage && <p className="form-success">{successMessage}</p>}

      {!isLoading && !errorMessage && animals.length === 0 && (
        <p className="empty-state">Nenhum animal disponivel no momento.</p>
      )}

      {animals.length > 0 && (
        <motion.div className="animal-grid" {...staggerContainerMotion}>
          {animals.map((animal) => (
            <motion.article
              className="animal-card"
              key={animal.id}
              {...staggerItemMotion}
            >
              <AnimalPhotoCarousel
                animalName={animal.animalName}
                photos={photosByAnimalId[animal.id] ?? []}
              />

              <div className="animal-card__header">
                <h2>{animal.animalName}</h2>
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
                  <dt>Sexo</dt>
                  <dd>{formatAnimalSex(animal.sex)}</dd>
                </div>
                <div>
                  <dt>Localizacao</dt>
                  <dd>{formatAnimalLocation(animal)}</dd>
                </div>
                <div>
                  <dt>Responsavel</dt>
                  <dd>{formatAnimalOwnerName(animal.ownerName)}</dd>
                </div>
              </dl>

              <div className="actions">
                <Link
                  className="button button--secondary"
                  to={`/animals/${animal.id}`}
                >
                  Ver detalhes
                </Link>
                {isAdmin && (
                  <button
                    className="button button--danger"
                    type="button"
                    disabled={deletingAnimalId === animal.id}
                    onClick={() => handleDeleteAnimal(animal)}
                  >
                    {deletingAnimalId === animal.id ? 'Removendo...' : 'Remover'}
                  </button>
                )}
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}
    </motion.section>
  )
}
