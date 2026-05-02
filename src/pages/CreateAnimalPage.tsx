import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Area } from 'react-easy-crop'
import { Link } from 'react-router-dom'
import { ImageCropper } from '../components/ImageCropper'
import { createAnimalPhoto } from '../services/animalPhotoService'
import {
  removeUploadedAnimalPhoto,
  uploadAnimalPhoto,
} from '../services/animalPhotoUploadService'
import { createAnimal, deleteAnimal } from '../services/animalService'
import type { AgeUnit, AnimalResponse, AnimalSex, YesNo } from '../types'
import { createCroppedImageFile } from '../utils/cropImage'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

const acceptedPhotoTypes = ['image/jpeg', 'image/png', 'image/webp']
const maxPhotoSizeInBytes = 4 * 1024 * 1024

type CreateAnimalFormState = {
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

const initialFormState: CreateAnimalFormState = {
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

export function CreateAnimalPage() {
  const [form, setForm] = useState(initialFormState)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [originalPhotoName, setOriginalPhotoName] = useState('')
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('')
  const [isCroppingPhoto, setIsCroppingPhoto] = useState(false)
  const [photoInputKey, setPhotoInputKey] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(field: keyof CreateAnimalFormState, value: string) {
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

    if (!photoFile) {
      return 'Envie uma foto principal do animal.'
    }

    if (form.ageValue && Number(form.ageValue) < 0) {
      return 'A idade nao pode ser negativa.'
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

  function handlePhotoChange(file: File | undefined) {
    setErrorMessage('')

    if (!file) {
      setPhotoFile(null)
      setOriginalPhotoName('')
      setPhotoPreviewUrl('')
      setIsCroppingPhoto(false)
      return
    }

    if (!acceptedPhotoTypes.includes(file.type)) {
      setPhotoFile(null)
      setPhotoInputKey((currentKey) => currentKey + 1)
      setErrorMessage('Envie uma imagem JPG, PNG ou WEBP.')
      return
    }

    if (file.size > maxPhotoSizeInBytes) {
      setPhotoFile(null)
      setPhotoInputKey((currentKey) => currentKey + 1)
      setErrorMessage('A foto deve ter no maximo 4 MB.')
      return
    }

    setPhotoFile(null)
    setOriginalPhotoName(file.name)
    setPhotoPreviewUrl(URL.createObjectURL(file))
    setIsCroppingPhoto(true)
  }

  function clearPhotoSelection() {
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl)
    }

    setPhotoFile(null)
    setOriginalPhotoName('')
    setPhotoPreviewUrl('')
    setIsCroppingPhoto(false)
    setPhotoInputKey((currentKey) => currentKey + 1)
  }

  async function handleCropConfirm(croppedAreaPixels: Area) {
    try {
      const croppedFile = await createCroppedImageFile(
        photoPreviewUrl,
        croppedAreaPixels,
        originalPhotoName || 'animal-photo.jpg',
      )

      setPhotoFile(croppedFile)
      setIsCroppingPhoto(false)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
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
    let uploadedPhotoPath: string | null = null
    let createdAnimal: AnimalResponse | null = null

    try {
      if (!photoFile) {
        throw new Error('Envie uma foto principal do animal.')
      }

      const uploadedPhoto = await uploadAnimalPhoto(photoFile)
      uploadedPhotoPath = uploadedPhoto.filePath

      createdAnimal = await createAnimal({
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

      await createAnimalPhoto({
        animalId: createdAnimal.id,
        photoUrl: uploadedPhoto.publicUrl,
        isMain: 'Y',
      })

      setForm(initialFormState)
      clearPhotoSelection()
      setSuccessMessage('Animal cadastrado com sucesso.')
    } catch (error) {
      if (createdAnimal) {
        try {
          await deleteAnimal(createdAnimal.id)
        } catch {
          setErrorMessage(
            'Nao foi possivel salvar a foto do animal. O animal foi criado, mas nao conseguimos remove-lo automaticamente.',
          )
          return
        }
      }

      if (uploadedPhotoPath) {
        try {
          await removeUploadedAnimalPhoto(uploadedPhotoPath)
        } catch {
          // If cleanup fails, the user-facing error below is still the main action failure.
        }
      }

      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-page auth-page--wide">
      <div className="auth-copy">
        <p className="eyebrow">Animais</p>
        <h1>Cadastrar animal</h1>
        <p>
          Cadastre as informacoes principais do animal para que ele apareca na
          listagem de disponiveis.
        </p>
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
              placeholder="Mel"
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
              placeholder="Dog"
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
              placeholder="Labrador"
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
              placeholder="6"
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
              placeholder="12.5"
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
              placeholder="Animal tranquilo, sociavel e acostumado com criancas."
              maxLength={500}
              rows={4}
            />
          </div>

          <div className="form-field form-field--full">
            <label htmlFor="photo">Foto principal</label>
            <input
              key={photoInputKey}
              id="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => handlePhotoChange(event.target.files?.[0])}
              required
            />
            {photoFile && (
              <p className="field-hint">
                Foto recortada pronta: {photoFile.name}
              </p>
            )}
            {isCroppingPhoto && photoPreviewUrl && (
              <ImageCropper
                imageSrc={photoPreviewUrl}
                onCancel={clearPhotoSelection}
                onConfirm={handleCropConfirm}
              />
            )}
          </div>
        </div>

        {errorMessage && <p className="form-error">{errorMessage}</p>}
        {successMessage && <p className="form-success">{successMessage}</p>}

        <div className="actions">
          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Cadastrando animal...' : 'Cadastrar animal'}
          </button>
          <Link className="button button--secondary" to="/animals">
            Ver animais
          </Link>
        </div>
      </form>
    </section>
  )
}
