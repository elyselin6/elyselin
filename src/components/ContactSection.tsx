import { useState, type FormEvent } from 'react'
import './ContactSection.css'

const CONTACT_EMAIL =
  import.meta.env.VITE_CONTACT_EMAIL || 'elyselin@wharton.upenn.edu'

export default function ContactSection() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!CONTACT_EMAIL) {
      setStatus('error')
      return
    }

    setStatus('submitting')
    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          message: formData.get('message'),
          _subject: 'New message from elyse-lin.com',
        }),
      })

      if (!response.ok) throw new Error('Submission failed')

      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="contact-section">
      <h2 className="section-heading contact-section__heading">Contact Me</h2>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label className="contact-form__field">
          <span>Name</span>
          <input type="text" name="name" required autoComplete="name" placeholder="Your name" />
        </label>

        <label className="contact-form__field">
          <span>Email</span>
          <input type="email" name="email" required autoComplete="email" placeholder="you@example.com" />
        </label>

        <label className="contact-form__field">
          <span>Message</span>
          <textarea name="message" required rows={5} placeholder="Describe your dream project" />
        </label>

        <button type="submit" className="contact-form__submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending...' : 'Send Message'}
        </button>

        {status === 'success' && (
          <p className="contact-form__feedback contact-form__feedback--success">
            Message sent — I&apos;ll get back to you soon.
          </p>
        )}
        {status === 'error' && (
          <p className="contact-form__feedback contact-form__feedback--error">
            Something went wrong. Please try again.
          </p>
        )}
      </form>
    </div>
  )
}
