// src/app/[locale]/help/page.tsx
"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { 
  Search, 
  Book, 
  MessageCircle, 
  Video, 
  Download,
  HelpCircle,
  Lightbulb,
  Settings,
  BarChart,
  Shield,
  Users,
  Globe,
  ChevronRight,
  ExternalLink,
  Clock,
  Star
} from "lucide-react";

const translations = {
  en: {
    hero: {
      title: "Help Center",
      subtitle: "Find answers to your questions and learn how to get the most out of SYNAPSE.",
      searchPlaceholder: "Search for help articles..."
    },
    categories: {
      title: "Browse by Category",
      items: [
        {
          icon: "Book",
          title: "Getting Started",
          description: "Learn the basics and set up your first network analysis",
          count: 12,
          color: "blue"
        },
        {
          icon: "BarChart",
          title: "Analytics & Reports",
          description: "Understanding your data and creating meaningful reports",
          count: 18,
          color: "green"
        },
        {
          icon: "Settings",
          title: "Account & Settings",
          description: "Manage your account, billing, and preferences",
          count: 8,
          color: "purple"
        },
        {
          icon: "Shield",
          title: "Security & Privacy",
          description: "Keep your data safe and understand our security measures",
          count: 6,
          color: "red"
        },
        {
          icon: "Users",
          title: "Team Management",
          description: "Collaborate with your team and manage permissions",
          count: 10,
          color: "orange"
        },
        {
          icon: "Globe",
          title: "API & Integrations",
          description: "Connect SYNAPSE with your existing tools and workflows",
          count: 15,
          color: "teal"
        }
      ]
    },
    popular: {
      title: "Popular Articles",
      items: [
        {
          title: "How to create your first network visualization",
          category: "Getting Started",
          readTime: "5 min read",
          rating: 4.8
        },
        {
          title: "Understanding network metrics and KPIs",
          category: "Analytics & Reports",
          readTime: "8 min read",
          rating: 4.9
        },
        {
          title: "Setting up team permissions and roles",
          category: "Team Management",
          readTime: "3 min read",
          rating: 4.7
        },
        {
          title: "Exporting data and reports",
          category: "Analytics & Reports",
          readTime: "4 min read",
          rating: 4.6
        },
        {
          title: "Connecting external data sources",
          category: "API & Integrations",
          readTime: "12 min read",
          rating: 4.8
        }
      ]
    },
    resources: {
      title: "Additional Resources",
      items: [
        {
          icon: "Video",
          title: "Video Tutorials",
          description: "Step-by-step video guides for all features",
          link: "Watch Videos"
        },
        {
          icon: "Download",
          title: "Documentation",
          description: "Complete technical documentation and API reference",
          link: "View Docs"
        },
        {
          icon: "MessageCircle",
          title: "Community Forum",
          description: "Connect with other users and share best practices",
          link: "Join Forum"
        }
      ]
    },
    contact: {
      title: "Still Need Help?",
      subtitle: "Our support team is here to assist you 24/7",
      options: [
        {
          title: "Live Chat",
          description: "Get instant help from our support team",
          available: "Available now",
          action: "Start Chat"
        },
        {
          title: "Email Support",
          description: "Send us a detailed message and we'll respond within 4 hours",
          available: "Response in 4h",
          action: "Send Email"
        },
        {
          title: "Phone Support",
          description: "Call us directly for urgent issues",
          available: "Mon-Fri 9AM-6PM EST",
          action: "Call Now"
        }
      ]
    }
  },
  fr: {
    hero: {
      title: "Centre d'Aide",
      subtitle: "Trouvez des réponses à vos questions et apprenez à tirer le meilleur parti de SYNAPSE.",
      searchPlaceholder: "Rechercher des articles d'aide..."
    },
    categories: {
      title: "Parcourir par Catégorie",
      items: [
        {
          icon: "Book",
          title: "Premiers Pas",
          description: "Apprenez les bases et configurez votre première analyse de réseau",
          count: 12,
          color: "blue"
        },
        {
          icon: "BarChart",
          title: "Analyses & Rapports",
          description: "Comprendre vos données et créer des rapports significatifs",
          count: 18,
          color: "green"
        },
        {
          icon: "Settings",
          title: "Compte & Paramètres",
          description: "Gérez votre compte, facturation et préférences",
          count: 8,
          color: "purple"
        },
        {
          icon: "Shield",
          title: "Sécurité & Confidentialité",
          description: "Gardez vos données en sécurité et comprenez nos mesures de sécurité",
          count: 6,
          color: "red"
        },
        {
          icon: "Users",
          title: "Gestion d'Équipe",
          description: "Collaborez avec votre équipe et gérez les permissions",
          count: 10,
          color: "orange"
        },
        {
          icon: "Globe",
          title: "API & Intégrations",
          description: "Connectez SYNAPSE avec vos outils et workflows existants",
          count: 15,
          color: "teal"
        }
      ]
    },
    popular: {
      title: "Articles Populaires",
      items: [
        {
          title: "Comment créer votre première visualisation de réseau",
          category: "Premiers Pas",
          readTime: "5 min de lecture",
          rating: 4.8
        },
        {
          title: "Comprendre les métriques et KPIs de réseau",
          category: "Analyses & Rapports",
          readTime: "8 min de lecture",
          rating: 4.9
        },
        {
          title: "Configurer les permissions et rôles d'équipe",
          category: "Gestion d'Équipe",
          readTime: "3 min de lecture",
          rating: 4.7
        },
        {
          title: "Exporter des données et rapports",
          category: "Analyses & Rapports",
          readTime: "4 min de lecture",
          rating: 4.6
        },
        {
          title: "Connecter des sources de données externes",
          category: "API & Intégrations",
          readTime: "12 min de lecture",
          rating: 4.8
        }
      ]
    },
    resources: {
      title: "Ressources Supplémentaires",
      items: [
        {
          icon: "Video",
          title: "Tutoriels Vidéo",
          description: "Guides vidéo étape par étape pour toutes les fonctionnalités",
          link: "Voir les Vidéos"
        },
        {
          icon: "Download",
          title: "Documentation",
          description: "Documentation technique complète et référence API",
          link: "Voir les Docs"
        },
        {
          icon: "MessageCircle",
          title: "Forum Communauté",
          description: "Connectez-vous avec d'autres utilisateurs et partagez les meilleures pratiques",
          link: "Rejoindre le Forum"
        }
      ]
    },
    contact: {
      title: "Besoin d'Aide Supplémentaire ?",
      subtitle: "Notre équipe de support est là pour vous assister 24/7",
      options: [
        {
          title: "Chat en Direct",
          description: "Obtenez une aide instantanée de notre équipe de support",
          available: "Disponible maintenant",
          action: "Démarrer le Chat"
        },
        {
          title: "Support Email",
          description: "Envoyez-nous un message détaillé et nous répondrons dans les 4 heures",
          available: "Réponse en 4h",
          action: "Envoyer un Email"
        },
        {
          title: "Support Téléphonique",
          description: "Appelez-nous directement pour les problèmes urgents",
          available: "Lun-Ven 9h-18h EST",
          action: "Appeler Maintenant"
        }
      ]
    }
  }
} as const;

