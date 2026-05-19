'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  Upload,
  Image as ImageIcon,
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { categories, type CategorySlug, type ModeBadge } from '@/lib/mock-data'

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
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) return
    setIsSubmitting(true)
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false)
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
    }, 1500)
  }

  const isFormValid = title.trim() && description.trim()

  // Deadline urgency check
  const deadlineUrgent = deadline && new Date(deadline).getTime() - Date.now() < 7 * 86_400_000

  const selectedCategory = category ? categories.find((c) => c.slug === category) : null

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#333333]/50">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-6 h-6 text-[#D1F550]" />
            <h1 className="text-xl font-bold text-white">Publier</h1>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="bg-[#D1F550] text-[#0A0A0A] hover:bg-[#B8D940] font-semibold rounded-full px-5 h-9 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Publication...' : 'Publier l\'opportunité'}
          </Button>
        </div>
      </div>

      <div className="px-4 pt-4 pb-28 space-y-5">
        {/* ── Image Flyer Upload ── */}
        <div>
          <label className="text-xs font-medium text-[#A3A3A3] mb-1.5 block">
            Image / Flyer
          </label>
          <button
            type="button"
            onClick={() => {
              // Simulate image upload
              setFlyerPreview(
                'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'
              )
            }}
            className="w-full h-44 rounded-2xl border-2 border-dashed border-[#333333] bg-[#1A1A1A] overflow-hidden hover:border-[#D1F550]/40 transition-colors group relative"
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
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Changer l&apos;image</span>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-[#A3A3A3] group-hover:text-[#D1F550] transition-colors">
                <Upload className="w-8 h-8" />
                <span className="text-sm font-medium">Cliquez pour ajouter un flyer</span>
                <span className="text-xs">JPG, PNG, WebP — max 5MB</span>
              </div>
            )}
          </button>
        </div>

        {/* ── Titre ── */}
        <div>
          <label className="text-xs font-medium text-[#A3A3A3] mb-1.5 block">
            Titre <span className="text-red-400">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Concours International de Plaidoirie 2026"
            className="bg-[#1A1A1A] border-[#333333] text-white placeholder:text-[#A3A3A3] rounded-xl h-11 focus:border-[#D1F550]/60"
          />
        </div>

        {/* ── Description ── */}
        <div>
          <label className="text-xs font-medium text-[#A3A3A3] mb-1.5 block">
            Description <span className="text-red-400">*</span>
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez l'opportunité en détail..."
            className="bg-[#1A1A1A] border-[#333333] text-white placeholder:text-[#A3A3A3] rounded-xl min-h-[120px] resize-none focus:border-[#D1F550]/60"
          />
        </div>

        {/* ── Catégorie ── */}
        <div className="relative">
          <label className="text-xs font-medium text-[#A3A3A3] mb-1.5 block">
            Catégorie
          </label>
          <button
            type="button"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="w-full h-11 bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 flex items-center justify-between text-sm text-white hover:border-[#D1F550]/40 transition-colors"
          >
            {selectedCategory ? (
              <span className="flex items-center gap-2">
                <selectedCategory.icon className={`h-4 w-4 ${selectedCategory.textColor}`} />
                {selectedCategory.label}
              </span>
            ) : (
              <span className="text-[#A3A3A3]">Sélectionner une catégorie</span>
            )}
            <ChevronDown className={`w-4 h-4 text-[#A3A3A3] transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showCategoryDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-30 w-full mt-1 bg-[#1A1A1A] border border-[#333333] rounded-xl overflow-hidden shadow-xl shadow-black/40"
            >
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
                    className={`w-full px-4 py-2.5 flex items-center gap-2.5 text-sm hover:bg-[#262626] transition-colors ${
                      category === cat.slug ? 'text-[#D1F550] bg-[#D1F550]/5' : 'text-white'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${cat.textColor}`} />
                    {cat.label}
                  </button>
                )
              })}
            </motion.div>
          )}
        </div>

        {/* ── Lien externe ── */}
        <div>
          <label className="text-xs font-medium text-[#A3A3A3] mb-1.5 block flex items-center gap-1">
            <LinkIcon className="w-3 h-3" /> Lien externe
          </label>
          <Input
            type="url"
            value={externalLink}
            onChange={(e) => setExternalLink(e.target.value)}
            placeholder="https://example.com/opportunite"
            className="bg-[#1A1A1A] border-[#333333] text-white placeholder:text-[#A3A3A3] rounded-xl h-11 focus:border-[#D1F550]/60"
          />
        </div>

        {/* ── Contact row: WhatsApp, Email, Téléphone ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-[#A3A3A3] mb-1.5 block flex items-center gap-1">
              <MessageCircle className="w-3 h-3" /> WhatsApp
            </label>
            <Input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+221 77 123 4567"
              className="bg-[#1A1A1A] border-[#333333] text-white placeholder:text-[#A3A3A3] rounded-xl h-11 focus:border-[#D1F550]/60"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#A3A3A3] mb-1.5 block flex items-center gap-1">
              <Mail className="w-3 h-3" /> Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@example.com"
              className="bg-[#1A1A1A] border-[#333333] text-white placeholder:text-[#A3A3A3] rounded-xl h-11 focus:border-[#D1F550]/60"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#A3A3A3] mb-1.5 block flex items-center gap-1">
              <Phone className="w-3 h-3" /> Téléphone
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+221 77 123 4567"
              className="bg-[#1A1A1A] border-[#333333] text-white placeholder:text-[#A3A3A3] rounded-xl h-11 focus:border-[#D1F550]/60"
            />
          </div>
        </div>

        {/* ── Lieu ── */}
        <div>
          <label className="text-xs font-medium text-[#A3A3A3] mb-1.5 block flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Lieu
          </label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Dakar, Sénégal"
            className="bg-[#1A1A1A] border-[#333333] text-white placeholder:text-[#A3A3A3] rounded-xl h-11 focus:border-[#D1F550]/60"
          />
        </div>

        {/* ── Dates row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[#A3A3A3] mb-1.5 block flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Date événement
            </label>
            <Input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="bg-[#1A1A1A] border-[#333333] text-white placeholder:text-[#A3A3A3] rounded-xl h-11 focus:border-[#D1F550]/60 [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#A3A3A3] mb-1.5 block flex items-center gap-1">
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
              className={`bg-[#1A1A1A] border-[#333333] text-white placeholder:text-[#A3A3A3] rounded-xl h-11 [color-scheme:dark] ${
                deadlineUrgent ? 'border-red-500/50 focus:border-red-500/80' : 'focus:border-[#D1F550]/60'
              }`}
            />
          </div>
        </div>

        {/* ── Mode selector ── */}
        <div>
          <label className="text-xs font-medium text-[#A3A3A3] mb-1.5 block">
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
                    ? 'bg-[#D1F550] text-[#0A0A0A]'
                    : 'bg-[#1A1A1A] border border-[#333333] text-[#A3A3A3] hover:text-white hover:border-[#D1F550]/30'
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
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-[#D1F550] text-[#0A0A0A] hover:bg-[#B8D940] font-bold rounded-2xl h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Publication en cours...' : 'Publier l\'opportunité'}
          </Button>

          {/* Certification notice */}
          <div className="flex items-start gap-2.5 bg-[#1A1A1A] rounded-xl border border-[#333333] p-3">
            <ShieldCheck className="w-5 h-5 text-[#D1F550] shrink-0 mt-0.5" />
            <div className="text-xs text-[#A3A3A3] leading-relaxed">
              <span className="text-white font-medium">Utilisateurs certifiés</span> : publication directe.{' '}
              <span className="text-white font-medium">Utilisateurs simples</span> : votre opportunité sera soumise à validation avant publication.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
