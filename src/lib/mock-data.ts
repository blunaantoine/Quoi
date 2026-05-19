import {
  Trophy,
  GraduationCap,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  Banknote,
  Mic2,
  type LucideIcon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────

export type CategorySlug =
  | "concours"
  | "bourses"
  | "formations"
  | "stages"
  | "emplois"
  | "evenements"
  | "financements"
  | "conferences";

export interface Category {
  slug: CategorySlug;
  label: string;
  icon: LucideIcon;
  color: string;       // Tailwind bg class
  textColor: string;   // Tailwind text class
  borderColor: string; // Tailwind border class
}

export type ModeBadge = "En ligne" | "Présentiel" | "Hybride";

export interface OppUser {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  role: string;
  online?: boolean;
}

export interface OppPost {
  id: string;
  title: string;
  description: string;
  category: CategorySlug;
  mode: ModeBadge;
  location: string;
  deadline: string;    // ISO date
  externalLink: string;
  flyer: string;       // image URL
  author: OppUser;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  liked: boolean;
  saved: boolean;
  tags: ("Nouveau" | "Urgent" | "Vérifié")[];
  createdAt: string;
}

export type EventStatus = "À venir" | "En cours" | "Terminé";

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: OppUser;
  date: string;
  views: number;
  comments: number;
  status: EventStatus;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participant: OppUser;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  messages: Message[];
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "mention" | "opportunity";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  user?: OppUser;
  postId?: string;
}

export interface Ad {
  id: string;
  image: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  sponsor: string;
}

// ─── Categories ───────────────────────────────────────────────────

export const categories: Category[] = [
  {
    slug: "concours",
    label: "Concours",
    icon: Trophy,
    color: "bg-amber-500/20",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/40",
  },
  {
    slug: "bourses",
    label: "Bourses",
    icon: GraduationCap,
    color: "bg-emerald-500/20",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/40",
  },
  {
    slug: "formations",
    label: "Formations",
    icon: BookOpen,
    color: "bg-sky-500/20",
    textColor: "text-sky-400",
    borderColor: "border-sky-500/40",
  },
  {
    slug: "stages",
    label: "Stages",
    icon: Briefcase,
    color: "bg-violet-500/20",
    textColor: "text-violet-400",
    borderColor: "border-violet-500/40",
  },
  {
    slug: "emplois",
    label: "Emplois",
    icon: Building2,
    color: "bg-rose-500/20",
    textColor: "text-rose-400",
    borderColor: "border-rose-500/40",
  },
  {
    slug: "evenements",
    label: "Événements",
    icon: CalendarDays,
    color: "bg-pink-500/20",
    textColor: "text-pink-400",
    borderColor: "border-pink-500/40",
  },
  {
    slug: "financements",
    label: "Financements",
    icon: Banknote,
    color: "bg-teal-500/20",
    textColor: "text-teal-400",
    borderColor: "border-teal-500/40",
  },
  {
    slug: "conferences",
    label: "Conférences",
    icon: Mic2,
    color: "bg-orange-500/20",
    textColor: "text-orange-400",
    borderColor: "border-orange-500/40",
  },
];

// ─── Mock Users ───────────────────────────────────────────────────

export const currentUser: OppUser = {
  id: "u1",
  name: "Amina Diallo",
  avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Amina",
  verified: true,
  role: "Étudiante",
  online: true,
};

export const mockUsers: OppUser[] = [
  currentUser,
  {
    id: "u2",
    name: "Youssef Benali",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Youssef",
    verified: true,
    role: "Organisateur",
    online: true,
  },
  {
    id: "u3",
    name: "Fatou Ndiaye",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Fatou",
    verified: false,
    role: "Étudiante",
    online: false,
  },
  {
    id: "u4",
    name: "Karim Ousseini",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Karim",
    verified: true,
    role: "Recruteur",
    online: true,
  },
  {
    id: "u5",
    name: "Mariama Touré",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Mariama",
    verified: false,
    role: "Journaliste",
    online: false,
  },
  {
    id: "u6",
    name: "Ibrahim Keita",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Ibrahim",
    verified: true,
    role: "Mentor",
    online: true,
  },
  {
    id: "u7",
    name: "Aïcha Bello",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Aicha",
    verified: false,
    role: "Entrepreneuse",
    online: false,
  },
];

