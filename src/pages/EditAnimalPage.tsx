import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Area } from 'react-easy-crop'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ImageCropper } from '../components/ImageCropper'
import {
  deleteAnimalPhoto,
  getAnimalPhotos,
  patchAnimalPhoto,
  uploadAnimalPhoto,
} from '../services/animalPhotoService'
import { getAnimalById, patchAnimal } from '../services/animalService'
import type { AgeUnit, AnimalPhotoResponse, AnimalSex, YesNo } from '../types'
import { createCroppedImageFile } from '../utils/cropImage'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

const acceptedPhotoTypes = ['image/jpeg', 'image/png', 'image/webp']
const maxPhotoSizeInBytes = 4 * 1024 * 1024

type EditAnimalFormState = {
  animalName: string
  species: string
  breed: string
  birthDate: string
  ageValue: string
  ageUnit: '' | AgeUnit
  animalSize: string
  sex: '' | AnimalSex
  weightKg: string
  vaccinated: '' | YesNo
  neutered: '' | YesNo
  description: string
}

const initialFormState: EditAnimalFormState = {
  animalName: '',
  species: '',
  breed: '',
  birthDate: '',
  ageValue: '',
  ageUnit: '',
  animalSize: '',
  sex: '',
  weightKg: '',
  vaccinated: '',
  neutered: '',
  description: '',
}

