import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimalPhotoCarousel } from '../components/AnimalPhotoCarousel'
import { useAuth } from '../contexts/AuthContext'
import { createAdoptionRequest } from '../services/adoptionRequestService'
import { getAnimalPhotos } from '../services/animalPhotoService'
import { getAnimalById } from '../services/animalService'
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

export function AnimalDetailsPage() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()
  const [animal, setAnimal] = useState<AnimalResponse | null>(null)
  const [photos, setPhotos] = useState<AnimalPhotoResponse[]>([])
  const [adoptionMessage, setAdoptionMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [adoptionErrorMessage, setAdoptionErrorMessage] = useState('')
  const [adoptionSuccessMessage, setAdoptionSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingAdoptionRequest, setIsSubmittingAdoptionRequest] =
    useState(false)

  const animalId = Number(id)

  useEffect(() => {
    async function loadAnimalDetails() {
      if (!animalId) {
        setErrorMessage('Animal nao encontrado.')
        setIsLoading(false)
        return
      }

      try {
        const [animalResponse, photosResponse] = await Promise.all([
          getAnimalById(animalId),
          getAnimalPhotos(animalId),
        ])

        setAnimal(animalResponse)
        setPhotos(photosResponse.content)
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }

    loadAnimalDetails()
  }, [animalId])

  async function handleAdoptionRequestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAdoptionErrorMessage('')
    setAdoptionSuccessMessage('')

    if (!animal) {
      return
    }

    if (!isAuthenticated) {
      setAdoptionErrorMessage('Faca login para solicitar a adocao.')
      return
    }

    if (user?.userId === animal.userId) {
      setAdoptionErrorMessage('Voce nao pode solicitar adocao do proprio animal.')
      return
    }

    setIsSubmittingAdoptionRequest(true)

    try {
      await createAdoptionRequest({
        animalId: animal.id,
        message: adoptionMessage.trim() || undefined,
      })

      setAdoptionMessage('')
      setAdoptionSuccessMessage('Solicitacao de adocao enviada com sucesso.')
    } catch (error) {
      setAdoptionErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSubmittingAdoptionRequest(false)
    }
  }

  if (isLoading) {
    return (
      <section className="page">
        <p>Carregando animal...</p>
      </section>
    )
  }

  if (errorMessage || !animal) {
    return (
      <section className="page">
        <p className="form-error">{errorMessage || 'Animal nao encontrado.'}</p>
        <div className="actions">
          <Link className="button button--secondary" to="/animals">
            Voltar para animais
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="animal-details">
      <div className="animal-details__media">
        <AnimalPhotoCarousel animalName={animal.animalName} photos={photos} />
      </div>

      <div className="animal-details__content">
        <div>
          <p className="eyebrow">{formatAnimalStatus(animal.status)}</p>
          <h1>{animal.animalName}</h1>
          <p>
            {animal.species}
            {animal.breed ? ` - ${animal.breed}` : ''}
          </p>
        </div>

        <dl className="animal-details__facts">
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

        <div className="animal-details__description">
          <h2>Descricao</h2>
          <p>{animal.description || 'Sem descricao informada.'}</p>
        </div>

        <form className="adoption-request-panel" onSubmit={handleAdoptionRequestSubmit}>
          <div>
            <h2>Solicitar adocao</h2>
            <p>Envie uma mensagem para o responsavel pelo animal.</p>
          </div>

          {!isAuthenticated && (
            <p className="form-error">Voce precisa entrar para solicitar adocao.</p>
          )}

          {user?.userId === animal.userId && (
            <p className="empty-state">
              Este animal foi cadastrado por voce.
            </p>
          )}

          <div className="form-field">
            <label htmlFor="adoptionMessage">
              Conte por que voce quer adotar esse animal
            </label>
            <textarea
              id="adoptionMessage"
              value={adoptionMessage}
              onChange={(event) => setAdoptionMessage(event.target.value)}
              maxLength={500}
              rows={4}
              disabled={!isAuthenticated || user?.userId === animal.userId}
            />
          </div>

          {adoptionErrorMessage && (
            <p className="form-error">{adoptionErrorMessage}</p>
          )}
          {adoptionSuccessMessage && (
            <p className="form-success">{adoptionSuccessMessage}</p>
          )}

          <button
            className="button"
            type="submit"
            disabled={
              !isAuthenticated ||
              user?.userId === animal.userId ||
              isSubmittingAdoptionRequest
            }
          >
            {isSubmittingAdoptionRequest
              ? 'Enviando solicitacao...'
              : 'Solicitar adocao'}
          </button>
        </form>

        <div className="actions">
          <Link className="button button--secondary" to="/animals">
            Voltar
          </Link>
        </div>
      </div>
    </section>
  )
}
