import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const smtpHost = process.env.SMTP_HOST
const smtpPort = Number(process.env.SMTP_PORT || 587)
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
const smtpFrom = process.env.SMTP_FROM || 'no-reply@careflow.com'

let transporter = null
let usingTestAccount = false

async function createTransporter() {
  if (smtpHost && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    })
  }

  // Fallback to Ethereal test account for local development
  try {
    const testAccount = await nodemailer.createTestAccount()
    usingTestAccount = true
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    })
  } catch (err) {
    console.error('Failed to create test account for email fallback:', err)
    return null
  }
}

export async function sendEmail({ to, subject, text, html }) {
  if (!transporter) {
    transporter = await createTransporter()
  }

  if (!transporter) {
    console.log('Email not sent: transporter not available.', { to, subject })
    return { success: false }
  }

  try {
    const info = await transporter.sendMail({
      from: smtpFrom,
      to,
      subject,
      text,
      html
    })

    let previewUrl = null
    if (usingTestAccount) {
      previewUrl = nodemailer.getTestMessageUrl(info) || null
      console.log('Ethereal preview URL:', previewUrl)
    }

    console.log('Email sent:', info.messageId)
    return { success: true, previewUrl }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false }
  }
}