export function EditAnimalPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialFormState)
  const [photos, setPhotos] = useState<AnimalPhotoResponse[]>([])
  const [pendingPhotoFiles, setPendingPhotoFiles] = useState<File[]>([])
  const [originalPhotoName, setOriginalPhotoName] = useState('')
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('')
  const [isCroppingPhoto, setIsCroppingPhoto] = useState(false)
  const [photoInputKey, setPhotoInputKey] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoActionId, setPhotoActionId] = useState<number | null>(null)

  const animalId = Number(id)

  useEffect(() => {
    async function loadAnimal() {
      if (!animalId) {
        setErrorMessage('Animal nao encontrado.')
        setIsLoading(false)
        return
      }

      try {
        const animal = await getAnimalById(animalId)

        setForm({
          animalName: animal.animalName,
          species: animal.species,
          breed: animal.breed ?? '',
          birthDate: animal.birthDate ?? '',
          ageValue:
            animal.ageValue !== undefined ? String(animal.ageValue) : '',
          ageUnit: animal.ageUnit ?? '',
          animalSize: animal.animalSize ?? '',
          sex: animal.sex ?? '',
          weightKg:
            animal.weightKg !== undefined ? String(animal.weightKg) : '',
          vaccinated: animal.vaccinated,
          neutered: animal.neutered,
          description: animal.description ?? '',
        })

        const photosResponse = await getAnimalPhotos(animalId)
        setPhotos(photosResponse.content)
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }

    loadAnimal()
  }, [animalId])

  function updateField(field: keyof EditAnimalFormState, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  function validateForm() {
    if (form.animalName.trim().length < 2) {
      return 'Informe o nome do animal.'
    }

    if (form.species.trim().length < 2) {
      return 'Informe a especie do animal.'
    }

    if (!form.vaccinated) {
      return 'Informe se o animal e vacinado.'
    }

    if (!form.neutered) {
      return 'Informe se o animal e castrado.'
    }

    if (
      (form.ageValue && !form.ageUnit) ||
      (!form.ageValue && form.ageUnit)
    ) {
      return 'Informe a idade e a unidade juntas.'
    }

    if (form.weightKg && Number(form.weightKg) <= 0) {
      return 'O peso deve ser maior que zero.'
    }

    return ''
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const validationError = validateForm()

    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      await patchAnimal(animalId, {
        animalName: form.animalName.trim(),
        species: form.species.trim(),
        breed: form.breed.trim() || undefined,
        birthDate: form.birthDate || undefined,
        ageValue: form.ageValue ? Number(form.ageValue) : undefined,
        ageUnit: form.ageUnit || undefined,
        animalSize: form.animalSize || undefined,
        sex: form.sex || undefined,
        weightKg: form.weightKg ? Number(form.weightKg) : undefined,
        vaccinated: form.vaccinated as YesNo,
        neutered: form.neutered as YesNo,
        description: form.description.trim() || undefined,
      })

      setSuccessMessage('Animal atualizado com sucesso.')
      setTimeout(() => navigate('/my-animals'), 700)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  function validatePhotoFile(file: File) {
    if (!acceptedPhotoTypes.includes(file.type)) {
      return 'Envie apenas imagens JPG, PNG ou WEBP.'
    }

    if (file.size > maxPhotoSizeInBytes) {
      return 'Cada foto deve ter no maximo 4 MB.'
    }

    return ''
  }

  function startCropForFile(file: File) {
    setOriginalPhotoName(file.name)
    setPhotoPreviewUrl(URL.createObjectURL(file))
    setIsCroppingPhoto(true)
  }

  function clearCurrentCrop() {
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl)
    }

    setOriginalPhotoName('')
    setPhotoPreviewUrl('')
    setIsCroppingPhoto(false)
  }

  function handlePhotoChange(files: FileList | null) {
    setErrorMessage('')
    setSuccessMessage('')

    const selectedFiles = Array.from(files ?? [])

    if (selectedFiles.length === 0) {
      return
    }

    const validationError = selectedFiles
      .map((file) => validatePhotoFile(file))
      .find(Boolean)

    if (validationError) {
      setPhotoInputKey((currentKey) => currentKey + 1)
      setErrorMessage(validationError)
      return
    }

    const [firstFile, ...remainingFiles] = selectedFiles
    setPendingPhotoFiles(remainingFiles)
    startCropForFile(firstFile)
  }

  function handleCropCancel() {
    clearCurrentCrop()
    setPendingPhotoFiles([])
    setPhotoInputKey((currentKey) => currentKey + 1)
  }

  async function handleCropConfirm(croppedAreaPixels: Area) {
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const croppedFile = await createCroppedImageFile(
        photoPreviewUrl,
        croppedAreaPixels,
        originalPhotoName || 'animal-photo.jpg',
      )

      const createdPhoto = await uploadAnimalPhoto(
        animalId,
        croppedFile,
        photos.length === 0 ? 'Y' : 'N',
      )

      setPhotos((currentPhotos) => [...currentPhotos, createdPhoto])
      clearCurrentCrop()

      const [nextFile, ...remainingFiles] = pendingPhotoFiles
      setPendingPhotoFiles(remainingFiles)

      if (nextFile) {
        startCropForFile(nextFile)
      } else {
        setPhotoInputKey((currentKey) => currentKey + 1)
        setSuccessMessage('Foto adicionada com sucesso.')
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  async function handleSetMainPhoto(photoId: number) {
    setErrorMessage('')
    setSuccessMessage('')
    setPhotoActionId(photoId)

    try {
      const updatedPhotos = await Promise.all(
        photos.map((photo) =>
          patchAnimalPhoto(photo.id, {
            isMain: photo.id === photoId ? 'Y' : 'N',
          }),
        ),
      )

      setPhotos(updatedPhotos)
      setSuccessMessage('Foto principal atualizada.')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setPhotoActionId(null)
    }
  }

  async function handleDeletePhoto(photo: AnimalPhotoResponse) {
    if (photos.length === 1) {
      setErrorMessage('O animal precisa manter pelo menos uma foto.')
      return
    }

    const shouldDelete = window.confirm('Deseja remover esta foto?')

    if (!shouldDelete) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')
    setPhotoActionId(photo.id)

    try {
      await deleteAnimalPhoto(photo.id)
      const remainingPhotos = photos.filter(
        (currentPhoto) => currentPhoto.id !== photo.id,
      )

      if (photo.isMain === 'Y' && remainingPhotos[0]) {
        const newMainPhoto = await patchAnimalPhoto(remainingPhotos[0].id, {
          isMain: 'Y',
        })

        setPhotos(
          remainingPhotos.map((currentPhoto) =>
            currentPhoto.id === newMainPhoto.id ? newMainPhoto : currentPhoto,
          ),
        )
      } else {
        setPhotos(remainingPhotos)
      }

      setSuccessMessage('Foto removida com sucesso.')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setPhotoActionId(null)
    }
  }

  if (isLoading) {
    return (
      <section className="page">
        <p>Carregando animal...</p>
      </section>
    )
  }

  return (
    <section className="auth-page auth-page--wide">
      <div className="auth-copy">
        <p className="eyebrow">Animais</p>
        <h1>Editar animal</h1>
        <p>Atualize as informacoes principais do animal cadastrado.</p>
      </div>

      <form className="form-panel" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="animalName">Nome</label>
            <input
              id="animalName"
              type="text"
              value={form.animalName}
              onChange={(event) =>
                updateField('animalName', event.target.value)
              }
              required
              maxLength={100}
            />
          </div>

          <div className="form-field">
            <label htmlFor="species">Especie</label>
            <input
              id="species"
              type="text"
              value={form.species}
              onChange={(event) => updateField('species', event.target.value)}
              required
              maxLength={50}
            />
          </div>

          <div className="form-field">
            <label htmlFor="breed">Raca</label>
            <input
              id="breed"
              type="text"
              value={form.breed}
              onChange={(event) => updateField('breed', event.target.value)}
              maxLength={100}
            />
          </div>

          <div className="form-field">
            <label htmlFor="birthDate">Data de nascimento</label>
            <input
              id="birthDate"
              type="date"
              value={form.birthDate}
              onChange={(event) => updateField('birthDate', event.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="ageValue">Idade</label>
            <input
              id="ageValue"
              type="number"
              value={form.ageValue}
              onChange={(event) => updateField('ageValue', event.target.value)}
              min={0}
            />
          </div>

          <div className="form-field">
            <label htmlFor="ageUnit">Unidade da idade</label>
            <select
              id="ageUnit"
              value={form.ageUnit}
              onChange={(event) => updateField('ageUnit', event.target.value)}
            >
              <option value="">Selecione</option>
              <option value="MONTHS">Meses</option>
              <option value="YEARS">Anos</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="animalSize">Porte</label>
            <select
              id="animalSize"
              value={form.animalSize}
              onChange={(event) =>
                updateField('animalSize', event.target.value)
              }
            >
              <option value="">Selecione</option>
              <option value="SMALL">Pequeno</option>
              <option value="MEDIUM">Medio</option>
              <option value="LARGE">Grande</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="sex">Sexo</label>
            <select
              id="sex"
              value={form.sex}
              onChange={(event) => updateField('sex', event.target.value)}
            >
              <option value="">Selecione</option>
              <option value="F">Femea</option>
              <option value="M">Macho</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="weightKg">Peso em kg</label>
            <input
              id="weightKg"
              type="number"
              value={form.weightKg}
              onChange={(event) => updateField('weightKg', event.target.value)}
              min={0}
              step="0.01"
            />
          </div>

          <div className="form-field">
            <label htmlFor="vaccinated">Vacinado</label>
            <select
              id="vaccinated"
              value={form.vaccinated}
              onChange={(event) => updateField('vaccinated', event.target.value)}
              required
            >
              <option value="">Selecione</option>
              <option value="Y">Sim</option>
              <option value="N">Nao</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="neutered">Castrado</label>
            <select
              id="neutered"
              value={form.neutered}
              onChange={(event) => updateField('neutered', event.target.value)}
              required
            >
              <option value="">Selecione</option>
              <option value="Y">Sim</option>
              <option value="N">Nao</option>
            </select>
          </div>

          <div className="form-field form-field--full">
            <label htmlFor="description">Descricao</label>
            <textarea
              id="description"
              value={form.description}
              onChange={(event) =>
                updateField('description', event.target.value)
              }
              maxLength={500}
              rows={4}
            />
          </div>
        </div>

        <div className="photo-manager">
          <div>
            <h2>Fotos do animal</h2>
            <p>Adicione fotos e escolha qual delas aparece como principal.</p>
          </div>

          {photos.length > 0 && (
            <div className="photo-gallery">
              {photos.map((photo) => (
                <article className="photo-gallery__item" key={photo.id}>
                  <img src={photo.photoUrl} alt="Foto do animal" />
                  <div>
                    <span>{photo.isMain === 'Y' ? 'Principal' : 'Extra'}</span>
                    <div className="actions">
                      {photo.isMain !== 'Y' && (
                        <button
                          className="button button--secondary"
                          type="button"
                          disabled={photoActionId === photo.id}
                          onClick={() => handleSetMainPhoto(photo.id)}
                        >
                          Tornar principal
                        </button>
                      )}
                      <button
                        className="button button--danger"
                        type="button"
                        disabled={photoActionId === photo.id}
                        onClick={() => handleDeletePhoto(photo)}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="newPhotos">Adicionar fotos</label>
            <input
              key={photoInputKey}
              id="newPhotos"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => handlePhotoChange(event.target.files)}
            />
          </div>

          {isCroppingPhoto && photoPreviewUrl && (
            <ImageCropper
              imageSrc={photoPreviewUrl}
              onCancel={handleCropCancel}
              onConfirm={handleCropConfirm}
            />
          )}
        </div>

        {errorMessage && <p className="form-error">{errorMessage}</p>}
        {successMessage && <p className="form-success">{successMessage}</p>}

        <div className="actions">
          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar alteracoes'}
          </button>
          <Link className="button button--secondary" to="/my-animals">
            Voltar
          </Link>
        </div>
      </form>
    </section>
  )
}
