import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data (order matters for foreign keys)
  await prisma.adClick.deleteMany();
  await prisma.adView.deleteMany();
  await prisma.ad.deleteMany();
  await prisma.adminLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.savedPost.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.category.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Cleaned existing data");

  // ─── Categories ────────────────────────────────────────────────
  const categoriesData = [
    { name: "Concours", slug: "concours", icon: "Trophy", color: "bg-amber-500/20" },
    { name: "Bourses", slug: "bourses", icon: "GraduationCap", color: "bg-emerald-500/20" },
    { name: "Formations", slug: "formations", icon: "BookOpen", color: "bg-sky-500/20" },
    { name: "Stages", slug: "stages", icon: "Briefcase", color: "bg-violet-500/20" },
    { name: "Emplois", slug: "emplois", icon: "Building2", color: "bg-rose-500/20" },
    { name: "Événements", slug: "evenements", icon: "CalendarDays", color: "bg-pink-500/20" },
    { name: "Financements", slug: "financements", icon: "Banknote", color: "bg-teal-500/20" },
    { name: "Conférences", slug: "conferences", icon: "Mic2", color: "bg-orange-500/20" },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created.id;
  }
  console.log(`✅ Created ${categoriesData.length} categories`);

  // ─── Users ─────────────────────────────────────────────────────
  const hashedAdminPw = hashPassword("admin123");
  const hashedUserPw = hashPassword("password123");

  // Admin user
  const admin = await prisma.user.create({
    data: {
      email: "admin@oppy.com",
      username: "admin",
      password: hashedAdminPw,
      role: "admin",
      isVerified: true,
      profile: {
        create: {
          displayName: "Admin OPPY",
          bio: "Administrateur de la plateforme OPPY",
          avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Admin",
        },
      },
    },
  });

  // Manager users
  const managers: { id: string }[] = [];
  for (let i = 1; i <= 2; i++) {
    const manager = await prisma.user.create({
      data: {
        email: `manager${i}@oppy.com`,
        username: `manager${i}`,
        password: hashedUserPw,
        role: "manager",
        isVerified: true,
        profile: {
          create: {
            displayName: i === 1 ? "Youssef Benali" : "Mariama Touré",
            bio: i === 1 ? "Organisateur et manager sur OPPY" : "Journaliste et manager sur OPPY",
            avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=Manager${i}`,
          },
        },
      },
    });
    managers.push(manager);
  }

  // Certified users
  const certifiedUsers: { id: string }[] = [];
  const certifiedData = [
    { name: "Karim Ousseini", bio: "Recruteur certifié sur OPPY", seed: "Karim" },
    { name: "Ibrahim Keita", bio: "Mentor certifié sur OPPY", seed: "Ibrahim" },
    { name: "Amina Diallo", bio: "Étudiante certifiée sur OPPY", seed: "Amina" },
  ];
  for (let i = 0; i < certifiedData.length; i++) {
    const user = await prisma.user.create({
      data: {
        email: `${certifiedData[i].seed.toLowerCase()}@oppy.com`,
        username: certifiedData[i].seed.toLowerCase(),
        password: hashedUserPw,
        role: "certified",
        isVerified: true,
        profile: {
          create: {
            displayName: certifiedData[i].name,
            bio: certifiedData[i].bio,
            avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${certifiedData[i].seed}`,
          },
        },
      },
    });
    certifiedUsers.push(user);
  }

  // Regular users
  const regularUsers: { id: string }[] = [];
  const regularData = [
    { name: "Fatou Ndiaye", seed: "Fatou" },
    { name: "Aïcha Bello", seed: "Aicha" },
    { name: "Omar Sy", seed: "Omar" },
    { name: "Kadiatou Bah", seed: "Kadiatou" },
    { name: "Moussa Diop", seed: "Moussa" },
  ];
  for (let i = 0; i < regularData.length; i++) {
    const user = await prisma.user.create({
      data: {
        email: `${regularData[i].seed.toLowerCase()}@oppy.com`,
        username: regularData[i].seed.toLowerCase(),
        password: hashedUserPw,
        role: "user",
        isVerified: false,
        profile: {
          create: {
            displayName: regularData[i].name,
            bio: `Membre de la communauté OPPY`,
            avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${regularData[i].seed}`,
          },
        },
      },
    });
    regularUsers.push(user);
  }

  const allUsers = [admin, ...managers, ...certifiedUsers, ...regularUsers];
  console.log(`✅ Created ${allUsers.length} users`);

  // ─── Posts ─────────────────────────────────────────────────────
  const postsData = [
    {
      title: "Concours International de Plaidoirie 2026",
      description: "Participez au plus grand concours de plaidoirie d'Afrique francophone. Ouvert aux étudiants en droit de tous niveaux. Bourses de participation disponibles.",
      categorySlug: "concours",
      mode: "hybride",
      location: "Dakar, Sénégal",
      deadlineDate: new Date("2026-06-15T23:59:00Z"),
      externalLink: "https://example.com/concours-plaidoirie",
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=1200&fit=crop",
      tags: "nouveau,verifie",
      authorId: managers[0].id,
    },
    {
      title: "Bourse Master² - Université de Montréal",
      description: "Bourse complète pour un programme de Master en sciences informatiques à l'Université de Montréal. Couvre frais de scolarité et allocation mensuelle de 1 500 CAD.",
      categorySlug: "bourses",
      mode: "en_ligne",
      location: "Montréal, Canada",
      deadlineDate: new Date("2026-04-01T23:59:00Z"),
      externalLink: "https://example.com/bourse-montreal",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=1200&fit=crop",
      tags: "urgent,verifie",
      authorId: certifiedUsers[0].id,
    },
    {
      title: "Formation Gratuite en Data Science",
      description: "Programme intensif de 12 semaines en Data Science avec Python, Machine Learning et Deep Learning. Certification reconnue par l'État. Aucun prérequis technique requis.",
      categorySlug: "formations",
      mode: "en_ligne",
      location: "En ligne",
      deadlineDate: new Date("2026-07-30T23:59:00Z"),
      externalLink: "https://example.com/formation-data",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=1200&fit=crop",
      tags: "nouveau",
      authorId: certifiedUsers[1].id,
    },
    {
      title: "Stage en Développement Web - Orange Sonatel",
      description: "Stage de 6 mois en développement web full-stack au sein de la direction digitale d'Orange Sonatel. Rémunération mensuelle + possibilité d'embauche.",
      categorySlug: "stages",
      mode: "presentiel",
      location: "Dakar, Sénégal",
      deadlineDate: new Date("2026-05-31T23:59:00Z"),
      externalLink: "https://example.com/stage-orange",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=1200&fit=crop",
      tags: "verifie",
      authorId: certifiedUsers[0].id,
    },
    {
      title: "Chef de Projet Digital - Wave Mobile Money",
      description: "Rejoignez Wave en tant que Chef de Projet Digital. Salaire compétitif, environnement innovant et impact social direct. Expérience requise : 3+ ans.",
      categorySlug: "emplois",
      mode: "presentiel",
      location: "Dakar, Sénégal",
      deadlineDate: new Date("2026-06-20T23:59:00Z"),
      externalLink: "https://example.com/emploi-wave",
      image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=1200&fit=crop",
      tags: "verifie",
      authorId: certifiedUsers[0].id,
    },
    {
      title: "Festival Afrika Tech 2026",
      description: "Le plus grand festival technologique d'Afrique de l'Ouest. 3 jours de conférences, ateliers et networking avec plus de 5 000 participants et 200 speakers.",
      categorySlug: "evenements",
      mode: "presentiel",
      location: "Abidjan, Côte d'Ivoire",
      deadlineDate: new Date("2026-08-15T23:59:00Z"),
      externalLink: "https://example.com/afrika-tech",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=1200&fit=crop",
      tags: "nouveau,verifie",
      authorId: managers[0].id,
    },
    {
      title: "Fonds d'Innovation Jeunes - Banque Mondiale",
      description: "Appel à projets pour le Fonds d'Innovation Jeunes de la Banque Mondiale. Jusqu'à 50 000 USD par projet innovant porté par des jeunes de 18-35 ans.",
      categorySlug: "financements",
      mode: "en_ligne",
      location: "Afrique Subsaharienne",
      deadlineDate: new Date("2026-09-01T23:59:00Z"),
      externalLink: "https://example.com/fonds-innovation",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=1200&fit=crop",
      tags: "nouveau,urgent,verifie",
      authorId: certifiedUsers[1].id,
    },
    {
      title: "Conférence IA & Afrique - UNESCO",
      description: "Conférence internationale sur l'intelligence artificielle et son impact en Afrique. Interventions d'experts mondiaux, tables rondes et ateliers pratiques.",
      categorySlug: "conferences",
      mode: "hybride",
      location: "Paris, France",
      deadlineDate: new Date("2026-07-10T23:59:00Z"),
      externalLink: "https://example.com/conf-ia-unesco",
      image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=1200&fit=crop",
      tags: "verifie",
      authorId: managers[0].id,
    },
    {
      title: "Hackathon Climat 48h - Solutions Vertes",
      description: "Hackathon de 48 heures pour développer des solutions technologiques face aux défis climatiques en Afrique. Prix de 10 000 USD pour la meilleure équipe.",
      categorySlug: "concours",
      mode: "hybride",
      location: "Nairobi, Kenya",
      deadlineDate: new Date("2026-06-25T23:59:00Z"),
      externalLink: "https://example.com/hackathon-climat",
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=1200&fit=crop",
      tags: "nouveau",
      authorId: regularUsers[1].id,
      status: "pending", // This one is pending to test filtering
    },
  ];

  const posts: { id: string }[] = [];
  for (const postData of postsData) {
    const post = await prisma.post.create({
      data: {
        ...postData,
        status: postData.status || "approved",
      },
    });
    posts.push(post);
  }
  console.log(`✅ Created ${posts.length} posts`);

  // ─── Articles ──────────────────────────────────────────────────
  const articlesData = [
    {
      title: "Les bourses francophones en forte hausse en 2026",
      content: "Selon une récente étude de l'OIF, le nombre de bourses destinées aux étudiants francophones a augmenté de 23% cette année, ouvrant de nouvelles perspectives pour les jeunes d'Afrique francophone. Cette hausse significative est attribuée à plusieurs facteurs, notamment l'augmentation des partenariats entre universités africaines et européennes, ainsi que les nouvelles politiques de coopération internationale.",
      images: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=250&fit=crop",
      status: "published",
      eventStatus: "ongoing",
      views: 4523,
      authorId: managers[1].id,
    },
    {
      title: "Comment réussir sa candidature pour un stage à l'étranger",
      content: "Nos conseils pratiques pour optimiser votre dossier de candidature et décrocher le stage de vos rêves hors de vos frontières. La préparation est la clé du succès : commencez par identifier vos objectifs, recherchez les entreprises qui correspondent à votre profil, et préparez un CV adapté au marché international.",
      images: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop",
      status: "published",
      eventStatus: "upcoming",
      views: 3201,
      authorId: certifiedUsers[1].id,
    },
    {
      title: "Afrika Tech Summit : le bilan de l'édition 2025",
      content: "Retour sur l'édition 2025 du plus grand sommet technologique africain avec plus de 200 startups présentées et 50 millions USD de deals conclus. Un événement marquant qui a démontré le potentiel croissant de l'écosystème tech africain.",
      images: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400&h=250&fit=crop",
      status: "published",
      eventStatus: "completed",
      views: 7891,
      authorId: managers[1].id,
    },
    {
      title: "Les métiers du numérique les plus recherchés en Afrique",
      content: "Data Scientist, DevOps, Cybersécurité... Découvrez les 10 profils numériques les plus demandés par les entreprises africaines en 2026. Le secteur du numérique continue de croître à un rythme soutenu sur le continent.",
      images: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=250&fit=crop",
      status: "published",
      eventStatus: "ongoing",
      views: 6234,
      authorId: certifiedUsers[0].id,
    },
    {
      title: "Financements : les nouveaux fonds pour les startups africaines",
      content: "Plus de 2 milliards USD ont été investis dans des startups africaines au premier trimestre 2026. Analyse des tendances et des secteurs porteurs. La fintech, la santé et l'éducation restent les secteurs les plus attractifs pour les investisseurs.",
      images: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=250&fit=crop",
      status: "published",
      eventStatus: "ongoing",
      views: 5678,
      authorId: regularUsers[1].id,
    },
    {
      title: "Guide complet des concours d'éloquence francophones",
      content: "Tous les concours de plaidoirie et d'éloquence ouverts aux francophones cette année : dates, modalités et conseils de préparation. Un guide indispensable pour tous ceux qui souhaitent se distinguer dans l'art oratoire.",
      images: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop",
      status: "draft",
      eventStatus: "upcoming",
      views: 3456,
      authorId: certifiedUsers[1].id,
    },
  ];

  for (const articleData of articlesData) {
    await prisma.article.create({ data: articleData });
  }
  console.log(`✅ Created ${articlesData.length} articles`);

  // ─── Likes ─────────────────────────────────────────────────────
  // Add likes to the first 8 approved posts from various users
  for (let i = 0; i < 8; i++) {
    const postId = posts[i].id;
    // Each post gets likes from some users
    const likers = allUsers.slice(2, 2 + 3 + (i % 4));
    for (const liker of likers) {
      try {
        await prisma.like.create({
          data: { postId, userId: liker.id },
        });
      } catch {
        // Skip duplicate likes
      }
    }
  }
  console.log("✅ Created sample likes");

  // ─── Comments ──────────────────────────────────────────────────
  const commentsData = [
    { postIndex: 0, userIdx: 2, content: "Super opportunité ! Je vais candidater." },
    { postIndex: 0, userIdx: 4, content: "Est-ce ouvert aux étudiants de niveau L2 ?" },
    { postIndex: 1, userIdx: 3, content: "J'ai déjà postulé, croisons les doigts ! 🤞" },
    { postIndex: 1, userIdx: 5, content: "Quels sont les critères de sélection ?" },
    { postIndex: 2, userIdx: 2, content: "Formation très complète, merci pour le partage !" },
    { postIndex: 3, userIdx: 4, content: "Excellente opportunité pour les développeurs juniors." },
    { postIndex: 4, userIdx: 3, content: "Wave est une super entreprise, bonne chance à tous !" },
    { postIndex: 5, userIdx: 5, content: "J'y serai ! Qui d'autre ? 🎉" },
    { postIndex: 6, userIdx: 2, content: "Enfin un fonds dédié aux jeunes innovateurs !" },
    { postIndex: 6, userIdx: 4, content: "Comment soumettre un projet ?" },
    { postIndex: 7, userIdx: 3, content: "La conférence sera-t-elle diffusée en ligne ?" },
  ];

  for (const c of commentsData) {
    await prisma.comment.create({
      data: {
        content: c.content,
        postId: posts[c.postIndex].id,
        authorId: allUsers[c.userIdx].id,
      },
    });
  }
  console.log(`✅ Created ${commentsData.length} comments`);

  // ─── Follows ───────────────────────────────────────────────────
  // Create some follow relationships
  const followsData = [
    { followerIdx: 2, followingIdx: 3 },
    { followerIdx: 2, followingIdx: 4 },
    { followerIdx: 3, followingIdx: 2 },
    { followerIdx: 4, followingIdx: 5 },
    { followerIdx: 5, followingIdx: 2 },
    { followerIdx: 5, followingIdx: 3 },
    { followerIdx: 6, followingIdx: 2 },
    { followerIdx: 6, followingIdx: 4 },
    { followerIdx: 7, followingIdx: 3 },
    { followerIdx: 7, followingIdx: 5 },
  ];

  for (const f of followsData) {
    try {
      await prisma.follow.create({
        data: {
          followerId: allUsers[f.followerIdx].id,
          followingId: allUsers[f.followingIdx].id,
        },
      });
    } catch {
      // Skip duplicates
    }
  }
  console.log(`✅ Created ${followsData.length} follows`);

  // ─── Notifications ─────────────────────────────────────────────
  const notificationsData = [
    { userId: certifiedUsers[2].id, type: "like", title: "Nouveau like", message: "Youssef Benali a aimé votre publication", link: `/posts/${posts[2].id}` },
    { userId: certifiedUsers[2].id, type: "comment", title: "Nouveau commentaire", message: "Karim Ousseini a commenté votre publication", link: `/posts/${posts[1].id}` },
    { userId: certifiedUsers[2].id, type: "new_opportunity", title: "Nouvelle opportunité", message: "Concours de plaidoirie : dernière semaine pour candidater !", link: `/posts/${posts[0].id}` },
    { userId: certifiedUsers[2].id, type: "follow", title: "Nouvel abonné", message: "Ibrahim Keita a commencé à vous suivre" },
    { userId: certifiedUsers[2].id, type: "deadline_reminder", title: "Rappel deadline", message: "Bourse Montréal : 2 jours restants pour postuler", link: `/posts/${posts[1].id}`, isRead: true },
    { userId: regularUsers[0].id, type: "like", title: "Nouveau like", message: "Amina Diallo a aimé votre publication", link: `/posts/${posts[6].id}`, isRead: true },
    { userId: regularUsers[0].id, type: "post_approved", title: "Publication approuvée", message: "Votre publication a été approuvée par un administrateur", isRead: true },
  ];

  for (const n of notificationsData) {
    await prisma.notification.create({
      data: {
        ...n,
        isRead: n.isRead || false,
      },
    });
  }
  console.log(`✅ Created ${notificationsData.length} notifications`);

  // ─── Ads ───────────────────────────────────────────────────────
  const adsData = [
    {
      title: "Master en Intelligence Artificielle",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=1400&fit=crop",
      link: "https://example.com/master-ia",
      type: "flyer",
      targetAudience: "all",
      isActive: true,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      impressions: 15000,
      clicks: 450,
    },
    {
      title: "Wave recrute !",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=1400&fit=crop",
      link: "https://example.com/wave-recrutement",
      type: "image",
      targetAudience: "all",
      isActive: true,
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-09-30"),
      impressions: 12000,
      clicks: 380,
    },
  ];

  for (const adData of adsData) {
    await prisma.ad.create({ data: adData });
  }
  console.log(`✅ Created ${adsData.length} ads`);

  // ─── Saved Posts ───────────────────────────────────────────────
  const savedPostsData = [
    { userIdx: 2, postIdx: 1 },
    { userIdx: 2, postIdx: 5 },
    { userIdx: 3, postIdx: 0 },
    { userIdx: 4, postIdx: 3 },
    { userIdx: 5, postIdx: 6 },
  ];

  for (const s of savedPostsData) {
    await prisma.savedPost.create({
      data: {
        userId: allUsers[s.userIdx].id,
        postId: posts[s.postIdx].id,
      },
    });
  }
  console.log(`✅ Created ${savedPostsData.length} saved posts`);

  console.log("\n🎉 Seeding complete!");
  console.log("\n📋 Test Accounts:");
  console.log("  Admin:    admin@oppy.com / admin123");
  console.log("  Manager:  manager1@oppy.com / password123");
  console.log("  Manager:  manager2@oppy.com / password123");
  console.log("  Certified: karim@oppy.com / password123");
  console.log("  Certified: ibrahim@oppy.com / password123");
  console.log("  Certified: amina@oppy.com / password123");
  console.log("  User:     fatou@oppy.com / password123");
  console.log("  User:     aicha@oppy.com / password123");
  console.log("  User:     omar@oppy.com / password123");
  console.log("  User:     kadiatou@oppy.com / password123");
  console.log("  User:     moussa@oppy.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
