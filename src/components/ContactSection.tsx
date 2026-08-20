import { useState, type ChangeEvent, type FormEvent } from 'react'
import './ContactSection.css'

const CONTACT_EMAIL =
  import.meta.env.VITE_CONTACT_EMAIL || 'elyselin@wharton.upenn.edu'

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024

const INQUIRY_OPTIONS = [
  'Deck Building',
  'Branding',
  'Website',
  'Other',
] as const

export default function ContactSection() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [attachmentName, setAttachmentName] = useState<string | null>(null)
  const [attachmentError, setAttachmentError] = useState<string | null>(null)

  function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      setAttachmentName(null)
      setAttachmentError(null)
      return
    }

    if (file.size > MAX_ATTACHMENT_BYTES) {
      setAttachmentName(null)
      setAttachmentError('File must be 10 MB or smaller.')
      event.target.value = ''
      return
    }

    setAttachmentName(file.name)
    setAttachmentError(null)
  }

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
        },
        body: formData,
      })

      if (!response.ok) throw new Error('Submission failed')

      setStatus('success')
      form.reset()
      setAttachmentName(null)
      setAttachmentError(null)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="contact-section">
      <h2 className="section-heading contact-section__heading">Apply</h2>

      <form className="contact-form" encType="multipart/form-data" onSubmit={handleSubmit}>
        <input type="hidden" name="_subject" value="New message from elyse-lin.com" />

        <label className="contact-form__field">
          <span>Name</span>
          <input type="text" name="name" required autoComplete="name" placeholder="Your name" />
        </label>

        <label className="contact-form__field">
          <span>Email</span>
          <input type="email" name="email" required autoComplete="email" placeholder="you@example.com" />
        </label>

        <fieldset className="contact-form__field contact-form__inquiry">
          <legend>Inquiry</legend>
          <div className="contact-form__checkbox-group">
            {INQUIRY_OPTIONS.map((option) => (
              <label key={option} className="contact-form__checkbox">
                <input type="checkbox" name="inquiry" value={option} />
                <span className="contact-form__checkbox-label">{option}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="contact-form__field">
          <span>Attachment</span>
          <label className="contact-form__file">
            <input
              type="file"
              name="attachment"
              className="contact-form__file-input"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.zip"
              onChange={handleAttachmentChange}
            />
            <span className="contact-form__file-button">Choose file</span>
            <span className="contact-form__file-name">
              {attachmentName ?? 'Optional—pitch deck, brief, etc.'}
            </span>
          </label>
          {attachmentError && (
            <p className="contact-form__file-error">{attachmentError}</p>
          )}
        </div>

        <label className="contact-form__field">
          <span>Message</span>
          <textarea
            name="message"
            required
            rows={5}
            placeholder="Describe your project scope and timeline"
          />
        </label>

        <button
          type="submit"
          className="contact-form__submit"
          disabled={status === 'submitting' || attachmentError !== null}
        >
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