const iconMap = {
  Book,
  BarChart,
  Settings,
  Shield,
  Users,
  Globe,
  Video,
  Download,
  MessageCircle,
  HelpCircle,
  Lightbulb
};

const colorClasses = {
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600",
  purple: "from-purple-500 to-purple-600",
  red: "from-red-500 to-red-600",
  orange: "from-orange-500 to-orange-600",
  teal: "from-teal-500 to-teal-600"
};

export default function HelpPage() {
  const locale = useLocale();
  const t = translations[locale as keyof typeof translations] || translations.en;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredArticles = t.popular.items.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabItems = [
    {
      id: "all",
      label: "All Articles",
      content: (
        <div className="space-y-4">
          {filteredArticles.map((article, index) => (
            <Card key={index} className="p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {article.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <Badge variant="secondary" size="sm">
                      {article.category}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{article.readTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{article.rating}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          ))}
        </div>
      )
    },
    {
      id: "getting-started",
      label: "Getting Started",
      content: (
        <div className="text-center py-12">
          <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Getting Started Articles
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Filtered articles for getting started would appear here
          </p>
        </div>
      )
    },
    {
      id: "analytics",
      label: "Analytics",
      content: (
        <div className="text-center py-12">
          <BarChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Analytics Articles
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Filtered articles for analytics would appear here
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 bg-gradient-to-br from-white via-gray-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <div className="container mx-auto text-center">
          <div className="fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#1e0546]/10 to-[#8e43ff]/10 rounded-full border border-[#8e43ff]/20 mb-8">
              <HelpCircle className="w-4 h-4 text-[#8e43ff] mr-2" />
              <span className="text-sm font-medium text-[#8e43ff]">24/7 Support Available</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              {t.hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              {t.hero.subtitle}
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <Input
                icon={Search}
                placeholder={t.hero.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-lg py-4"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              {t.categories.title}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.categories.items.map((category, index) => {
              const IconComponent = iconMap[category.icon as keyof typeof iconMap];
              const colorClass = colorClasses[category.color as keyof typeof colorClasses];
              
              return (
                <Card 
                  key={index} 
                  className="p-8 hover:scale-105 transition-all duration-300 cursor-pointer group"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${colorClass} rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg transition-all duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {category.title}
                    </h3>
                    <Badge variant="secondary" size="sm">
                      {category.count}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center text-[#8e43ff] font-medium group-hover:translate-x-2 transition-transform duration-300">
                    <span>Explore</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              {t.popular.title}
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <Tabs items={tabItems} defaultTab="all" />
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              {t.resources.title}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {t.resources.items.map((resource, index) => {
              const IconComponent = iconMap[resource.icon as keyof typeof iconMap];
              
              return (
                <Card 
                  key={index} 
                  className="p-8 text-center hover:scale-105 transition-all duration-300 cursor-pointer group"
                >
                  <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-brand transition-all duration-300">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {resource.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    {resource.description}
                  </p>
                  
                  <div className="flex items-center justify-center text-[#8e43ff] font-medium group-hover:translate-x-2 transition-transform duration-300">
                    <span>{resource.link}</span>
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#1e0546] to-[#8e43ff]">
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
            {t.contact.options.map((option, index) => (
              <Card 
                key={index} 
                className="p-8 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <h3 className="text-xl font-bold mb-3 text-white">
                  {option.title}
                </h3>
                <p className="text-white/80 mb-4 leading-relaxed">
                  {option.description}
                </p>
                <div className="text-sm text-white/60 mb-6">
                  {option.available}
                </div>
                <button className="w-full px-6 py-3 bg-white text-[#1e0546] font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-300">
                  {option.action}
                </button>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}