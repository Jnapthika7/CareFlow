import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { users } from '../data/users.js'

const router = express.Router()
const JWT_SECRET = 'customer-registry-secret'
const TOKEN_EXPIRES_IN = '4h'

router.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const existingUser = users.find((user) => user.email === email.toLowerCase())
  if (existingUser) {
    return res.status(409).json({ message: 'Email already registered' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  // Prevent creating new admin accounts via the registration form
  const normalizedRole = 'user'
  const user = {
    id: Date.now(),
    name: name || email,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: normalizedRole
  }
  users.push(user)

  const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN })
  res.status(201).json({ token, email: user.email, name: user.name, role: user.role })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  // Admin special-case: only the single admin credentials open the admin portal
  if (email === 'admin@careflow.com' && password === 'Admin@1234') {
    const adminUser = users.find((u) => u.email === 'admin@careflow.com') || {
      id: 1,
      name: 'Admin',
      email: 'admin@careflow.com',
      role: 'admin'
    }
    const token = jwt.sign({ userId: adminUser.id, email: adminUser.email, role: 'admin' }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN })
    return res.json({ token, email: adminUser.email, name: adminUser.name, role: 'admin' })
  }

  const user = users.find((item) => item.email === email.toLowerCase())
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN })
  res.json({ token, email: user.email, name: user.name, role: user.role })
})

export default router
