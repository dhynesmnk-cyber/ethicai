'use client'

import { type FormEvent, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

// Netlify Forms (BUILD-SPEC §5.7). Netlify only detects forms in static HTML, so the form is
// declared in public/__forms.html and this one posts to that file. Without JavaScript it's a
// plain POST (Netlify then shows /contact/thanks). With JavaScript it validates inline and
// submits in the background.

type Field = 'name' | 'email' | 'message'
type Errors = Partial<Record<Field, string>>
type Status = 'idle' | 'sending' | 'sent' | 'error'

const FORM_ENDPOINT = '/__forms.html'
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(data: FormData): Errors {
  const errors: Errors = {}
  const value = (field: Field) => String(data.get(field) ?? '').trim()
  if (!value('name')) errors.name = 'Enter your name.'
  if (!value('email')) errors.email = 'Enter your email address.'
  else if (!EMAIL.test(value('email')))
    errors.email = 'Enter an email address like name@example.com.'
  if (!value('message')) errors.message = 'Enter a message.'
  return errors
}

const control =
  'w-full rounded-lg border bg-surface px-4 py-3 text-base text-ink placeholder:text-muted aria-invalid:border-danger'

export function ContactForm({ contactEmail }: { contactEmail?: string | null }) {
  const form = useRef<HTMLFormElement>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')

  // Native validation stays on for anyone without JavaScript; once hydrated we show our own.
  useEffect(() => {
    if (form.current) form.current.noValidate = true
  }, [])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const target = event.currentTarget
    const data = new FormData(target)
    const found = validate(data)
    setErrors(found)
    const firstInvalid = (['name', 'email', 'message'] as const).find((field) => found[field])
    if (firstInvalid) {
      target.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus()
      return
    }

    setStatus('sending')
    try {
      const body = new URLSearchParams(
        [...data.entries()].map(([key, value]) => [key, String(value)]),
      ).toString()
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      })
      if (!response.ok) throw new Error(`Form submission failed: ${response.status}`)
      target.reset()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div role="status" className="rounded-card border border-accent bg-accent-tint p-6 sm:p-8">
        <h2 className="text-2xl">Thanks for getting in touch</h2>
        <p className="mt-2">Your message is on its way. We’ll be in touch soon.</p>
      </div>
    )
  }

  const describedBy = (field: Field) => (errors[field] ? `${field}-error` : undefined)
  const fieldError = (field: Field) =>
    errors[field] ? (
      <p id={`${field}-error`} className="mt-2 text-sm text-danger">
        {errors[field]}
      </p>
    ) : null

  return (
    <form
      ref={form}
      name="contact"
      method="POST"
      action={FORM_ENDPOINT}
      onSubmit={onSubmit}
      className="space-y-6"
    >
      <input type="hidden" name="form-name" value="contact" />
      {/* Honeypot: hidden from people, tempting to bots. Netlify drops submissions that fill it. */}
      <p className="hidden">
        <label>
          Leave this empty: <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </p>

      <div>
        <label htmlFor="contact-name" className="mb-2 block font-medium">
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          autoComplete="name"
          required
          aria-invalid={Boolean(errors.name)}
          aria-describedby={describedBy('name')}
          className={cn(control, 'border-line-strong')}
        />
        {fieldError('name')}
      </div>

      <div>
        <label htmlFor="contact-email" className="mb-2 block font-medium">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(errors.email)}
          aria-describedby={describedBy('email')}
          className={cn(control, 'border-line-strong')}
        />
        {fieldError('email')}
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-2 block font-medium">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy('message')}
          className={cn(control, 'border-line-strong')}
        />
        {fieldError('message')}
      </div>

      {status === 'error' && (
        <p role="alert" className="rounded-lg border border-danger px-4 py-3 text-danger">
          Sorry, your message didn’t send. Please try again
          {contactEmail ? (
            <>
              , or email us at{' '}
              <a href={`mailto:${contactEmail}`} className="underline">
                {contactEmail}
              </a>
            </>
          ) : null}
          .
        </p>
      )}

      <Button type="submit" size="lg" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  )
}
