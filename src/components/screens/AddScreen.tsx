'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import {
  Upload,
  MapPin,
  LinkIcon,
  Calendar,
  Clock,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  Phone,
  Mail,
  MessageCircle,
  Plus,
  X,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { categories, type CategorySlug, type ModeBadge } from '@/lib/mock-data'
import { toast } from 'sonner'

// ─── Mode options ─────────────────────────────────────────────────

const MODE_OPTIONS: { value: ModeBadge; label: string }[] = [
  { value: 'En ligne', label: 'En ligne' },
  { value: 'Présentiel', label: 'Présentiel' },
  { value: 'Hybride', label: 'Hybride' },
]

// ─── Component ────────────────────────────────────────────────────

export default function AddScreen() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<CategorySlug | ''>('')
  const [externalLink, setExternalLink] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [deadline, setDeadline] = useState('')
  const [mode, setMode] = useState<ModeBadge | ''>('')
  const [flyerPreview, setFlyerPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast('Type de fichier non supporté. Utilisez JPG, PNG, WebP ou GIF.')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast('Fichier trop volumineux. Maximum 5MB.')
      return
    }

    setSelectedFile(file)

    // Create preview using FileReader
    const reader = new FileReader()
    reader.onload = (event) => {
      setFlyerPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveImage = () => {
    setFlyerPreview(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        toast(error.error || 'Erreur lors du téléchargement')
        return null
      }

      const data = await response.json()
      return data.url
    } catch {
      toast('Erreur de connexion lors du téléchargement')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return
    setIsSubmitting(true)

    try {
      // Upload the file if one is selected
      let imageUrl = flyerPreview
      if (selectedFile) {
        const uploadedUrl = await uploadFile(selectedFile)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }

      // Simulate post creation with the uploaded image
      // In production, this would call a POST /api/posts endpoint
      await new Promise((resolve) => setTimeout(resolve, 800))

      toast('Opportunité publiée avec succès')

      // Reset form
      setTitle('')
      setDescription('')
      setCategory('')
      setExternalLink('')
      setWhatsapp('')
      setEmail('')
      setPhone('')
      setLocation('')
      setEventDate('')
      setDeadline('')
      setMode('')
      setFlyerPreview(null)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch {
      toast("Erreur lors de la publication")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = title.trim() && description.trim()

  // Deadline urgency check
  const deadlineUrgent = deadline && new Date(deadline).getTime() - Date.now() < 7 * 86_400_000

  const selectedCategory = category ? categories.find((c) => c.slug === category) : null

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Sélectionner une image"
      />

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Publier</h1>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting || isUploading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-full px-5 h-9 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                Publication...
              </span>
            ) : (
              "Publier l'opportunité"
            )}
          </Button>
        </div>
      </div>

      <div className="px-4 pt-4 pb-28 space-y-5">
        {/* ── Image Flyer Upload ── */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Image / Flyer
          </label>
          <button
            type="button"
            onClick={handleUploadClick}
            className="w-full h-44 rounded-2xl border-2 border-dashed border-border bg-card overflow-hidden hover:border-primary/40 transition-colors group relative"
          >
            {flyerPreview ? (
              <>
                <Image
                  src={flyerPreview}
                  alt="Flyer preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <span className="text-foreground text-sm font-medium">Changer l&apos;image</span>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                <Upload className="w-8 h-8" />
                <span className="text-sm font-medium">Cliquez pour ajouter un flyer</span>
                <span className="text-xs">JPG, PNG, WebP — max 5MB</span>
              </div>
            )}
          </button>
          {/* Remove image button */}
          {flyerPreview && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="mt-2 flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Supprimer l&apos;image
            </button>
          )}
          {/* Upload status */}
          {isUploading && (
            <div className="mt-2 flex items-center gap-2 text-xs text-primary">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Téléchargement en cours...
            </div>
          )}
          {/* File info */}
          {selectedFile && !isUploading && (
            <div className="mt-2 text-xs text-muted-foreground">
              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
            </div>
          )}
        </div>

        {/* ── Titre ── */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Titre <span className="text-red-400">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Concours International de Plaidoirie 2026"
            className="bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl h-11 focus:border-primary/60"
          />
        </div>

        {/* ── Description ── */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Description <span className="text-red-400">*</span>
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez l'opportunité en détail..."
            className="bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl min-h-[120px] resize-none focus:border-primary/60"
          />
        </div>

        {/* ── Catégorie ── */}
        <div className="relative">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Catégorie
          </label>
          <button
            type="button"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="w-full h-11 bg-card border border-border rounded-xl px-4 flex items-center justify-between text-sm text-foreground hover:border-primary/40 transition-colors"
          >
            {selectedCategory ? (
              <span className="flex items-center gap-2">
                <selectedCategory.icon className={`h-4 w-4 ${selectedCategory.textColor}`} />
                {selectedCategory.label}
              </span>
            ) : (
              <span className="text-muted-foreground">Sélectionner une catégorie</span>
            )}
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showCategoryDropdown && (
            <div className="absolute z-30 w-full mt-1 bg-card border border-border rounded-xl overflow-hidden shadow-xl shadow-black/40 animate-fade-slide-in">
              {categories.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => {
                      setCategory(cat.slug)
                      setShowCategoryDropdown(false)
                    }}
                    className={`w-full px-4 py-2.5 flex items-center gap-2.5 text-sm hover:bg-secondary transition-colors ${
                      category === cat.slug ? 'text-primary bg-primary/5' : 'text-foreground'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${cat.textColor}`} />
                    {cat.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Lien externe ── */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1">
            <LinkIcon className="w-3 h-3" /> Lien externe
          </label>
          <Input
            type="url"
            value={externalLink}
            onChange={(e) => setExternalLink(e.target.value)}
            placeholder="https://example.com/opportunite"
            className="bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl h-11 focus:border-primary/60"
          />
        </div>

        {/* ── Contact row: WhatsApp, Email, Téléphone ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1">
              <MessageCircle className="w-3 h-3" /> WhatsApp
            </label>
            <Input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+221 77 123 4567"
              className="bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl h-11 focus:border-primary/60"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1">
              <Mail className="w-3 h-3" /> Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@example.com"
              className="bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl h-11 focus:border-primary/60"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1">
              <Phone className="w-3 h-3" /> Téléphone
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+221 77 123 4567"
              className="bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl h-11 focus:border-primary/60"
            />
          </div>
        </div>

        {/* ── Lieu ── */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Lieu
          </label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Dakar, Sénégal"
            className="bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl h-11 focus:border-primary/60"
          />
        </div>

        {/* ── Dates row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Date événement
            </label>
            <Input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl h-11 focus:border-primary/60 [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1">
              <Clock className="w-3 h-3" /> Date limite
              {deadlineUrgent && (
                <span className="text-red-400 flex items-center gap-0.5 ml-1">
                  <AlertTriangle className="w-3 h-3" /> Urgent
                </span>
              )}
            </label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={`bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl h-11 [color-scheme:dark] ${
                deadlineUrgent ? 'border-red-500/50 focus:border-red-500/80' : 'focus:border-primary/60'
              }`}
            />
          </div>
        </div>

        {/* ── Mode selector ── */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Mode
          </label>
          <div className="flex gap-2">
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMode(opt.value)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  mode === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Submit + Notice ── */}
        <div className="pt-2 space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting || isUploading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-2xl h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Publication en cours...
              </span>
            ) : (
              "Publier l'opportunité"
            )}
          </Button>

          {/* Certification notice */}
          <div className="flex items-start gap-2.5 bg-card rounded-xl border border-border p-3">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-foreground font-medium">Utilisateurs certifiés</span> : publication directe.{' '}
              <span className="text-foreground font-medium">Utilisateurs simples</span> : votre opportunité sera soumise à validation avant publication.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