// ─── Mock Opportunity Posts ───────────────────────────────────────

export const mockPosts: OppPost[] = [
  {
    id: "p1",
    title: "Concours International de Plaidoirie 2026",
    description:
      "Participez au plus grand concours de plaidoirie d'Afrique francophone. Ouvert aux étudiants en droit de tous niveaux. Bourses de participation disponibles.",
    category: "concours",
    mode: "Hybride",
    location: "Dakar, Sénégal",
    deadline: "2026-06-15T23:59:00Z",
    externalLink: "https://example.com/concours-plaidoirie",
    flyer: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=1200&fit=crop",
    author: mockUsers[1],
    likes: 342,
    comments: 56,
    shares: 89,
    saves: 128,
    liked: false,
    saved: false,
    tags: ["Nouveau", "Vérifié"],
    createdAt: "2026-05-10T08:00:00Z",
  },
  {
    id: "p2",
    title: "Bourse Master² - Université de Montréal",
    description:
      "Bourse complète pour un programme de Master en sciences informatiques à l'Université de Montréal. Couvre frais de scolarité et allocation mensuelle de 1 500 CAD.",
    category: "bourses",
    mode: "En ligne",
    location: "Montréal, Canada",
    deadline: "2026-04-01T23:59:00Z",
    externalLink: "https://example.com/bourse-montreal",
    flyer: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=1200&fit=crop",
    author: mockUsers[3],
    likes: 891,
    comments: 123,
    shares: 456,
    saves: 312,
    liked: true,
    saved: true,
    tags: ["Urgent", "Vérifié"],
    createdAt: "2026-03-20T14:00:00Z",
  },
  {
    id: "p3",
    title: "Formation Gratuite en Data Science",
    description:
      "Programme intensif de 12 semaines en Data Science avec Python, Machine Learning et Deep Learning. Certification reconnue par l'État. Aucun prérequis technique requis.",
    category: "formations",
    mode: "En ligne",
    location: "En ligne",
    deadline: "2026-07-30T23:59:00Z",
    externalLink: "https://example.com/formation-data",
    flyer: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=1200&fit=crop",
    author: mockUsers[5],
    likes: 567,
    comments: 78,
    shares: 234,
    saves: 198,
    liked: false,
    saved: false,
    tags: ["Nouveau"],
    createdAt: "2026-05-15T10:00:00Z",
  },
  {
    id: "p4",
    title: "Stage en Développement Web - Orange Sonatel",
    description:
      "Stage de 6 mois en développement web full-stack au sein de la direction digitale d'Orange Sonatel. Rémunération mensuelle + possibilité d'embauche.",
    category: "stages",
    mode: "Présentiel",
    location: "Dakar, Sénégal",
    deadline: "2026-05-31T23:59:00Z",
    externalLink: "https://example.com/stage-orange",
    flyer: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=1200&fit=crop",
    author: mockUsers[3],
    likes: 423,
    comments: 91,
    shares: 167,
    saves: 256,
    liked: false,
    saved: true,
    tags: ["Vérifié"],
    createdAt: "2026-05-01T09:00:00Z",
  },
  {
    id: "p5",
    title: "Chef de Projet Digital - Wave Mobile Money",
    description:
      "Rejoignez Wave en tant que Chef de Projet Digital. Salaire compétitif, environnement innovant et impact social direct. Expérience requise : 3+ ans.",
    category: "emplois",
    mode: "Présentiel",
    location: "Dakar, Sénégal",
    deadline: "2026-06-20T23:59:00Z",
    externalLink: "https://example.com/emploi-wave",
    flyer: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=1200&fit=crop",
    author: mockUsers[3],
    likes: 234,
    comments: 45,
    shares: 112,
    saves: 189,
    liked: false,
    saved: false,
    tags: ["Vérifié"],
    createdAt: "2026-05-12T11:00:00Z",
  },
  {
    id: "p6",
    title: "Festival Afrika Tech 2026",
    description:
      "Le plus grand festival technologique d'Afrique de l'Ouest. 3 jours de conférences, ateliers et networking avec plus de 5 000 participants et 200 speakers.",
    category: "evenements",
    mode: "Présentiel",
    location: "Abidjan, Côte d'Ivoire",
    deadline: "2026-08-15T23:59:00Z",
    externalLink: "https://example.com/afrika-tech",
    flyer: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=1200&fit=crop",
    author: mockUsers[1],
    likes: 678,
    comments: 134,
    shares: 345,
    saves: 267,
    liked: true,
    saved: false,
    tags: ["Nouveau", "Vérifié"],
    createdAt: "2026-05-18T16:00:00Z",
  },
  {
    id: "p7",
    title: "Fonds d'Innovation Jeunes - Banque Mondiale",
    description:
      "Appel à projets pour le Fonds d'Innovation Jeunes de la Banque Mondiale. Jusqu'à 50 000 USD par projet innovant porté par des jeunes de 18-35 ans.",
    category: "financements",
    mode: "En ligne",
    location: "Afrique Subsaharienne",
    deadline: "2026-09-01T23:59:00Z",
    externalLink: "https://example.com/fonds-innovation",
    flyer: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=1200&fit=crop",
    author: mockUsers[5],
    likes: 1023,
    comments: 201,
    shares: 567,
    saves: 445,
    liked: false,
    saved: false,
    tags: ["Nouveau", "Urgent", "Vérifié"],
    createdAt: "2026-05-17T07:00:00Z",
  },
  {
    id: "p8",
    title: "Conférence IA & Afrique - UNESCO",
    description:
      "Conférence internationale sur l'intelligence artificielle et son impact en Afrique. Interventions d'experts mondiaux, tables rondes et ateliers pratiques.",
    category: "conferences",
    mode: "Hybride",
    location: "Paris, France",
    deadline: "2026-07-10T23:59:00Z",
    externalLink: "https://example.com/conf-ia-unesco",
    flyer: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=1200&fit=crop",
    author: mockUsers[1],
    likes: 456,
    comments: 67,
    shares: 189,
    saves: 145,
    liked: false,
    saved: false,
    tags: ["Vérifié"],
    createdAt: "2026-05-14T13:00:00Z",
  },
  {
    id: "p9",
    title: "Hackathon Climat 48h - Solutions Vertes",
    description:
      "Hackathon de 48 heures pour développer des solutions technologiques face aux défis climatiques en Afrique. Prix de 10 000 USD pour la meilleure équipe.",
    category: "concours",
    mode: "Hybride",
    location: "Nairobi, Kenya",
    deadline: "2026-06-25T23:59:00Z",
    externalLink: "https://example.com/hackathon-climat",
    flyer: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=1200&fit=crop",
    author: mockUsers[6],
    likes: 289,
    comments: 43,
    shares: 98,
    saves: 176,
    liked: false,
    saved: false,
    tags: ["Nouveau"],
    createdAt: "2026-05-19T08:00:00Z",
  },
];

