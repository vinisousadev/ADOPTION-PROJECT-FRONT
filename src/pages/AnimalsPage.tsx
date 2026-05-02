import { useEffect, useState } from 'react'
import { getMainAnimalPhotoUrl } from '../services/animalPhotoService'
import { getAvailableAnimals } from '../services/animalService'
import type { AnimalResponse } from '../types'
import {
  formatAnimalAge,
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
  const [photoUrlsByAnimalId, setPhotoUrlsByAnimalId] = useState<
    Record<number, string>
  >({})
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadAnimals() {
      try {
        const response = await getAvailableAnimals()
        setAnimals(response.content)

        const photoUrlEntries = await Promise.all(
          response.content.map(async (animal) => {
            try {
              const photoUrl = await getMainAnimalPhotoUrl(animal.id)
              return [animal.id, photoUrl] as const
            } catch {
              return [animal.id, undefined] as const
            }
          }),
        )

        const nextPhotoUrlsByAnimalId: Record<number, string> = {}

        photoUrlEntries.forEach(([animalId, photoUrl]) => {
          if (photoUrl) {
            nextPhotoUrlsByAnimalId[animalId] = photoUrl
          }
        })

        setPhotoUrlsByAnimalId(nextPhotoUrlsByAnimalId)
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
              {photoUrlsByAnimalId[animal.id] ? (
                <img
                  className="animal-card__photo"
                  src={photoUrlsByAnimalId[animal.id]}
                  alt={`Foto de ${animal.animalName}`}
                />
              ) : (
                <div className="animal-card__photo animal-card__photo--empty">
                  Sem foto
                </div>
              )}

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
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
