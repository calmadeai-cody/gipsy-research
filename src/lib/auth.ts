import { PrismaAdapter } from '@auth/prisma-adapter'
import { NextAuthOptions } from 'next-auth'
import { Resend } from 'resend'
import EmailProvider from 'next-auth/providers/email'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './prisma'

const resend = new Resend(process.env.AUTH_RESEND_KEY)

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || 'smtp.resend.com',
        port: Number(process.env.EMAIL_SERVER_PORT) || 587,
        auth: {
          user: 'resend',
          pass: process.env.AUTH_RESEND_KEY,
        },
      },
      from: 'GipsyAI <noreply@gipsyai.com>',
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const { error } = await resend.emails.send({
          from: 'GipsyAI <noreply@gipsyai.com>',
          to: identifier,
          subject: 'Masuk ke GipsyAI',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #8B5CF6;">GipsyAI</h1>
              <p>Halo!</p>
              <p>Klik tombol di bawah untuk masuk ke akun GipsyAI kamu:</p>
              <a href="${url}" style="display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Masuk ke GipsyAI</a>
              <p>Atau salin link ini: <br/><a href="${url}">${url}</a></p>
              <p style="color: #666; font-size: 12px;">Link ini akan kedaluwarsa dalam 24 jam.</p>
            </div>
          `,
        })
        if (error) {
          console.error('Failed to send email:', error)
          throw new Error('Gagal mengirim email')
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // Get subscription
        const subscription = await prisma.subscription.findUnique({
          where: { userId: user.id },
        })
        ;(session.user as any).tier = subscription?.tier || 'FREE'
        ;(session.user as any).subscriptionStatus = subscription?.status || 'inactive'
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
}