// ─── Mock Articles ────────────────────────────────────────────────

export const mockArticles: Article[] = [
  {
    id: "a1",
    title: "Les bourses francophones en forte hausse en 2026",
    excerpt:
      "Selon une récente étude de l'OIF, le nombre de bourses destinées aux étudiants francophones a augmenté de 23% cette année, ouvrant de nouvelles perspectives.",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=250&fit=crop",
    author: mockUsers[4],
    date: "2026-05-17",
    views: 4523,
    comments: 89,
    status: "En cours",
  },
  {
    id: "a2",
    title: "Comment réussir sa candidature pour un stage à l'étranger",
    excerpt:
      "Nos conseils pratiques pour optimiser votre dossier de candidature et décrocher le stage de vos rêves hors de vos frontières.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop",
    author: mockUsers[5],
    date: "2026-05-15",
    views: 3201,
    comments: 56,
    status: "À venir",
  },
  {
    id: "a3",
    title: "Afrika Tech Summit : le bilan de l'édition 2025",
    excerpt:
      "Retour sur l'édition 2025 du plus grand sommet technologique africain avec plus de 200 startups présentées et 50 millions USD de deals conclus.",
    image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400&h=250&fit=crop",
    author: mockUsers[4],
    date: "2026-05-10",
    views: 7891,
    comments: 134,
    status: "Terminé",
  },
  {
    id: "a4",
    title: "Les métiers du numérique les plus recherchés en Afrique",
    excerpt:
      "Data Scientist, DevOps, Cybersécurité... Découvrez les 10 profils numériques les plus demandés par les entreprises africaines en 2026.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=250&fit=crop",
    author: mockUsers[3],
    date: "2026-05-08",
    views: 6234,
    comments: 98,
    status: "En cours",
  },
  {
    id: "a5",
    title: "Financements : les nouveaux fonds pour les startups africaines",
    excerpt:
      "Plus de 2 milliards USD ont été investis dans des startups africaines au premier trimestre 2026. Analyse des tendances et des secteurs porteurs.",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=250&fit=crop",
    author: mockUsers[6],
    date: "2026-05-05",
    views: 5678,
    comments: 76,
    status: "En cours",
  },
  {
    id: "a6",
    title: "Guide complet des concours d'éloquence francophones",
    excerpt:
      "Tous les concours de plaidoirie et d'éloquence ouverts aux francophones cette année : dates, modalités et conseils de préparation.",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop",
    author: mockUsers[5],
    date: "2026-05-01",
    views: 3456,
    comments: 45,
    status: "À venir",
  },
];

