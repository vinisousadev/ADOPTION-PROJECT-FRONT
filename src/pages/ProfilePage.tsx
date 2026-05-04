import { useEffect, useRef, useState } from 'react'
import type { Area } from 'react-easy-crop'
import { Link } from 'react-router-dom'
import { ImageCropper } from '../components/ImageCropper'
import { useAuth } from '../contexts/AuthContext'
import { getUserById, uploadUserProfilePhoto } from '../services/userService'
import type { UserResponse } from '../types'
import { createCroppedImageFile } from '../utils/cropImage'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

function formatUserType(userType: string) {
  return userType === 'ADMIN' ? 'Administrador' : 'Usuario comum'
}

function formatOptionalValue(value?: string) {
  return value || 'Nao informado'
}

const MAX_PROFILE_PHOTO_SIZE = 4 * 1024 * 1024
const ALLOWED_PROFILE_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function ProfilePage() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [profile, setProfile] = useState<UserResponse | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [profileNotice, setProfileNotice] = useState('')
  const [photoMessage, setPhotoMessage] = useState('')

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const userResponse = await getUserById(user.userId)
        setProfile(userResponse)
      } catch {
        setProfileNotice(
          'O backend ainda nao permite buscar todos os dados do perfil para usuario comum. Exibindo os dados da sessao.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user])

  useEffect(() => {
    if (!selectedPhoto) {
      setSelectedPhotoPreview('')
      return
    }

    const previewUrl = URL.createObjectURL(selectedPhoto)
    setSelectedPhotoPreview(previewUrl)

    return () => URL.revokeObjectURL(previewUrl)
  }, [selectedPhoto])

  function handleSelectedPhotoChange(file?: File) {
    setPhotoMessage('')

    if (!file) {
      setSelectedPhoto(null)
      return
    }

    if (!ALLOWED_PROFILE_PHOTO_TYPES.includes(file.type)) {
      setPhotoMessage('A foto do perfil deve ser JPG, PNG ou WEBP.')
      return
    }

    if (file.size > MAX_PROFILE_PHOTO_SIZE) {
      setPhotoMessage('A foto do perfil deve ter no maximo 4MB.')
      return
    }

    setSelectedPhoto(file)
  }

  function clearSelectedPhoto() {
    setSelectedPhoto(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleCropConfirm(croppedAreaPixels: Area) {
    if (!selectedPhoto) {
      return
    }

    setIsUploadingPhoto(true)
    setPhotoMessage('')

    try {
      const croppedPhoto = await createCroppedImageFile(
        selectedPhotoPreview,
        croppedAreaPixels,
        selectedPhoto.name || 'profile-photo.jpg',
      )
      const updatedProfile = await uploadUserProfilePhoto(croppedPhoto)

      setProfile(updatedProfile)
      clearSelectedPhoto()
      setPhotoMessage('Foto atualizada com sucesso.')
    } catch (error) {
      setPhotoMessage(getApiErrorMessage(error))
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <section className="page">
        <p>Carregando perfil...</p>
      </section>
    )
  }

  const profileName = profile?.name ?? user.name
  const profileEmail = profile?.email ?? user.email
  const profileUserType = profile?.userType ?? user.userType
  const profilePhotoUrl = profile?.profilePhotoUrl

  return (
    <section className="profile-page">
      <div className="profile-header">
        <div>
          <p className="eyebrow">Meu perfil</p>
          <h1>{profileName}</h1>
          <p>Consulte seus dados de acesso e informacoes cadastradas.</p>
        </div>

        <button
          className="profile-avatar profile-avatar--editable"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Escolher foto do perfil"
        >
          {profilePhotoUrl ? (
            <img src={profilePhotoUrl} alt="" aria-hidden="true" />
          ) : (
            profileName.charAt(0).toUpperCase()
          )}
          <span>Trocar foto</span>
        </button>
        <input
          ref={fileInputRef}
          className="profile-photo-file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) =>
            handleSelectedPhotoChange(event.target.files?.[0])
          }
        />
      </div>

      {profileNotice && <p className="empty-state">{profileNotice}</p>}
      {photoMessage && (
        <p
          className={
            photoMessage.includes('sucesso') ? 'form-success' : 'form-error'
          }
        >
          {photoMessage}
        </p>
      )}

      {selectedPhotoPreview && (
        <div className="modal-backdrop">
          <div className="profile-photo-modal">
            <div className="profile-photo-modal__header">
              <div>
                <h2>Ajustar foto</h2>
                <p>Centralize seu rosto e ajuste o zoom antes de salvar.</p>
              </div>
              <button
                className="terms-modal__close"
                type="button"
                onClick={clearSelectedPhoto}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <ImageCropper
              imageSrc={selectedPhotoPreview}
              aspect={1}
              confirmLabel={isUploadingPhoto ? 'Salvando...' : 'Salvar foto'}
              onCancel={clearSelectedPhoto}
              onConfirm={handleCropConfirm}
            />
          </div>
        </div>
      )}

      <dl className="profile-details">
        <div>
          <dt>Nome</dt>
          <dd>{profileName}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{profileEmail}</dd>
        </div>
        <div>
          <dt>Tipo de usuario</dt>
          <dd>{formatUserType(profileUserType)}</dd>
        </div>
        <div>
          <dt>CPF</dt>
          <dd>{formatOptionalValue(profile?.cpf)}</dd>
        </div>
        <div>
          <dt>Telefone</dt>
          <dd>{formatOptionalValue(profile?.phone)}</dd>
        </div>
        <div>
          <dt>Cidade</dt>
          <dd>{formatOptionalValue(profile?.city)}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>{formatOptionalValue(profile?.state)}</dd>
        </div>
        <div>
          <dt>Cadastro</dt>
          <dd>
            {profile?.registrationDate
              ? new Date(profile.registrationDate).toLocaleDateString('pt-BR')
              : 'Nao informado'}
          </dd>
        </div>
      </dl>

      <div className="actions">
        <Link className="button" to="/my-animals">
          Meus animais
        </Link>
        <Link className="button button--secondary" to="/my-adoption-requests">
          Meus pedidos
        </Link>
      </div>
    </section>
  )
}
