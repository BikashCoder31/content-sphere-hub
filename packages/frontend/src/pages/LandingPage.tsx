import { Link } from 'react-router-dom';
import {
  FileText,
  Video,
  MessageCircle,
  Mic,
  BarChart3,
  Shield,
  Zap,
  Globe,
  Users,
  Lock,
  Palette,
  Search,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Logo } from '@/components/ui';

/**
 * Animated glowing sphere component with floating icons
 */
function GlowingSphere() {
  return (
    <div className="relative w-80 h-80 md:w-96 md:h-96">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
      
      {/* Main sphere with grid lines */}
      <div className="absolute inset-4 rounded-full border-2 border-emerald-500/30 animate-spin-slow">
        {/* Horizontal lines */}
        <div className="absolute top-1/4 left-0 right-0 border-t border-emerald-500/20" />
        <div className="absolute top-1/2 left-0 right-0 border-t border-emerald-500/30" />
        <div className="absolute top-3/4 left-0 right-0 border-t border-emerald-500/20" />
        {/* Vertical lines */}
        <div className="absolute left-1/4 top-0 bottom-0 border-l border-emerald-500/20" />
        <div className="absolute left-1/2 top-0 bottom-0 border-l border-emerald-500/30" />
        <div className="absolute left-3/4 top-0 bottom-0 border-l border-emerald-500/20" />
      </div>
      
      {/* Inner sphere */}
      <div className="absolute inset-8 rounded-full border border-emerald-400/40 bg-gradient-to-br from-emerald-500/10 to-transparent" />
      
      {/* Center glow */}
      <div className="absolute inset-16 rounded-full bg-emerald-500/20 blur-xl" />
      
      {/* Floating icons around the sphere */}
      <div className="absolute top-4 left-1/4 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 animate-float-1">
        <FileText className="w-5 h-5 text-emerald-400" />
      </div>
      <div className="absolute top-8 right-4 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 animate-float-2">
        <Video className="w-5 h-5 text-emerald-400" />
      </div>
      <div className="absolute top-1/3 right-0 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 animate-float-3">
        <MessageCircle className="w-5 h-5 text-emerald-400" />
      </div>
      <div className="absolute bottom-1/4 right-8 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 animate-float-1">
        <BarChart3 className="w-5 h-5 text-emerald-400" />
      </div>
      <div className="absolute bottom-8 left-1/4 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 animate-float-2">
        <Mic className="w-5 h-5 text-emerald-400" />
      </div>
      <div className="absolute top-1/2 left-0 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 animate-float-3">
        <Globe className="w-5 h-5 text-emerald-400" />
      </div>
      
      {/* Connection dots */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
          style={{
            top: `${20 + Math.random() * 60}%`,
            left: `${20 + Math.random() * 60}%`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Feature card component
 */
function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6 text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/**
 * Stat card component
 */
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
        {value}
      </div>
      <div className="text-gray-400 mt-2">{label}</div>
    </div>
  );
}

/**
 * Landing page with dark theme and glowing sphere aesthetic
 */
export function LandingPage() {
  const features = [
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: '75 granular permissions with 6 predefined roles. Control exactly who can do what.',
    },
    {
      icon: Zap,
      title: 'TipTap Editor',
      description: 'Rich text editing with media embedding, code blocks, tables, and real-time collaboration.',
    },
    {
      icon: Globe,
      title: 'SEO Optimized',
      description: 'Built-in meta management, Open Graph, Twitter Cards, and structured data support.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Content versioning, revision history, and approval workflows for teams.',
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      description: 'JWT authentication, rate limiting, input validation, and audit logging.',
    },
    {
      icon: Palette,
      title: 'Dark Mode',
      description: 'System preference detection with seamless light/dark theme switching.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          <Logo size="lg" />
          <span className="text-xl font-bold">Content Sphere Hub</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 md:px-12 pt-12 md:pt-20 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                Enterprise-Grade CMS
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                <span className="text-white">CONTENT</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400">
                  SPHERE HUB
                </span>
              </h1>
              
              <p className="text-xl text-gray-400 mb-8 max-w-lg mx-auto lg:mx-0">
                <span className="text-emerald-400 font-semibold">EXPLORE.</span>{' '}
                <span className="text-cyan-400 font-semibold">CREATE.</span>{' '}
                <span className="text-emerald-400 font-semibold">CONNECT.</span>
              </p>
              
              <p className="text-gray-500 mb-10 max-w-lg mx-auto lg:mx-0">
                A powerful, modern content management system built with React, Node.js, and MongoDB. 
                Manage your content with enterprise-grade security and beautiful user experience.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold text-lg hover:shadow-xl hover:shadow-emerald-500/25 transition-all"
                >
                  Start Creating
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-gray-700 text-gray-300 font-semibold text-lg hover:border-emerald-500/50 hover:text-white transition-all"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Right content - Glowing sphere */}
            <div className="flex justify-center lg:justify-end">
              <GlowingSphere />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 md:px-12 py-16 border-y border-gray-800/50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard value="75+" label="Permissions" />
          <StatCard value="6" label="User Roles" />
          <StatCard value="∞" label="Content Items" />
          <StatCard value="24/7" label="Availability" />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 md:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Manage Content
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Built for teams who demand powerful features, enterprise security, and beautiful design.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 md:px-12 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
            
            {/* Content */}
            <div className="relative px-8 md:px-16 py-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Content Workflow?
              </h2>
              <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of content creators and teams who trust Content Sphere Hub for their content management needs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-emerald-600 font-semibold text-lg hover:shadow-xl transition-all"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Create Free Account
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold text-lg hover:bg-white/10 transition-all"
                >
                  <Search className="w-5 h-5" />
                  Explore Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 md:px-12 py-12 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Logo size="md" />
              <span className="font-semibold">Content Sphere Hub</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 Content Sphere Hub. Built with ❤️ using React, Node.js, and MongoDB.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
