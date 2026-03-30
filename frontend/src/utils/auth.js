export const getUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const getToken = () => localStorage.getItem('token')

export const login = (token, user) => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const isLoggedIn = () => !!localStorage.getItem('token')