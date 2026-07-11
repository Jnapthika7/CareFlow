import express from 'express'
import { customers } from '../data/customers.js'
import { authenticateToken } from '../middleware/auth.js'
import { sendEmail } from '../lib/email.js'

const router = express.Router()
router.use(authenticateToken)

router.get('/', (req, res) => {
  res.json(customers)
})

router.post('/', async (req, res) => {
  const { name, email, status, priority, notes } = req.body
  const validText = (value) => /[^\s.]/.test(value)
  if (!validText(name) || !validText(notes)) {
    return res.status(400).json({ message: 'Issue title and details are required' })
  }

  const newCustomer = {
    id: Date.now(),
    name,
    email: email || req.user.email,
    status: status || 'Open',
    priority: priority || 'Medium',
    notes: notes || '',
    submittedBy: req.user.email
  }

  customers.unshift(newCustomer)

  const emailBody = `Hello ${newCustomer.name},\n\nYour ticket has been received successfully.\n\nTicket details:\n- Title: ${newCustomer.name}\n- Priority: ${newCustomer.priority}\n- Description: ${newCustomer.notes}\n\nWe will notify you once it is reviewed by our team.\n\nThank you,\nCare Flow Support Team`

  const emailResult = await sendEmail({
    to: newCustomer.email,
    subject: 'Support Ticket Received',
    text: emailBody
  })

  const emailSent = !!(emailResult && emailResult.success)
  const emailPreview = emailResult && emailResult.previewUrl ? emailResult.previewUrl : null

  res.status(201).json({ ticket: newCustomer, emailSent, emailPreview })
})

router.patch('/:id/accept', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can accept tickets' })
  }

  const ticket = customers.find((item) => item.id === Number(req.params.id))
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' })
  }

  ticket.status = 'Accepted'

  const emailBody = `Hello ${ticket.name},\n\nYour support ticket has been accepted by our team.\n\nTicket details:\n- Title: ${ticket.name}\n- Priority: ${ticket.priority}\n- Description: ${ticket.notes}\n- Status: ${ticket.status}\n\nWe will follow up shortly with the next steps.\n\nThank you,\nCare Flow Support Team`

  const emailResult = await sendEmail({
    to: ticket.email,
    subject: 'Support Ticket Accepted',
    text: emailBody
  })

  const emailSent = !!(emailResult && emailResult.success)
  const emailPreview = emailResult && emailResult.previewUrl ? emailResult.previewUrl : null

  res.json({ ticket, emailSent, emailPreview })
})

router.patch('/:id/reject', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can reject tickets' })
  }

  const ticket = customers.find((item) => item.id === Number(req.params.id))
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' })
  }

  ticket.status = 'Rejected'

  const emailBody = `Hello ${ticket.name},\n\nYour support ticket has been reviewed and rejected by our team.\n\nTicket details:\n- Title: ${ticket.name}\n- Priority: ${ticket.priority}\n- Description: ${ticket.notes}\n- Status: ${ticket.status}\n\nIf you need more help, please submit a new ticket.\n\nThank you,\nCare Flow Support Team`

  const emailResult = await sendEmail({
    to: ticket.email,
    subject: 'Support Ticket Rejected',
    text: emailBody
  })

  const emailSent = !!(emailResult && emailResult.success)
  const emailPreview = emailResult && emailResult.previewUrl ? emailResult.previewUrl : null

  res.json({ ticket, emailSent, emailPreview })
})

router.delete('/:id', async (req, res) => {
  const ticketId = Number(req.params.id)
  const ticketIndex = customers.findIndex((item) => item.id === ticketId)
  if (ticketIndex === -1) {
    return res.status(404).json({ message: 'Ticket not found' })
  }

  const ticket = customers[ticketIndex]
  // only owner or admin can delete
  if (req.user.role !== 'admin' && ticket.submittedBy !== req.user.email) {
    return res.status(403).json({ message: 'Not allowed to delete this ticket' })
  }

  customers.splice(ticketIndex, 1)
  res.json({ success: true, id: ticketId })
})

export default router
