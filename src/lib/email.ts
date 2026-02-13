import nodemailer from 'nodemailer'

export async function sendEmail({ to, subject, text, html }: { to: string, subject: string, text: string, html?: string }) {
    console.log('--- Sending Email (Internal) ---')
    console.log('To:', to)
    console.log('Subject:', subject)

    // For local development, we'll use Ethereal (fake SMTP)
    // This creates a previewable inbox.
    try {
        const testAccount = await nodemailer.createTestAccount()

        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
            tls: {
                rejectUnauthorized: false
            }
        })

        const info = await transporter.sendMail({
            from: '"StocksIt Notification" <noreply@stocksit.com>',
            to,
            subject,
            text,
            html: html || text,
        })

        console.log('Message sent: %s', info.messageId)
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
        console.log('--- Email Queued (Mock) ---')

        return info
    } catch (error) {
        console.error('Error sending mock email:', error)
        // Fallback: just log the content
        console.log('Fallback: [EMAIL CONTENT]', { to, subject, text })
    }
}
