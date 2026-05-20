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

// ─── Opportunity Posts ───────────────────────────────────────────

export const mockPosts: OppPost[] = [
  {
    id: "p1",
    title: "All For Change — Appel à Volontaires",
    description:
      "All For Change recrute 03 Chef(fe)s de Projets. Vous avez des compétences et l'envie de contribuer à une cause sociale ? Envoyez votre candidature à contact@all4change.org avant le 15 avril 2026.",
    category: "emplois",
    mode: "Présentiel",
    location: "Lomé, Togo",
    deadline: "2026-04-15T23:59:00Z",
    externalLink: "https://www.all4change.org",
    flyer: "/flyers/IMG-20260402-WA0013.jpg",
    author: mockUsers[1],
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    liked: false,
    saved: false,
    tags: ["Nouveau"],
    createdAt: "2026-04-02T08:00:00Z",
  },
  {
    id: "p2",
    title: "Catalogue des Créatifs Togolais et Africains",
    description:
      "Appel à manifestation d'intérêt pour rejoindre le Catalogue des créatifs togolais et africains. Les profils sélectionnés seront invités à une rencontre professionnelle suivie de la signature d'une convention de collaboration. Initiative portée par EA Dreams, L.ESCENES et la fondation.",
    category: "evenements",
    mode: "Présentiel",
    location: "Lomé, Togo",
    deadline: "2026-05-30T23:59:00Z",
    externalLink: "#",
    flyer: "/flyers/IMG-20260407-WA0003.jpg",
    author: mockUsers[2],
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    liked: false,
    saved: false,
    tags: ["Nouveau"],
    createdAt: "2026-04-07T10:00:00Z",
  },
  {
    id: "p3",
    title: "Réouverture Espace Orange Jeune — UNFPA",
    description:
      "Réouverture officielle de l'Espace Orange Jeune en partenariat avec l'UNFPA. Vendredi 10 avril : 10h-14h Journée Portes Ouvertes, 15h-17h Cérémonie Officielle. Inscrivez-vous via le QR code.",
    category: "evenements",
    mode: "Présentiel",
    location: "Lomé, Togo",
    deadline: "2026-04-10T23:59:00Z",
    externalLink: "#",
    flyer: "/flyers/IMG-20260409-WA0010.jpg",
    author: mockUsers[3],
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    liked: false,
    saved: false,
    tags: ["Vérifié"],
    createdAt: "2026-04-09T08:00:00Z",
  },
  {
    id: "p4",
    title: "Forum Régional des Filles et Jeunes Femmes 2026",
    description:
      "Plan International et le Youth Panel Lomé organisent le Forum Régional des Filles et Jeunes Femmes 2026. Thème : « Mon droit, ma voix, mon action : relever les défis pour l'égalité des filles et jeunes femmes. » Du 10 au 12 avril à l'Hôtel Mirambeau, Lomé.",
    category: "conferences",
    mode: "Présentiel",
    location: "Hôtel Mirambeau, Lomé, Togo",
    deadline: "2026-04-12T23:59:00Z",
    externalLink: "#",
    flyer: "/flyers/IMG-20260324-WA0043.jpg",
    author: mockUsers[4],
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    liked: false,
    saved: false,
    tags: ["Vérifié"],
    createdAt: "2026-03-24T09:00:00Z",
  },
  {
    id: "p5",
    title: "Le Numérique au Féminin — Édition 2026",
    description:
      "Cohorte spéciale en ligne du 25 mars au 30 mai 2026. Contribuez à former plus de femmes aux compétences numériques de demain. Inscriptions encore ouvertes. Initiative internationale avec des partenaires de plusieurs pays.",
    category: "formations",
    mode: "En ligne",
    location: "En ligne",
    deadline: "2026-05-30T23:59:00Z",
    externalLink: "#",
    flyer: "/flyers/IMG-20260407-WA0047.jpg",
    author: mockUsers[5],
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    liked: false,
    saved: false,
    tags: ["Nouveau"],
    createdAt: "2026-04-07T11:00:00Z",
  },
  {
    id: "p6",
    title: "Formateur(trice) en Droits Numériques & Plaidoyer",
    description:
      "L'ESTIC et Digitalise Youth recherchent un(e) formateur(trice) expert(e) en droits numériques et plaidoyer. Mission : former 80 jeunes répartis en 2 cohortes. Thèmes : droits numériques, sécurité en ligne, plaidoyer démocratique. Date limite : 13 avril 2026.",
    category: "emplois",
    mode: "Hybride",
    location: "Lomé, Togo",
    deadline: "2026-04-13T23:59:00Z",
    externalLink: "#",
    flyer: "/flyers/IMG-20260407-WA0045.jpg",
    author: mockUsers[6],
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    liked: false,
    saved: false,
    tags: ["Urgent"],
    createdAt: "2026-04-07T07:00:00Z",
  },
  {
    id: "p7",
    title: "Bootcamp BTP Certifié — De 0 à Pro",
    description:
      "Formation certifiée en Bootcamp BTP du 01 au 12 juillet à Lomé. Modules : Initiation à Archicad, Décoration intérieure, Lancement de projet, Recyclage & créativité. Bonus : Stage pour les 5 meilleurs, Marketing BTP, Gestion de projets. Coût : 50 000 F CFA. Places limitées à 20.",
    category: "formations",
    mode: "Présentiel",
    location: "Lomé, Togo",
    deadline: "2026-07-01T23:59:00Z",
    externalLink: "#",
    flyer: "/flyers/IMG-20260402-WA0020.jpg",
    author: mockUsers[1],
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    liked: false,
    saved: false,
    tags: ["Nouveau"],
    createdAt: "2026-04-02T14:00:00Z",
  },
  {
    id: "p8",
    title: "12 Formations Gratuites en Santé Publique",
    description:
      "12 formations gratuites en santé publique, en français, avec certificat. Développez vos compétences en épidémiologie, prévention, systèmes de santé et bien plus. Opportunité 100% gratuite et certifiante.",
    category: "formations",
    mode: "En ligne",
    location: "En ligne",
    deadline: "2026-06-30T23:59:00Z",
    externalLink: "#",
    flyer: "/flyers/IMG-20260405-WA0012.jpg",
    author: mockUsers[3],
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    liked: false,
    saved: false,
    tags: ["Nouveau"],
    createdAt: "2026-04-05T10:00:00Z",
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

// ─── Comments ────────────────────────────────────────────────────

export interface Comment {
  id: string;
  postId: string;
  author: OppUser;
  text: string;
  timestamp: string;
  likes: number;
}

export const mockComments: Comment[] = [];

// ─── Helper ───────────────────────────────────────────────────────

export function getCategory(slug: CategorySlug): Category {
  return categories.find((c) => c.slug === slug) ?? categories[0];
}
