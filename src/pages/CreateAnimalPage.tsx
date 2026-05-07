import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Area } from 'react-easy-crop'
import { Link } from 'react-router-dom'
import { ImageCropper } from '../components/ImageCropper'
import { uploadAnimalPhoto } from '../services/animalPhotoService'
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
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [pendingPhotoFiles, setPendingPhotoFiles] = useState<File[]>([])
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

    if (isCroppingPhoto) {
      return 'Confirme o recorte da foto antes de cadastrar.'
    }

    if (photoFiles.length === 0) {
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

  function handlePhotoChange(files: FileList | null) {
    setErrorMessage('')

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

  function clearCurrentCrop() {
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl)
    }

    setOriginalPhotoName('')
    setPhotoPreviewUrl('')
    setIsCroppingPhoto(false)
  }

  function clearPhotoSelection() {
    clearCurrentCrop()
    setPhotoFiles([])
    setPendingPhotoFiles([])
    setPhotoInputKey((currentKey) => currentKey + 1)
  }

  async function handleCropConfirm(croppedAreaPixels: Area) {
    try {
      const croppedFile = await createCroppedImageFile(
        photoPreviewUrl,
        croppedAreaPixels,
        originalPhotoName || 'animal-photo.jpg',
      )

      setPhotoFiles((currentPhotoFiles) => [...currentPhotoFiles, croppedFile])
      clearCurrentCrop()

      const [nextFile, ...remainingFiles] = pendingPhotoFiles
      setPendingPhotoFiles(remainingFiles)

      if (nextFile) {
        startCropForFile(nextFile)
      } else {
        setPhotoInputKey((currentKey) => currentKey + 1)
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  function handleRemovePhoto(indexToRemove: number) {
    setPhotoFiles((currentPhotoFiles) =>
      currentPhotoFiles.filter((_, index) => index !== indexToRemove),
    )
  }

  function handleCropCancel() {
    clearCurrentCrop()
    setPendingPhotoFiles([])
    setPhotoInputKey((currentKey) => currentKey + 1)
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
    let createdAnimal: AnimalResponse | null = null

    try {
      if (photoFiles.length === 0) {
        throw new Error('Envie uma foto principal do animal.')
      }

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

      for (const [index, photoFile] of photoFiles.entries()) {
        await uploadAnimalPhoto(
          createdAnimal.id,
          photoFile,
          index === 0 ? 'Y' : 'N',
        )
      }

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
              multiple
              onChange={(event) => handlePhotoChange(event.target.files)}
            />
            {photoFiles.length > 0 && (
              <div className="selected-photos">
                {photoFiles.map((file, index) => (
                  <div className="selected-photos__item" key={`${file.name}-${index}`}>
                    <span>
                      {index === 0 ? 'Principal' : `Foto ${index + 1}`}: {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      disabled={isSubmitting}
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
            {isCroppingPhoto && photoPreviewUrl && (
              <ImageCropper
                imageSrc={photoPreviewUrl}
                onCancel={handleCropCancel}
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
