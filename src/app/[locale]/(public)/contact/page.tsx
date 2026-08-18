'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Clock,
  FileText,
  Github,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLocale, useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import styles from './contact.module.css'

function createContactSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(2, t('nameMin')),
    email: z.string().email(t('emailInvalid')),
    whatsapp: z.string().min(10, t('whatsappMin')),
    subject: z.string().min(5, t('subjectMin')),
    message: z.string().min(10, t('messageMin')),
  })
}

type ContactFormData = z.infer<ReturnType<typeof createContactSchema>>

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null

  return (
    <p className={styles.error} id={id} role="alert">
      {message}
    </p>
  )
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const locale = useLocale()
  const t = useTranslations('contact')
  const tVal = useTranslations('validation.contact')
  const isEnglish = locale === 'en'
  const contactSchema = useMemo(() => createContactSchema(tVal), [tVal])
  const contactInfo = useMemo(
    () => [
      {
        icon: Mail,
        label: t('info.email'),
        value: 'contato@maiainteligencia.com',
        href: 'mailto:contato@maiainteligencia.com',
      },
      {
        icon: Github,
        label: 'GitHub',
        value: '@jonhmaia',
        href: 'https://github.com/jonhmaia',
      },
      {
        icon: Linkedin,
        label: 'LinkedIn',
        value: '/in/joaomarcosmaia',
        href: 'https://www.linkedin.com/in/joaomarcosmaia',
      },
      {
        icon: MapPin,
        label: t('info.location'),
        value: t('info.locationValue'),
        href: null,
      },
    ],
    [t]
  )
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      whatsapp: '',
      subject: '',
      message: '',
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          whatsapp: data.whatsapp,
          subject: data.subject,
          message: data.message,
          locale,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar formulário')
      }

      toast.success(t('toast.success'))
      form.reset()
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error(t('toast.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <div className={styles.eyebrow}>
            {isEnglish ? 'Direct channel / No middlemen' : 'Canal direto / Sem intermediários'}
          </div>

          <h1 className={styles.heroTitle} aria-label={`${t('title')} — ${isEnglish ? 'Start something real' : 'Comece algo real'}`}>
            <span>{t('title')}</span>
            <span className={styles.heroTitleOutline} aria-hidden="true">
              {isEnglish ? 'Start something real' : 'Comece algo real'}
            </span>
          </h1>

          <div className={styles.heroMeta}>
            <span>GOIÂNIA / BR</span>
            <span className={styles.heroMetaLine} aria-hidden="true" />
            <span>UTC−03</span>
          </div>

          <p className={styles.heroCopy}>{t('subtitle')}</p>
        </header>
      </div>

      <section className={styles.paperPanel} aria-labelledby="contact-form-title">
        <div className={`${styles.shell} ${styles.panelGrid}`}>
          <div className={styles.infoColumn}>
            <div className={styles.panelLabel}>{isEnglish ? 'Contact routes' : 'Rotas de contato'}</div>
            <h2 className={styles.infoHeading}>{t('info.title')}</h2>

            <div className={styles.infoList}>
              {contactInfo.map((info) => {
                const accessibleName = `${info.label}: ${info.value}`
                const rowContent = (
                  <>
                    <span className={styles.infoIcon} aria-hidden="true">
                      <info.icon size={17} strokeWidth={1.8} />
                    </span>
                    <span className={styles.infoCopy}>
                      <span className={styles.infoLabel}>{info.label}</span>
                      <span className={styles.infoValue}>{info.value}</span>
                    </span>
                    <span className={styles.infoArrow} aria-hidden="true">
                      {info.href ? '↗' : '—'}
                    </span>
                  </>
                )

                return info.href ? (
                  <a
                    className={styles.infoRow}
                    href={info.href}
                    key={info.label}
                    aria-label={accessibleName}
                    title={info.value}
                    target={info.href.startsWith('http') ? '_blank' : undefined}
                    rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {rowContent}
                  </a>
                ) : (
                  <div className={styles.infoRow} key={info.label} aria-label={accessibleName} title={info.value}>
                    {rowContent}
                  </div>
                )
              })}
            </div>

            <div className={styles.statusGroup}>
              <div className={styles.statusItem}>
                <div className={styles.statusLabel}>
                  <Clock aria-hidden="true" size={12} />
                  {isEnglish ? 'Response time' : 'Tempo de resposta'}
                </div>
                <h3 className={styles.statusTitle}>{t('responseTime.title')}</h3>
                <p className={styles.statusCopy}>{t('responseTime.description')}</p>
              </div>

              <div className={styles.statusItem}>
                <div className={styles.statusLabel}>
                  <span className={styles.statusDot} aria-hidden="true" />
                  STATUS / OPEN
                </div>
                <h3 className={styles.statusTitle}>{t('availability.title')}</h3>
                <p className={styles.statusCopy}>{t('availability.description')}</p>
              </div>
            </div>
          </div>

          <div className={styles.formColumn}>
            <header className={styles.formHeader}>
              <div>
                <h2 className={styles.formTitle} id="contact-form-title">{t('form.title')}</h2>
                <p className={styles.formDescription}>{t('form.description')}</p>
              </div>
              <span className={styles.formIndex}>01 / BRIEF</span>
            </header>

            <form className={styles.form} onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <div className={styles.field}>
                <Label className={styles.fieldLabel} htmlFor="name">01 / {t('form.nameLabel')}</Label>
                <div className={styles.fieldControl}>
                  <User className={styles.fieldIcon} aria-hidden="true" size={16} />
                  <Input
                    className={styles.input}
                    id="name"
                    autoComplete="name"
                    aria-invalid={Boolean(form.formState.errors.name)}
                    aria-describedby={form.formState.errors.name ? 'name-error' : undefined}
                    placeholder={t('form.namePlaceholder')}
                    {...form.register('name')}
                  />
                </div>
                <FieldError id="name-error" message={form.formState.errors.name?.message} />
              </div>

              <div className={styles.field}>
                <Label className={styles.fieldLabel} htmlFor="whatsapp">02 / {t('form.whatsappLabel')}</Label>
                <div className={styles.fieldControl}>
                  <Phone className={styles.fieldIcon} aria-hidden="true" size={16} />
                  <Input
                    className={styles.input}
                    id="whatsapp"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    aria-invalid={Boolean(form.formState.errors.whatsapp)}
                    aria-describedby={form.formState.errors.whatsapp ? 'whatsapp-error' : undefined}
                    placeholder={t('form.whatsappPlaceholder')}
                    {...form.register('whatsapp')}
                  />
                </div>
                <FieldError id="whatsapp-error" message={form.formState.errors.whatsapp?.message} />
              </div>

              <div className={styles.field}>
                <Label className={styles.fieldLabel} htmlFor="email">03 / {t('form.emailLabel')}</Label>
                <div className={styles.fieldControl}>
                  <Mail className={styles.fieldIcon} aria-hidden="true" size={16} />
                  <Input
                    className={styles.input}
                    id="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    aria-invalid={Boolean(form.formState.errors.email)}
                    aria-describedby={form.formState.errors.email ? 'email-error' : undefined}
                    placeholder={t('form.emailPlaceholder')}
                    {...form.register('email')}
                  />
                </div>
                <FieldError id="email-error" message={form.formState.errors.email?.message} />
              </div>

              <div className={styles.field}>
                <Label className={styles.fieldLabel} htmlFor="subject">04 / {t('form.subjectLabel')}</Label>
                <div className={styles.fieldControl}>
                  <FileText className={styles.fieldIcon} aria-hidden="true" size={16} />
                  <Input
                    className={styles.input}
                    id="subject"
                    aria-invalid={Boolean(form.formState.errors.subject)}
                    aria-describedby={form.formState.errors.subject ? 'subject-error' : undefined}
                    placeholder={t('form.subjectPlaceholder')}
                    {...form.register('subject')}
                  />
                </div>
                <FieldError id="subject-error" message={form.formState.errors.subject?.message} />
              </div>

              <div className={`${styles.field} ${styles.fieldWide}`}>
                <Label className={styles.fieldLabel} htmlFor="message">05 / {t('form.messageLabel')}</Label>
                <div className={styles.fieldControl}>
                  <Send className={styles.fieldIcon} aria-hidden="true" size={16} />
                  <Textarea
                    className={styles.textarea}
                    id="message"
                    aria-invalid={Boolean(form.formState.errors.message)}
                    aria-describedby={form.formState.errors.message ? 'message-error' : undefined}
                    placeholder={t('form.messagePlaceholder')}
                    {...form.register('message')}
                  />
                </div>
                <FieldError id="message-error" message={form.formState.errors.message?.message} />
              </div>

              <div className={styles.submitRow}>
                <p className={styles.formNote}>
                  {isEnglish
                    ? 'Your details are used only to reply to this conversation. No newsletter, no noise.'
                    : 'Seus dados serão usados apenas para responder esta conversa. Sem newsletter, sem ruído.'}
                </p>

                <button className={styles.submitButton} type="submit" disabled={isSubmitting} aria-live="polite">
                  <span>
                    {isSubmitting ? t('form.sending') : t('form.submit')}
                    <span className={styles.submitMeta}>{isEnglish ? 'Secure dispatch' : 'Envio seguro'}</span>
                  </span>
                  <span className={styles.submitIcon} aria-hidden="true">
                    {isSubmitting ? <Loader2 className={styles.spinner} size={18} /> : <Send size={18} />}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
