export type UserType = 'COMMON' | 'ADMIN'

export type CreateUserRequest = {
  name: string
  cpf: string
  phone?: string
  email: string
  city?: string
  state?: string
  passwordHash: string
}

export type UserResponse = {
  id: number
  name: string
  cpf: string
  phone?: string
  email: string
  city?: string
  state?: string
  registrationDate: string
  userType: UserType
}
