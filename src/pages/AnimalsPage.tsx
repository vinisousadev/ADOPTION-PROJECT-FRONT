import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimalPhotoCarousel } from '../components/AnimalPhotoCarousel'
import { getAnimalPhotos } from '../services/animalPhotoService'
import { getAvailableAnimals } from '../services/animalService'
import type { AnimalPhotoResponse, AnimalResponse } from '../types'
import {
  formatAnimalAge,
  formatAnimalLocation,
  formatAnimalOwnerName,
  formatAnimalSex,
  formatAnimalSize,
  formatAnimalStatus,
  formatAnimalWeight,
  formatYesNo,
} from '../utils/animalFormatters'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

function getShortDescription(description: string | undefined) {
  if (!description) {
    return 'Sem descricao informada.'
  }

  if (description.length <= 120) {
    return description
  }

  return `${description.slice(0, 117)}...`
}

export function AnimalsPage() {
  const [animals, setAnimals] = useState<AnimalResponse[]>([])
  const [photosByAnimalId, setPhotosByAnimalId] = useState<
    Record<number, AnimalPhotoResponse[]>
  >({})
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

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

  return (
    <section className="page">
      <div>
        <p className="eyebrow">Animais</p>
        <h1>Animais disponiveis</h1>
      </div>

      <p>Conheca os animais que estao aguardando uma nova familia.</p>

      {isLoading && <p>Carregando animais...</p>}
      {errorMessage && <p className="form-error">{errorMessage}</p>}

      {!isLoading && !errorMessage && animals.length === 0 && (
        <p className="empty-state">Nenhum animal disponivel no momento.</p>
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

              <p className="animal-card__description">
                {getShortDescription(animal.description)}
              </p>

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
                  <dt>Peso</dt>
                  <dd>{formatAnimalWeight(animal.weightKg)}</dd>
                </div>
                <div>
                  <dt>Vacinado</dt>
                  <dd>{formatYesNo(animal.vaccinated)}</dd>
                </div>
                <div>
                  <dt>Castrado</dt>
                  <dd>{formatYesNo(animal.neutered)}</dd>
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
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
