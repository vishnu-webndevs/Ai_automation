"use client";
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Globe, 
  Users, 
  Target, 
  Award, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Lock,
  Workflow,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const About: React.FC = () => {
  const stats = [
    { label: "Automation Accuracy", value: "99.9%", desc: "Precision in executed AI workflows" },
    { label: "Workflows Executed", value: "500K+", desc: "Across diverse enterprise systems" },
    { label: "Global Enterprise Clients", value: "50+", desc: "Trusting Totan AI daily" },
    { label: "Uptime & Reliability", value: "99.99%", desc: "24/7 continuous operation" }
  ];

  const values = [
    {
      icon: ShieldCheck,
      title: 'Security-First Architecture',
      desc: 'We embed enterprise-grade encryption, zero-trust protocols, and RBAC into every AI pipeline to safeguard your critical data.'
    },
    {
      icon: Cpu,
      title: 'Cutting-Edge AI Models',
      desc: 'Leveraging fine-tuned LLMs, neural networks, and custom agentic frameworks tailored specifically for high-throughput business logic.'
    },
    {
      icon: Workflow,
      title: 'Seamless API Integration',
      desc: 'Connect effortlessly with CRM, ERP, cloud databases, and legacy backend systems through unified, event-driven connectors.'
    },
    {
      icon: Target,
      title: 'Measurable ROI & Speed',
      desc: 'Reduce operational cycle times by up to 80% while scaling capacity without proportional overhead costs.'
    },
    {
      icon: Lock,
      title: 'Compliance & Governance',
      desc: 'Built with GDPR, SOC 2, and HIPAA compliance frameworks in mind, giving you total auditing visibility.'
    },
    {
      icon: Sparkles,
      title: 'Continuous Optimization',
      desc: 'Our autonomous agents adapt to changing data patterns and continuously learn to optimize execution speeds.'
    }
  ];

  const team = [
    {
      name: "Alexander Wright",
      role: "Founder & Chief Executive Officer",
      bio: "12+ years pioneering enterprise AI architectures and cloud automation infrastructure.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
    },
    {
      name: "Dr. Elena Rostova",
      role: "Head of AI Research & Models",
      bio: "PhD in Neural Networks with extensive research in LLM fine-tuning and multi-agent coordination.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
    },
    {
      name: "Marcus Vance",
      role: "VP of Enterprise Security",
      bio: "Former cybersecurity strategist specializing in API gateway defense and zero-trust systems.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
    },
    {
      name: "Sophia Chen",
      role: "Principal Automation Architect",
      bio: "Expert in high-concurrency event pipelines, microservices, and distributed workflow engines.",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80"
    }
  ];

  const faqs = [
    {
      q: "What makes Totan AI different from traditional workflow automation tools?",
      a: "Unlike static rule-based tools, Totan AI deploys context-aware autonomous AI agents that analyze unstructured data, make intelligent decisions, and continuously adapt to complex business workflows."
    },
    {
      q: "How fast can Totan AI be deployed into our existing infrastructure?",
      a: "Our modular REST/GraphQL APIs and pre-built enterprise connectors allow most clients to integrate and launch active automation agents within days rather than months."
    },
    {
      q: "Is our proprietary data used to train public AI models?",
      a: "No. Your data remains strictly isolated within your private dedicated tenant. We enforce strict data privacy, enterprise zero-retention policies, and private model instances."
    },
    {
      q: "What support and SLAs does Totan AI offer for enterprise accounts?",
      a: "We provide 24/7 dedicated engineering support, 99.99% uptime SLAs, custom agent development, and dedicated account managers for enterprise partners."
    }
  ];

  return (
    <div className="bg-slate-950 text-slate-200 min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      
      {/* 1. Hero Section */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center mb-24 relative"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[350px] bg-purple-600/15 blur-[140px] rounded-full pointer-events-none -z-10" />

        <motion.span 
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 mb-6"
        >
          <Sparkles size={14} /> Pioneering Intelligent Enterprise Automation
        </motion.span>

        <motion.h1 
          variants={itemVariants}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 mb-6 tracking-tight max-w-4xl mx-auto leading-tight"
        >
          Transforming Operations Through Custom AI Agents & Autonomous Pipelines
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          Totan AI empowers forward-thinking enterprises with secure, high-performance artificial intelligence solutions. We replace manual operational bottlenecks with scalable, self-learning AI agents built for extreme speed and precision.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
          <Link
            to="/contact-us"
            className="px-8 py-3.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-2 transition-all shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:scale-105 active:scale-95"
          >
            <span>Partner With Us</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/services"
            className="px-8 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-medium transition-all hover:scale-105"
          >
            Explore Services
          </Link>
        </motion.div>
      </motion.section>

      {/* 2. Stats Grid */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24 p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md"
      >
        {stats.map((stat, i) => (
          <div key={i} className="text-center p-4 border-r border-slate-800/80 last:border-r-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-1">
              {stat.value}
            </div>
            <div className="text-sm font-semibold text-white mb-1">{stat.label}</div>
            <div className="text-xs text-slate-400">{stat.desc}</div>
          </div>
        ))}
      </motion.section>

      {/* 3. Our Story & Vision */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-28">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            <Globe size={14} /> Our Vision & Origins
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            Built to Solve Complex Enterprise Bottlenecks with AI Integrity
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Founded with the conviction that AI shouldn't just generate text but actively execute complex business logic, Totan AI was created by software security architects and machine learning engineers. 
          </p>
          <p className="text-slate-400 leading-relaxed">
            We recognized that standard automation tools were too rigid, while generic LLM integrations lacked the security, determinism, and API resilience required by enterprise operations. Totan AI bridges this gap with custom-engineered agentic systems.
          </p>

          <div className="pt-4 space-y-3">
            {[
              "Enterprise-grade security and zero-trust data privacy",
              "Custom autonomous agents built around your exact business rules",
              "Real-time event processing with multi-layer fault tolerance"
            ].map((point, idx) => (
              <div key={idx} className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 size={18} className="text-purple-400 shrink-0" />
                <span className="text-sm font-medium">{point}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20 p-8 sm:p-10 rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden group"
        >
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-500/10 blur-[100px] rounded-full group-hover:bg-purple-500/20 transition-all duration-700" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
                <Award size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Enterprise Commitment</h3>
                <p className="text-xs text-slate-400">Delivering uncompromised performance</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="text-sm font-semibold text-purple-400">Our Core Mission</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                "To accelerate global business productivity by deploying intelligent AI agents that automate repetitive cognitive tasks with 100% data privacy and enterprise reliability."
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-xs text-slate-400">Autonomous Execution</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="text-2xl font-bold text-purple-400">Zero</div>
                <div className="text-xs text-slate-400">Data Retention Leakage</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 4. Core Pillars / Values */}
      <section className="mb-28">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3.5 py-1.5 rounded-full border border-purple-500/20">
            Why Totan AI
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-4">
            Engineered for Modern Enterprise Scale
          </h2>
          <p className="text-slate-400 text-base">
            Our architectural pillars ensure your company receives state-of-the-art AI automation without operational compromise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
                className="bg-slate-900/60 border border-slate-800/80 p-8 rounded-2xl hover:border-purple-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5 group"
              >
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 w-fit mb-6 group-hover:scale-110 transition-transform">
                  <IconComponent size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 5. Team Section */}
      <section className="mb-28">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3.5 py-1.5 rounded-full border border-blue-500/20">
            Leadership
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-4">
            Meet the Experts Behind Totan AI
          </h2>
          <p className="text-slate-400 text-base">
            A passionate team of AI researchers, security engineers, and software architects dedicated to building your automation future.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-purple-500/40 transition-all duration-300 group"
            >
              <div className="h-56 overflow-hidden relative">
                <img 
                  src={member.avatar} 
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                <p className="text-xs font-semibold text-purple-400 mb-3">{member.role}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{member.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. FAQ Section (SEO Structured Schema Content) */}
      <section className="mb-24 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-sm">Everything you need to know about Totan AI and our technology.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-slate-900/70 border border-slate-800/80 p-6 rounded-2xl"
            >
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-purple-400 font-extrabold">Q:</span> {faq.q}
              </h3>
              <p className="text-sm text-slate-400 pl-6 leading-relaxed">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 7. Bottom CTA */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl bg-gradient-to-r from-purple-900/40 via-slate-900 to-blue-900/40 border border-slate-800 p-10 sm:p-16 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 blur-[100px] pointer-events-none" />
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
          Ready to Automate Your Business Operations?
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto text-base mb-8 leading-relaxed">
          Contact our team today to discover how custom Totan AI agents can streamline your workflows and supercharge team efficiency.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/contact-us"
            className="px-8 py-3.5 rounded-full bg-white text-slate-950 font-bold hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            Schedule a Consultation
          </Link>
          <Link
            to="/pricing"
            className="px-8 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-semibold transition-all hover:scale-105"
          >
            View Pricing Plans
          </Link>
        </div>
      </motion.section>

    </div>
  );
};

export default About;
