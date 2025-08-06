// src/app/[locale]/help/page.tsx
"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { FAQAccordion } from "../../../components/help/FAQAccordion";
import { 
  MessageCircle, 
  Video, 
  Download,
  HelpCircle,
  Mail,
  Phone,
  Clock,
  ExternalLink,
  BookOpen,
  Users,
  Zap,
  Shield
} from "lucide-react";

const translations = {
  en: {
    hero: {
      title: "Help Center",
      subtitle: "Get the support you need to make the most of SYNAPSE. Find answers, learn new features, and get expert assistance.",
      badge: "24/7 Support Available"
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Find quick answers to the most common questions about SYNAPSE.",
      items: [
        {
          question: "How do I get started with SYNAPSE?",
          answer: "Getting started is easy! Simply sign up for an account, upload your network data, and use our intuitive dashboard to create your first visualization. Our onboarding wizard will guide you through each step."
        },
        {
          question: "What file formats does SYNAPSE support?",
          answer: "SYNAPSE supports a wide variety of formats including CSV, JSON, GraphML, GEXF, and direct database connections. You can also use our API to stream data in real-time."
        },
        {
          question: "How secure is my data in SYNAPSE?",
          answer: "Your data security is our top priority. We use enterprise-grade encryption, comply with GDPR and SOC 2 standards, and never share your data with third parties. All data is processed securely in the cloud or on-premises based on your preference."
        },
        {
          question: "Can I collaborate with my team on SYNAPSE?",
          answer: "Absolutely! SYNAPSE offers robust team collaboration features including shared workspaces, role-based permissions, real-time editing, and commenting. You can invite team members and control their access levels."
        },
        {
          question: "What kind of support do you offer?",
          answer: "We provide 24/7 customer support through live chat, email, and phone. Premium users get priority support with dedicated account managers. We also offer extensive documentation, video tutorials, and community forums."
        },
        {
          question: "How does pricing work?",
          answer: "We offer flexible pricing plans based on your needs - from individual researchers to enterprise organizations. All plans include core features, with advanced analytics and team collaboration available in higher tiers. Contact us for custom enterprise pricing."
        },
        {
          question: "Can I export my visualizations and data?",
          answer: "Yes! You can export your visualizations in multiple formats (PNG, SVG, PDF) and export your processed data in CSV, Excel, or JSON formats. All exports maintain high quality for presentations and publications."
        },
        {
          question: "Do you offer training and onboarding?",
          answer: "We provide comprehensive onboarding for all new users, including personalized training sessions for enterprise customers. We also offer workshops, webinars, and certification programs to help you master advanced features."
        }
      ]
    },
    resources: {
      title: "Additional Resources",
      subtitle: "Explore our comprehensive learning materials and community resources.",
      items: [
        {
          icon: "Video",
          title: "Video Tutorials",
          description: "Step-by-step video guides covering all SYNAPSE features, from basics to advanced techniques.",
          link: "Watch Tutorials",
          color: "from-red-500 to-pink-500"
        },
        {
          icon: "BookOpen",
          title: "Documentation",
          description: "Complete technical documentation, API reference, and integration guides for developers.",
          link: "View Documentation",
          color: "from-blue-500 to-cyan-500"
        },
        {
          icon: "Users",
          title: "Community Forum",
          description: "Connect with other users, share best practices, and get answers from the community.",
          link: "Join Community",
          color: "from-green-500 to-emerald-500"
        },
        {
          icon: "Download",
          title: "Resource Library",
          description: "Download templates, examples, and sample datasets to jumpstart your projects.",
          link: "Browse Resources",
          color: "from-purple-500 to-violet-500"
        }
      ]
    },
    contact: {
      title: "Still Need Help?",
      subtitle: "Our expert support team is here to assist you with any questions or challenges.",
      options: [
        {
          icon: "MessageCircle",
          title: "Live Chat",
          description: "Get instant help from our support specialists. Available 24/7 for all users.",
          availability: "Available Now",
          action: "Start Chat",
          color: "from-blue-500 to-cyan-500"
        },
        {
          icon: "Mail",
          title: "Email Support",
          description: "Send us a detailed message and get a comprehensive response from our experts.",
          availability: "Response within 2 hours",
          action: "Send Email",
          color: "from-green-500 to-emerald-500"
        },
        {
          icon: "Phone",
          title: "Phone Support",
          description: "Speak directly with our technical experts for urgent issues and complex problems.",
          availability: "Mon-Fri 9AM-6PM EST",
          action: "Schedule Call",
          color: "from-purple-500 to-violet-500"
        }
      ]
    }
  },
  fr: {
    hero: {
      title: "Centre d'Aide",
      subtitle: "Obtenez le support dont vous avez besoin pour tirer le meilleur parti de SYNAPSE. Trouvez des réponses, apprenez de nouvelles fonctionnalités et obtenez une assistance d'expert.",
      badge: "Support 24/7 Disponible"
    },
    faq: {
      title: "Questions Fréquemment Posées",
      subtitle: "Trouvez des réponses rapides aux questions les plus courantes sur SYNAPSE.",
      items: [
        {
          question: "Comment commencer avec SYNAPSE ?",
          answer: "Commencer est facile ! Inscrivez-vous simplement pour un compte, téléchargez vos données de réseau, et utilisez notre tableau de bord intuitif pour créer votre première visualisation. Notre assistant d'intégration vous guidera à travers chaque étape."
        },
        {
          question: "Quels formats de fichiers SYNAPSE supporte-t-il ?",
          answer: "SYNAPSE supporte une grande variété de formats incluant CSV, JSON, GraphML, GEXF, et les connexions directes aux bases de données. Vous pouvez aussi utiliser notre API pour diffuser des données en temps réel."
        },
        {
          question: "À quel point mes données sont-elles sécurisées dans SYNAPSE ?",
          answer: "La sécurité de vos données est notre priorité absolue. Nous utilisons un chiffrement de niveau entreprise, nous conformons aux standards GDPR et SOC 2, et ne partageons jamais vos données avec des tiers."
        },
        {
          question: "Puis-je collaborer avec mon équipe sur SYNAPSE ?",
          answer: "Absolument ! SYNAPSE offre des fonctionnalités robustes de collaboration d'équipe incluant des espaces de travail partagés, des permissions basées sur les rôles, l'édition en temps réel, et les commentaires."
        },
        {
          question: "Quel type de support offrez-vous ?",
          answer: "Nous fournissons un support client 24/7 via chat en direct, email, et téléphone. Les utilisateurs premium obtiennent un support prioritaire avec des gestionnaires de compte dédiés."
        },
        {
          question: "Comment fonctionne la tarification ?",
          answer: "Nous offrons des plans de tarification flexibles basés sur vos besoins - des chercheurs individuels aux organisations d'entreprise. Tous les plans incluent les fonctionnalités de base."
        },
        {
          question: "Puis-je exporter mes visualisations et données ?",
          answer: "Oui ! Vous pouvez exporter vos visualisations dans plusieurs formats (PNG, SVG, PDF) et exporter vos données traitées en formats CSV, Excel, ou JSON."
        },
        {
          question: "Offrez-vous de la formation et de l'intégration ?",
          answer: "Nous fournissons une intégration complète pour tous les nouveaux utilisateurs, incluant des sessions de formation personnalisées pour les clients d'entreprise."
        }
      ]
    },
    resources: {
      title: "Ressources Supplémentaires",
      subtitle: "Explorez nos matériaux d'apprentissage complets et ressources communautaires.",
      items: [
        {
          icon: "Video",
          title: "Tutoriels Vidéo",
          description: "Guides vidéo étape par étape couvrant toutes les fonctionnalités SYNAPSE, des bases aux techniques avancées.",
          link: "Voir les Tutoriels",
          color: "from-red-500 to-pink-500"
        },
        {
          icon: "BookOpen",
          title: "Documentation",
          description: "Documentation technique complète, référence API, et guides d'intégration pour les développeurs.",
          link: "Voir la Documentation",
          color: "from-blue-500 to-cyan-500"
        },
        {
          icon: "Users",
          title: "Forum Communauté",
          description: "Connectez-vous avec d'autres utilisateurs, partagez les meilleures pratiques, et obtenez des réponses de la communauté.",
          link: "Rejoindre la Communauté",
          color: "from-green-500 to-emerald-500"
        },
        {
          icon: "Download",
          title: "Bibliothèque de Ressources",
          description: "Téléchargez des modèles, exemples, et jeux de données d'exemple pour démarrer vos projets.",
          link: "Parcourir les Ressources",
          color: "from-purple-500 to-violet-500"
        }
      ]
    },
    contact: {
      title: "Besoin d'Aide Supplémentaire ?",
      subtitle: "Notre équipe de support experte est là pour vous aider avec toutes questions ou défis.",
      options: [
        {
          icon: "MessageCircle",
          title: "Chat en Direct",
          description: "Obtenez une aide instantanée de nos spécialistes du support. Disponible 24/7 pour tous les utilisateurs.",
          availability: "Disponible Maintenant",
          action: "Démarrer le Chat",
          color: "from-blue-500 to-cyan-500"
        },
        {
          icon: "Mail",
          title: "Support Email",
          description: "Envoyez-nous un message détaillé et obtenez une réponse complète de nos experts.",
          availability: "Réponse sous 2 heures",
          action: "Envoyer un Email",
          color: "from-green-500 to-emerald-500"
        },
        {
          icon: "Phone",
          title: "Support Téléphonique",
          description: "Parlez directement avec nos experts techniques pour les problèmes urgents et complexes.",
          availability: "Lun-Ven 9h-18h EST",
          action: "Planifier un Appel",
          color: "from-purple-500 to-violet-500"
        }
      ]
    }
  }
} as const;