// ─── Mock Conversations ───────────────────────────────────────────

export const mockConversations: Conversation[] = [
  {
    id: "c1",
    participant: mockUsers[1],
    lastMessage: "N'oublie pas d'envoyer ton dossier avant vendredi !",
    lastMessageTime: "2026-05-19T18:30:00Z",
    unread: 2,
    messages: [
      {
        id: "m1",
        senderId: "u2",
        text: "Salut Amina ! Tu as vu la bourse Montréal ?",
        timestamp: "2026-05-19T17:00:00Z",
      },
      {
        id: "m2",
        senderId: "u1",
        text: "Oui ! Je suis en train de préparer mon dossier 📝",
        timestamp: "2026-05-19T17:05:00Z",
      },
      {
        id: "m3",
        senderId: "u2",
        text: "Super ! Je peux t'aider si tu veux",
        timestamp: "2026-05-19T17:10:00Z",
      },
      {
        id: "m4",
        senderId: "u2",
        text: "N'oublie pas d'envoyer ton dossier avant vendredi !",
        timestamp: "2026-05-19T18:30:00Z",
      },
    ],
  },
  {
    id: "c2",
    participant: mockUsers[3],
    lastMessage: "Votre candidature a été transmise au service RH.",
    lastMessageTime: "2026-05-19T14:00:00Z",
    unread: 1,
    messages: [
      {
        id: "m5",
        senderId: "u4",
        text: "Bonjour, nous avons bien reçu votre demande de stage.",
        timestamp: "2026-05-19T13:30:00Z",
      },
      {
        id: "m6",
        senderId: "u4",
        text: "Votre candidature a été transmise au service RH.",
        timestamp: "2026-05-19T14:00:00Z",
      },
    ],
  },
  {
    id: "c3",
    participant: mockUsers[5],
    lastMessage: "La conférence commence à 14h, sois à l'heure !",
    lastMessageTime: "2026-05-18T20:00:00Z",
    unread: 0,
    messages: [
      {
        id: "m7",
        senderId: "u6",
        text: "Tu viens à la conférence IA demain ?",
        timestamp: "2026-05-18T19:00:00Z",
      },
      {
        id: "m8",
        senderId: "u1",
        text: "Oui, j'y serai ! 🎉",
        timestamp: "2026-05-18T19:15:00Z",
      },
      {
        id: "m9",
        senderId: "u6",
        text: "La conférence commence à 14h, sois à l'heure !",
        timestamp: "2026-05-18T20:00:00Z",
      },
    ],
  },
  {
    id: "c4",
    participant: mockUsers[2],
    lastMessage: "Merci pour l'info, je vais postuler !",
    lastMessageTime: "2026-05-17T10:00:00Z",
    unread: 0,
    messages: [
      {
        id: "m10",
        senderId: "u1",
        text: "Fatou, tu as vu le hackathon climat ?",
        timestamp: "2026-05-17T09:30:00Z",
      },
      {
        id: "m11",
        senderId: "u3",
        text: "Merci pour l'info, je vais postuler !",
        timestamp: "2026-05-17T10:00:00Z",
      },
    ],
  },
];

