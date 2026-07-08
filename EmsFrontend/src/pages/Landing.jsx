import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BarChart3, Users, Zap, Shield, Play, Bot, Cpu, Database, Brain, Server, Cloud, Presentation, BookOpen, TrendingUp, GraduationCap, BookOpenText, Settings, Plus, Minus, MapPin, Phone, Mail } from 'lucide-react'
import landingVideo from '../assets/Landing vid.mp4'
import logoImg from '../assets/TDTL_logo.png'
import ourApproachImg from '../assets/Our_Approach_img.jpg'
import partnershipImg from '../assets/Partnership_Opportunities.jpg'

const Landing = () => {
  const { isAuthenticated } = useAuth()
  const [currentTab, setCurrentTab] = useState('HOME')
  const [openFaqIndex, setOpenFaqIndex] = useState(0)

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background Video Layer */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden select-none pointer-events-none">
        <video
          src={landingVideo}
          autoPlay
          loop
          muted
          playsInline
          className="absolute min-w-full min-h-full object-cover opacity-90 dark:opacity-75"
        />
        {/* Soft overlay gradient for text legibility, adapting to light and dark themes */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/50 to-background" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation */}
        <nav className="border-b border-border bg-background/50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            {/* Left side: Company Logo */}
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="The DataTech Labs Logo" className="h-15 w-auto object-contain" />
            </div>

            {/* Center side: Pill Tabs Menu */}
            <div className="hidden md:flex items-center gap-1 bg-muted/60 p-1 rounded-full border border-border/40">
              <button
                onClick={() => setCurrentTab('HOME')}
                className={`px-5 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${currentTab === 'HOME'
                  ? 'bg-background text-[#0c6396] shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                HOME
              </button>
              <button
                onClick={() => setCurrentTab('ABOUT')}
                className={`px-5 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${currentTab === 'ABOUT'
                  ? 'bg-background text-[#0c6396] shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                ABOUT
              </button>
              <button
                onClick={() => setCurrentTab('CONTACT')}
                className={`px-5 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${currentTab === 'CONTACT'
                  ? 'bg-background text-[#0c6396] shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                CONTACT
              </button>
            </div>

            {/* Right side: Login button */}
            <div className="flex gap-4">
              {/* {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-2 bg-[#0c6396] hover:bg-[#094f79] text-white rounded-full font-semibold transition-colors shadow-md text-sm"
                >
                  Dashboard
                </Link>
              ) : ( */}
              <Link
                to="/login"
                className="px-6 py-2 bg-[#0c6396] hover:bg-[#094f79] text-white rounded-full font-semibold transition-colors shadow-md text-sm"
              >
                Login
              </Link>
              {/* )} */}
            </div>
          </div>
        </nav>

        {/* Dynamic Section Contents */}
        {currentTab === 'HOME' ? (
          <section className="flex-grow max-w-7xl mx-auto px-4 py-20 flex flex-col justify-center items-center text-center">
            <div className="max-w-3xl space-y-6 mb-16">
              {/* <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                <Zap className="w-3.5 h-3.5" />
                <span>Next-Gen Employee Platform</span>
              </div> */}
              <h1 className="text-5xl md:text-6xl font-extrabold text-black tracking-tight leading-tight">
                Enabling Enterprise Growth <br />
                with Agentic AI and Digital Transformation
              </h1>
              <p className="text-xl text-black leading-relaxed font-medium">
                Accelerate breakthrough innovation and scale transformative results with AI-powered automation, data engineering, and intelligent platforms for complex operational efficiency and growth optimization.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-8">
              <FeatureCard
                icon={<Users className="w-8 h-8" />}
                title="Employee Management"
                description="Manage employee information, roles, and departments efficiently."
                to="/login"
              />
              <FeatureCard
                icon={<BarChart3 className="w-8 h-8" />}
                title="Performance Tracking"
                description="Monitor performance metrics and track employee development."
                to="/login"
              />
              <FeatureCard
                icon={<Zap className="w-8 h-8" />}
                title="Attendance & Leave"
                description="Automated attendance tracking and leave management system."
                to="/login"
              />
              <FeatureCard
                icon={<Shield className="w-8 h-8" />}
                title="Payroll Processing"
                description="Streamlined payroll management with secure calculations."
                to="/login"
              />
              <FeatureCard
                icon={<Users className="w-8 h-8" />}
                title="Team Collaboration"
                description="Foster better communication across your organization."
                to="/login"
              />
              <FeatureCard
                icon={<Zap className="w-8 h-8" />}
                title="Reports & Analytics"
                description="Gain insights with comprehensive HR analytics and reports."
                to="/login"
              />
            </div>

            {/* Core Solutions Section */}
            <div className="w-full mt-24 text-left border-t border-border/40 pt-16">
              {/* Header */}
              <div className="space-y-4 max-w-3xl mb-12">
                <div className="w-16 h-1.5 bg-gradient-to-r from-blue-500 via-[#0c6396] to-purple-500 rounded-full" />
                <h2 className="text-3xl font-extrabold text-foreground tracking-tight leading-tight font-sans">
                  Core Solutions
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed font-normal">
                  Scalable, future-ready solutions engineered to accelerate digital maturity, drive competitive advantage, and align AI innovation with core business strategy.
                </p>
              </div>

              {/* Core Solutions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {/* 1. Agentic AI & Intelligent BoTs */}
                <div className="flex flex-col items-start space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#7c3aed] flex items-center justify-center shadow-lg shadow-[#7c3aed]/25">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground font-sans">
                    Agentic AI & Intelligent BoTs
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Deploy multiple autonomous agents and LLM-powered bots for dynamic task execution, contextual reasoning, and real-time adaptation across workflows.
                  </p>
                </div>

                {/* 2. AI Platforms & Applied AI Solutions */}
                <div className="flex flex-col items-start space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#7c3aed] flex items-center justify-center shadow-lg shadow-[#7c3aed]/25">
                    <Cpu className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground font-sans">
                    AI Platforms & Applied AI Solutions
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    End-to-end AI stack engineering, MLOps, model orchestration, inference pipelines, and deployment frameworks for production-grade use cases.
                  </p>
                </div>

                {/* 3. Data Engineering & Advanced Analytics */}
                <div className="flex flex-col items-start space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#7c3aed] flex items-center justify-center shadow-lg shadow-[#7c3aed]/25">
                    <Database className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground font-sans">
                    Data Engineering & Advanced Analytics
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Engineer high-performance data pipelines and architectures for real-time insights and advanced analytics, powering accurate forecasting, and data-driven decisions.
                  </p>
                </div>

                {/* 4. AI Skilling & LLM Capability Building */}
                <div className="flex flex-col items-start space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#7c3aed] flex items-center justify-center shadow-lg shadow-[#7c3aed]/25">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground font-sans">
                    AI Skilling & LLM Capability Building
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Upskill teams with hands-on AI learning paths, LLM tooling, and deployment frameworks, expediting generative AI adoption and building in-house expertise.
                  </p>
                </div>

                {/* 5. Enterprise Platforms */}
                <div className="flex flex-col items-start space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#7c3aed] flex items-center justify-center shadow-lg shadow-[#7c3aed]/25">
                    <Server className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground font-sans">
                    Enterprise Platforms
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    AI integration into ERP, CRM, and core banking systems for decision automation, real-time visibility, system intelligence and architectural adaptability.
                  </p>
                </div>

                {/* 6. Cloud Solutions */}
                <div className="flex flex-col items-start space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#7c3aed] flex items-center justify-center shadow-lg shadow-[#7c3aed]/25">
                    <Cloud className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground font-sans">
                    Cloud Solutions
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Architect secure, cloud-native architectures with automated provisioning, containerized workloads, and multi-cloud interoperability for scalable, cost-efficient operations.
                  </p>
                </div>
              </div>
            </div>

            {/* Learning Transformation Section */}
            <div className="w-full mt-24 text-left border-t border-border/40 pt-16">
              {/* Header */}
              <div className="space-y-4 max-w-3xl mb-12">
                <div className="w-16 h-1.5 bg-gradient-to-r from-blue-500 via-[#0c6396] to-purple-500 rounded-full" />
                <h2 className="text-3xl font-extrabold text-foreground tracking-tight leading-tight font-sans">
                  Learning Transformation for the AI-First Enterprise
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed font-normal">
                  Enterprise-grade learning frameworks to develop AI-native talent and drive scalable adoption across the organization.
                </p>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Card 1 */}
                <div className="bg-card/40 backdrop-blur-md border border-border/40 rounded-3xl p-8 shadow-md hover:bg-card/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-start">
                  <div className="mb-6 p-2 w-fit rounded-2xl bg-foreground/5 text-[#0c6396] dark:text-[#38bdf8]">
                    <Presentation className="w-9 h-9" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-4 font-sans leading-snug">
                    Corporate Training Programs
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-normal">
                    Role-aligned upskilling in AI, Data Science, GenAI, Cloud, Cybersecurity, Full Stack, and Analytics, built around real-world enterprise use cases for faster deployment readiness.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="bg-card/40 backdrop-blur-md border border-border/40 rounded-3xl p-8 shadow-md hover:bg-card/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-start">
                  <div className="mb-6 p-2 w-fit rounded-2xl bg-foreground/5 text-[#0c6396] dark:text-[#38bdf8]">
                    <BookOpen className="w-9 h-9" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-4 font-sans leading-snug">
                    Learning & Development Transformation
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-normal">
                    AI-driven LMS platforms with virtual coaches, adaptive assessments, and career pathing for personalized learning and measurable talent progression.
                  </p>
                </div>

                {/* Card 3 */}
                <div className="bg-card/40 backdrop-blur-md border border-border/40 rounded-3xl p-8 shadow-md hover:bg-card/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-start">
                  <div className="mb-6 p-2 w-fit rounded-2xl bg-foreground/5 text-[#0c6396] dark:text-[#38bdf8]">
                    <TrendingUp className="w-9 h-9" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-4 font-sans leading-snug">
                    Digital Capability Building
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-normal">
                    End-to-end frameworks to develop AI-native, automation-ready teams, expediting workforce readiness across digital-first environments.
                  </p>
                </div>

                {/* Card 4 */}
                <div className="bg-card/40 backdrop-blur-md border border-border/40 rounded-3xl p-8 shadow-md hover:bg-card/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-start">
                  <div className="mb-6 p-2 w-fit rounded-2xl bg-foreground/5 text-[#0c6396] dark:text-[#38bdf8]">
                    <GraduationCap className="w-9 h-9" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-4 font-sans leading-snug">
                    Work-Integrated Learning (WILP)
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-normal">
                    Apprenticeships, and internal certification frameworks for continuous upskilling and talent retention.
                  </p>
                </div>

                {/* Card 5 */}
                <div className="bg-card/40 backdrop-blur-md border border-border/40 rounded-3xl p-8 shadow-md hover:bg-card/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-start">
                  <div className="mb-6 p-2 w-fit rounded-2xl bg-foreground/5 text-[#0c6396] dark:text-[#38bdf8]">
                    <BookOpenText className="w-9 h-9" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-4 font-sans leading-snug">
                    AI based Learning Solutions
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-normal">
                    LLM-powered recommendation engines and adaptive content delivery, driving engagement, learning efficiency, and role-specific expertise development.
                  </p>
                </div>

                {/* Card 6 */}
                <div className="bg-card/40 backdrop-blur-md border border-border/40 rounded-3xl p-8 shadow-md hover:bg-card/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-start">
                  <div className="mb-6 p-2 w-fit rounded-2xl bg-foreground/5 text-[#0c6396] dark:text-[#38bdf8]">
                    <Settings className="w-9 h-9" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-4 font-sans leading-snug">
                    Customized Learning
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-normal">
                    Deliver customized, role-specific learning programs to accelerate skill adoption, enhance operational performance, and build AI and automation-ready teams.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ / Ask TDTL Section */}
            <div className="w-full mt-24 text-left border-t border-border/40 pt-16">
              {/* Header */}
              <div className="space-y-4 max-w-3xl mb-12">
                <div className="w-16 h-1.5 bg-gradient-to-r from-blue-500 via-[#0c6396] to-purple-500 rounded-full" />
                <h2 className="text-3xl font-extrabold text-foreground tracking-tight leading-tight font-sans">
                  Ask TDTL
                </h2>
              </div>

              {/* Accordion List */}
              <div className="space-y-4 max-w-6xl w-full">
                {[
                  {
                    q: "How is AI transforming industries like healthcare and finance?",
                    a: "AI enables predictive diagnostics in healthcare and real-time fraud detection in finance by leveraging domain-specific models and contextual data to improve trust, accuracy, and efficiency"
                  },
                  {
                    q: "What does digital transformation in manufacturing look like today?",
                    a: "Digital transformation in manufacturing involves integrating smart sensors, IoT devices, automated assembly lines, and predictive maintenance schedules to optimize efficiency and minimize downtime."
                  },
                  {
                    q: "How does The DataTech Labs ensure compliance and security in AI deployments?",
                    a: "We implement rigorous data encryption, role-based controls, continuous auditing, and compliance checks aligned with ISO, GDPR, and enterprise security standards to protect critical assets."
                  },
                  {
                    q: "What custom software development services do you offer?",
                    a: "We provide full-cycle custom software development, including modern cloud-native architectures, API integration, front-end SPA engineering, backend microservices, and database optimization."
                  },
                  {
                    q: "What kind of AI training do you offer for enterprise teams?",
                    a: "We deliver specialized corporate workshops covering machine learning engineering, MLOps orchestration, prompt engineering, generative AI integration, and LLM fine-tuning techniques."
                  }
                ].map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={index}
                      className="bg-card/45 backdrop-blur-md border border-border/40 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                        className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer"
                      >
                        <span className="font-semibold text-foreground text-sm sm:text-base font-sans pr-4">
                          {faq.q}
                        </span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen
                          ? 'bg-[#7c3aed] text-white shadow-sm shadow-[#7c3aed]/20'
                          : 'bg-violet-100 dark:bg-violet-950/40 text-[#7c3aed] dark:text-[#a78bfa]'
                          }`}>
                          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                        </div>
                      </button>

                      {/* Smooth collapsible answer block */}
                      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 border-t border-border/20' : 'max-h-0'
                        } overflow-hidden`}>
                        <p className="px-6 py-4 text-muted-foreground text-xs sm:text-sm leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : currentTab === 'ABOUT' ? (
          <section className="flex-grow max-w-7xl mx-auto px-6 py-20 flex flex-col gap-12 w-full">
            {/* Top Grid: Main Overview */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start bg-card/60 backdrop-blur-md border border-border/40 rounded-3xl p-8 sm:p-12 shadow-2xl w-full text-left">
              {/* Column 1: Title (cols 4) */}
              <div className="md:col-span-4 space-y-4">
                {/* Gradient decorative line */}
                <div className="w-16 h-1.5 bg-gradient-to-r from-blue-500 via-[#0c6396] to-purple-500 rounded-full" />
                <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight font-sans">
                  About <br />
                  <span className="text-[#0c6396] dark:text-[#38bdf8]">The DataTech Labs</span>
                </h2>
              </div>

              {/* Column 2: Text 1 (cols 4) */}
              <div className="md:col-span-4 text-muted-foreground text-sm leading-relaxed font-normal space-y-4">
                <p>
                  Welcome to The DataTech Labs, where we specialize in delivering cutting-edge solutions tailored to your uniquebusiness needs. Our team of expert consultant spossesses deep technical knowledge and extensive experience across a wide range of industries, including energy, BFSI, Healthcare, Public Sector, Retail, Transport, Telecom, and more.
                </p>
              </div>

              {/* Column 3: Text 2 (cols 4) */}
              <div className="md:col-span-4 text-muted-foreground text-sm leading-relaxed font-normal space-y-4">
                <p>
                  We are dedicated to helping our clients unlock the full potential of their data by providing accurate insights that drive informed decision-making. Whether you require cloud, on-premise, or hybrid solutions, we work closely with you to ensure that our services align with your desired outcomes and objectives.
                </p>
              </div>
            </div>

            {/* Split Row 1: Our Approach */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-card/60 backdrop-blur-md border border-border/40 rounded-3xl p-8 sm:p-12 shadow-2xl w-full text-left">
              {/* Left Column: Text */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="w-16 h-1.5 bg-gradient-to-r from-blue-500 via-[#0c6396] to-purple-500 rounded-full" />
                  <h2 className="text-2xl font-extrabold text-foreground tracking-tight leading-tight uppercase font-sans">
                    Our Approach
                  </h2>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  At The DataTech Labs, we drive impactful and sustainable Digital, Learning, and Business Transformation through our comprehensive approach, combining cutting-edge technologies, innovative methodologies, and industry best practices.
                </p>
              </div>
              {/* Right Column: Image */}
              <div className="flex justify-center items-center rounded-2xl overflow-hidden h-64 border border-border/40 bg-card shadow-inner">
                <img src={ourApproachImg} alt="Our Approach" className="w-full h-full object-cover animate-fade-in" />
              </div>
            </div>

            {/* Split Row 2: Partnership Opportunities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-card/60 backdrop-blur-md border border-border/40 rounded-3xl p-8 sm:p-12 shadow-2xl w-full text-left">
              {/* Left Column: Image */}
              <div className="flex justify-center items-center rounded-2xl overflow-hidden h-64 border border-border/40 bg-card shadow-inner order-2 md:order-1">
                <img src={partnershipImg} alt="Partnership Opportunities" className="w-full h-full object-cover animate-fade-in" />
              </div>

              {/* Right Column: Text */}
              <div className="space-y-6 order-1 md:order-2">
                <div className="space-y-4">
                  <div className="w-16 h-1.5 bg-gradient-to-r from-blue-500 via-[#0c6396] to-purple-500 rounded-full" />
                  <h2 className="text-2xl font-extrabold text-foreground tracking-tight leading-tight uppercase font-sans">
                    Partnership Opportunities
                  </h2>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  The DataTech Labs offers partnership opportunities to drive business and learning transformation. Partnering with us means leveraging our expertise, resources, and solutions to deliver exceptional value to your clients and stakeholders.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section className="flex-grow max-w-7xl mx-auto px-6 py-20 flex items-center justify-center w-full">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch bg-card/60 backdrop-blur-md border border-border/40 rounded-3xl p-8 sm:p-12 shadow-2xl max-w-6xl w-full text-left">
              {/* Left Column: Contact details (cols 5) */}
              <div className="md:col-span-5 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* Gradient decorative line */}
                  <div className="w-16 h-1.5 bg-gradient-to-r from-blue-500 via-[#0c6396] to-purple-500 rounded-full" />
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight font-sans">
                    Contact Us
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Have questions about our solutions or services? Reach out to us.
                  </p>
                </div>

                <div className="space-y-6 my-auto">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-[#0c6396]/10 text-[#0c6396] dark:text-[#38bdf8] shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">The DataTech Labs (TDTL)</h4>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        office no 101, ABC Axis Business Center, opposite to Marigold Banquets, Bhugaon, Bavdhan, Pune, Maharashtra 412115
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-[#0c6396]/10 text-[#0c6396] dark:text-[#38bdf8] shrink-0">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Phone</h4>
                      <p className="text-sm text-muted-foreground mt-1 font-medium">
                        9225584954
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-[#0c6396]/10 text-[#0c6396] dark:text-[#38bdf8] shrink-0">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Email</h4>
                      <p className="text-sm text-muted-foreground mt-1 font-medium">
                        empower@tdtl.world
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Google Maps Iframe (cols 7) */}
              <div className="md:col-span-7 h-80 md:h-auto min-h-[300px] w-full rounded-2xl overflow-hidden border border-border/40 relative">
                <iframe
                  title="The DataTech Labs (TDTL) Map Location"
                  src="https://maps.google.com/maps?q=The%20DataTech%20Labs%20(TDTL)%20office%20no%20101,%20ABC%20Axis%20Business%20Center,%20opposite%20to%20Marigold%20Banquets,%20Bhugaon,%20Bavdhan,%20Pune,%20Maharashtra%20412115&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-border/40 bg-background/30 backdrop-blur-sm py-8 w-full mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground text-sm">
            <p>&copy; 2026 The DataTech Labs - Employee Management System. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

const FeatureCard = ({ icon, title, description, to }) => {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(to)}
      className="relative z-30 cursor-pointer block text-left p-6 border border-border/40 rounded-xl bg-card/40 backdrop-blur-md hover:bg-card/60 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}

export default Landing