const iconMap = {
  Video,
  Download,
  MessageCircle,
  HelpCircle,
  Mail,
  Phone,
  Clock,
  BookOpen,
  Users,
  Zap,
  Shield
};

export default function HelpPage() {
  const locale = useLocale();
  const t = translations[locale as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 bg-gradient-to-br from-background via-slate-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <div className="container mx-auto text-center">
          <div className="fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full border border-purple-200 dark:border-purple-700 mb-8">
              <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">{t.hero.badge}</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              {t.hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-black-600 dark:text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              {t.hero.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              {t.faq.title}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t.faq.subtitle}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              <FAQAccordion items={t.faq.items} />
            </Card>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              {t.resources.title}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t.resources.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.resources.items.map((resource, index) => {
              const IconComponent = iconMap[resource.icon as keyof typeof iconMap];
              
              return (
                <Card 
                  key={index} 
                  className="p-8 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${resource.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {resource.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    {resource.description}
                  </p>
                  
                  <div className="flex items-center justify-center text-purple-600 dark:text-purple-400 font-medium group-hover:translate-x-2 transition-transform duration-300">
                    <span>{resource.link}</span>
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700">
        <div className="container mx-auto text-center text-white">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t.contact.title}
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              {t.contact.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {t.contact.options.map((option, index) => {
              const IconComponent = iconMap[option.icon as keyof typeof iconMap];
              
              return (
                <Card 
                  key={index} 
                  className="p-8 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer group"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${option.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 text-white">
                    {option.title}
                  </h3>
                  <p className="text-white/80 mb-4 leading-relaxed">
                    {option.description}
                  </p>
                  <div className="text-sm text-white/70 mb-6 flex items-center justify-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {option.availability}
                  </div>
                  <button className="w-full px-6 py-3 bg-white text-purple-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-300 hover:scale-105 transform">
                    {option.action}
                  </button>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}