// ─── Mock Notifications ───────────────────────────────────────────

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    type: "like",
    title: "Nouveau like",
    description: "Youssef Benali a aimé votre publication",
    timestamp: "2026-05-19T19:00:00Z",
    read: false,
    user: mockUsers[1],
    postId: "p3",
  },
  {
    id: "n2",
    type: "comment",
    title: "Nouveau commentaire",
    description: "Karim Ousseini a commenté : « Très intéressant ! »",
    timestamp: "2026-05-19T17:30:00Z",
    read: false,
    user: mockUsers[3],
    postId: "p2",
  },
  {
    id: "n3",
    type: "opportunity",
    title: "Nouvelle opportunité",
    description: "Concours de plaidoirie : dernière semaine pour candidater !",
    timestamp: "2026-05-19T15:00:00Z",
    read: false,
    postId: "p1",
  },
  {
    id: "n4",
    type: "follow",
    title: "Nouvel abonné",
    description: "Ibrahim Keita a commencé à vous suivre",
    timestamp: "2026-05-18T12:00:00Z",
    read: true,
    user: mockUsers[5],
  },
  {
    id: "n5",
    type: "mention",
    title: "Mention",
    description: "Mariama Touré vous a mentionné dans un article",
    timestamp: "2026-05-17T09:00:00Z",
    read: true,
    user: mockUsers[4],
  },
  {
    id: "n6",
    type: "like",
    title: "Nouveau like",
    description: "Fatou Ndiaye a aimé votre publication",
    timestamp: "2026-05-16T14:00:00Z",
    read: true,
    user: mockUsers[2],
    postId: "p7",
  },
  {
    id: "n7",
    type: "opportunity",
    title: "Rappel deadline",
    description: "Bourse Montréal : 2 jours restants pour postuler",
    timestamp: "2026-05-16T08:00:00Z",
    read: true,
    postId: "p2",
  },
];

// ─── Mock Ads ─────────────────────────────────────────────────────

export const mockAds: Ad[] = [
  {
    id: "ad1",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=1400&fit=crop",
    title: "Master en Intelligence Artificielle",
    description:
      "Rejoignez le programme de référence en IA. 100% en ligne, certification internationale. Inscriptions ouvertes.",
    ctaText: "S'inscrire maintenant",
    ctaLink: "https://example.com/master-ia",
    sponsor: "Institut Africain d'IA",
  },
  {
    id: "ad2",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=1400&fit=crop",
    title: "Wave recrute !",
    description:
      "Plus de 50 postes disponibles en ingénierie, produit et design. Rejoignez la fintech qui change l'Afrique.",
    ctaText: "Voir les offres",
    ctaLink: "https://example.com/wave-recrutement",
    sponsor: "Wave Mobile Money",
  },
];

// ─── Helper ───────────────────────────────────────────────────────

export function getCategory(slug: CategorySlug): Category {
  return categories.find((c) => c.slug === slug) ?? categories[0];
}
