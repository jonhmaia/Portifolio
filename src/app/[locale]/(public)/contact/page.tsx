'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Github, Linkedin, Mail, MapPin, Send, Loader2, MessageSquare, Clock, Phone, User, FileText, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

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


export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const locale = useLocale()
  const t = useTranslations('contact')
  const tVal = useTranslations('validation.contact')

  const contactSchema = useMemo(() => createContactSchema(tVal), [locale, tVal])

  const contactInfo = useMemo(
    () => [
      {
        icon: Mail,
        label: t('info.email'),
        value: 'contato@maiainteligencia.com',
        href: 'mailto:contato@maiainteligencia.com',
        color: 'text-[#00ffcc]',
        bg: 'bg-[#00ffcc]/10',
      },
      {
        icon: Github,
        label: 'GitHub',
        value: '@jonhmaia',
        href: 'https://github.com/jonhmaia',
        color: 'text-foreground dark:text-white',
        bg: 'bg-muted dark:bg-white/10',
      },
      {
        icon: Linkedin,
        label: 'LinkedIn',
        value: '/in/joaomarcosmaia',
        href: 'https://www.linkedin.com/in/joaomarcosmaia',
        color: 'text-[#0077b5]',
        bg: 'bg-[#0077b5]/20',
      },
      {
        icon: MapPin,
        label: t('info.location'),
        value: t('info.locationValue'),
        href: null,
        color: 'text-red-500',
        bg: 'bg-red-500/10',
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
          locale: locale,
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
    <div className="relative min-h-[calc(100vh-80px)] py-16 md:py-24 flex flex-col justify-center">
      <div className="container relative z-10 animate-in fade-in duration-500 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-card backdrop-blur-xl shadow-2xl border border-border/50 rounded-3xl p-6 sm:p-10 md:p-16 text-card-foreground">
          {/* Header */}
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-foreground dark:text-white uppercase drop-shadow-lg">{t('title')}</h1>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed font-light">
              {t('subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Contact Info Column */}
            <div className="lg:col-span-5 flex flex-col gap-10">
              <div className="space-y-8">
                <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                  <User className="h-6 w-6 text-[#00ffcc]" />
                  <h2 className="text-2xl font-semibold text-foreground dark:text-white">{t('info.title')}</h2>
                </div>
                
                <div className="space-y-6">
                  {contactInfo.map((info) => (
                    <div key={info.label} className="group flex items-center gap-5 p-2 -ml-2 rounded-xl hover:bg-muted/50 dark:hover:bg-white/5 transition-colors">
                      <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 shadow-inner", info.bg)}>
                        <info.icon className={cn("h-6 w-6 drop-shadow-md", info.color)} />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-xs font-semibold text-muted-foreground dark:text-white/50 uppercase tracking-widest mb-1">{info.label}</p>
                        {info.href ? (
                          <a
                            href={info.href}
                            target={info.href.startsWith('http') ? '_blank' : undefined}
                            rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="text-base font-medium text-foreground dark:text-white hover:text-primary dark:hover:text-[#00ffcc] transition-colors"
                          >
                            {info.value}
                          </a>
                        ) : (
                          <p className="text-base font-medium text-foreground dark:text-white">{info.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 pt-4">
                <div className="bg-muted/50 dark:bg-white/5 border border-border/50 dark:border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00ffcc]/10 mb-4">
                    <Clock className="h-5 w-5 text-[#00ffcc]" />
                  </div>
                  <p className="font-semibold mb-2 text-foreground dark:text-white text-sm">{t('responseTime.title')}</p>
                  <p className="text-xs text-muted-foreground dark:text-white/60 leading-relaxed">
                    {t('responseTime.description')}
                  </p>
                </div>

                <div className="bg-muted/50 dark:bg-white/5 border border-border/50 dark:border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4 h-10">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ffcc] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00ffcc]"></span>
                    </span>
                    <span className="text-xs font-mono text-[#00ffcc] uppercase tracking-wider font-bold">Status</span>
                  </div>
                  <p className="font-semibold mb-2 text-foreground dark:text-white text-sm">{t('availability.title')}</p>
                  <p className="text-xs text-muted-foreground dark:text-white/60 leading-relaxed">
                    {t('availability.description')}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form Column */}
            <div className="lg:col-span-7">
              <div className="bg-card border border-border/50 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 p-32 bg-[#00ffcc]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <div className="mb-8 relative">
                  <h3 className="text-3xl font-bold text-foreground dark:text-white mb-2">{t('form.title')}</h3>
                  <p className="text-muted-foreground dark:text-white/60 font-light">
                    {t('form.description')}
                  </p>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-foreground dark:text-white/90 ml-1">{t('form.nameLabel')}</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-white/40" />
                        <Input
                          id="name"
                          className="pl-11 h-12 bg-background dark:bg-black/40 border-border dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground/50 dark:placeholder:text-white/30 rounded-xl focus-visible:ring-[#00ffcc] focus-visible:border-[#00ffcc]"
                          {...form.register('name')}
                          placeholder={t('form.namePlaceholder')}
                        />
                      </div>
                      {form.formState.errors.name && (
                        <p className="text-xs text-red-400 flex items-center gap-1.5 ml-1 mt-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
                          {form.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp" className="text-sm font-medium text-foreground dark:text-white/90 ml-1">{t('form.whatsappLabel')}</Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-white/40" />
                        <Input
                          id="whatsapp"
                          type="tel"
                          className="pl-11 h-12 bg-background dark:bg-black/40 border-border dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground/50 dark:placeholder:text-white/30 rounded-xl focus-visible:ring-[#00ffcc] focus-visible:border-[#00ffcc]"
                          {...form.register('whatsapp')}
                          placeholder={t('form.whatsappPlaceholder')}
                        />
                      </div>
                      {form.formState.errors.whatsapp && (
                        <p className="text-xs text-red-400 flex items-center gap-1.5 ml-1 mt-1">
                           <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
                          {form.formState.errors.whatsapp.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground dark:text-white/90 ml-1">{t('form.emailLabel')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-white/40" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-11 h-12 bg-background dark:bg-black/40 border-border dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground/50 dark:placeholder:text-white/30 rounded-xl focus-visible:ring-[#00ffcc] focus-visible:border-[#00ffcc]"
                        {...form.register('email')}
                        placeholder={t('form.emailPlaceholder')}
                      />
                    </div>
                    {form.formState.errors.email && (
                      <p className="text-xs text-red-400 flex items-center gap-1.5 ml-1 mt-1">
                         <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium text-foreground dark:text-white/90 ml-1">{t('form.subjectLabel')}</Label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-white/40" />
                      <Input
                        id="subject"
                        className="pl-11 h-12 bg-background dark:bg-black/40 border-border dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground/50 dark:placeholder:text-white/30 rounded-xl focus-visible:ring-[#00ffcc] focus-visible:border-[#00ffcc]"
                        {...form.register('subject')}
                        placeholder={t('form.subjectPlaceholder')}
                      />
                    </div>
                    {form.formState.errors.subject && (
                      <p className="text-xs text-red-400 flex items-center gap-1.5 ml-1 mt-1">
                         <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
                        {form.formState.errors.subject.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium text-foreground dark:text-white/90 ml-1">{t('form.messageLabel')}</Label>
                    <Textarea
                      id="message"
                      className="min-h-[140px] p-4 bg-background dark:bg-black/40 border-border dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground/50 dark:placeholder:text-white/30 rounded-xl resize-y focus-visible:ring-[#00ffcc] focus-visible:border-[#00ffcc]"
                      {...form.register('message')}
                      placeholder={t('form.messagePlaceholder')}
                    />
                    {form.formState.errors.message && (
                      <p className="text-xs text-red-400 flex items-center gap-1.5 ml-1 mt-1">
                         <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
                        {form.formState.errors.message.message}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full h-14 text-base font-semibold bg-[#00ffcc] text-black hover:bg-[#00ffcc]/90 transition-all rounded-xl shadow-[0_0_20px_rgba(0,255,204,0.3)] hover:shadow-[0_0_30px_rgba(0,255,204,0.5)] transform hover:-translate-y-0.5" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                          {t('form.sending')}
                        </>
                      ) : (
                        <>
                          <Send className="mr-3 h-5 w-5" />
                          {t('form.submit')}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
