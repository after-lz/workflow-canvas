export interface AuthUser {
  id: number
  name: string
  email: string
  points: number
  has_api_key: boolean
  created_at: string
}

export interface LoginResult {
  access_token: string
  token_type: string
  expires_in: number
  user: AuthUser
}
