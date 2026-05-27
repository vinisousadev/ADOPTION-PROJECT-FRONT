export type UserType = 'COMMON' | 'ADMIN'
export type UserRoleLabel = 'ONG' | 'PROTETOR'

export type CreateUserRequest = {
  name: string
  cpf?: string
  phone?: string
  email: string
  city?: string
  state?: string
  passwordHash: string
  roleLabel?: UserRoleLabel
}

export type UserResponse = {
  id: number
  name: string
  cpf?: string
  phone?: string
  email: string
  city?: string
  state?: string
  profilePhotoUrl?: string
  registrationDate: string
  roleLabel: UserRoleLabel
  userType: UserType
}
