import React, { useState } from 'react';
import {
  Cpu,
  ArrowRight,
  Layers,
  ShieldCheck,
  Gauge,
  Bug,
  Check,
  CheckCircle2,
  Network,
  TrendingUp,
} from 'lucide-react';

const HERO_VIEWS = [
  {
    id: 'checks',
    label: 'PR Checks',
    src: '/screenshots/overview-checks.png',
    alt: 'Test360 AI pull request checks dashboard showing failed API check and stack details',
    caption: 'See unit, API, browser, and speed test results in one clean view.',
  },
  {
    id: 'codemap',
    label: 'Code Map',
    src: '/screenshots/code-map.png',
    alt: 'Test360 AI code map showing routes, controllers, services, and database models',
    caption: 'Trace which routes, controllers, and models are impacted by a change.',
  },
  {
    id: 'tests',
    label: 'Generated Tests',
    src: '/screenshots/generated-tests.png',
    alt: 'Test360 AI generated test cases paired with ready-to-run Supertest code',
    caption: 'Inspect auto-generated edge cases alongside the runnable test files.',
  },
  {
    id: 'history',
    label: 'PR History',
    src: '/screenshots/pr-history.png',
    alt: 'Test360 AI pull request quality and API speed trend chart',
    caption: 'Track test quality and response time across every pull request.',
  },
];

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Connect your repository',
    desc: 'Add your GitHub repo and configure your routes, controllers, and models folders once.',
    image: '/screenshots/repositories.png',
    alt: 'Test360 AI connected repositories view',
    caption: 'Manage connected repositories, trigger test PRs, or inspect webhook settings.',
  },
  {
    step: '02',
    title: 'Map affected code',
    desc: 'Whenever a pull request opens, Test360 traces modified files and downstream dependencies.',
    image: '/screenshots/code-map.png',
    alt: 'Test360 AI interactive code dependency map',
    caption: 'Pinpoint exactly which endpoints and Mongoose schemas need verification.',
  },
  {
    step: '03',
    title: 'Review issues before merging',
    desc: 'Get exact failing line numbers, generated edge-case checks, and API response times.',
    image: '/screenshots/overview-checks.png',
    alt: 'Test360 AI pull request scorecard highlighting an API validation bug',
    caption: 'Spot broken inputs and failing endpoints before code ever reaches main.',
  },
];

export const LandingPage = ({ onNavigateAuth }) => {
  const [activeHeroView, setActiveHeroView] = useState(HERO_VIEWS[0].id);
  const [activeStep, setActiveStep] = useState(0);

  const currentHero =
    HERO_VIEWS.find((v) => v.id === activeHeroView) || HERO_VIEWS[0];
  const currentStep = WORKFLOW_STEPS[activeStep] || WORKFLOW_STEPS[0];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-950 flex items-center justify-center">
              <Cpu size={17} />
            </div>
            <span className="font-semibold tracking-tight text-zinc-100 text-sm sm:text-base">
              Test360 AI
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm text-zinc-400">
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-zinc-100 transition-colors"
            >
              How it works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="hover:text-zinc-100 transition-colors"
            >
              Product tour
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('security')}
              className="hover:text-zinc-100 transition-colors"
            >
              Security
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => onNavigateAuth('login')}
              className="px-3.5 py-2 text-xs sm:text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => onNavigateAuth('register')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section: Balanced Split with Live Interactive Software Frame */}
        <section className="pt-14 pb-20 sm:pt-20 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Copy Column */}
            <div className="lg:col-span-5 space-y-6">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-50 leading-[1.1]">
                Catch bugs in{' '}
                <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                  every pull request
                </span>{' '}
                before you merge.
              </h1>

              <p className="text-base text-zinc-400 leading-relaxed">
                Connect your Node.js or Express repository to automatically trace affected code,
                generate edge-case tests, and verify API performance on every PR.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigateAuth('register')}
                  className="px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors inline-flex items-center justify-center space-x-2"
                >
                  <span>Create free account</span>
                  <ArrowRight size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateAuth('login')}
                  className="px-5 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium text-sm border border-zinc-800 transition-colors inline-flex items-center justify-center"
                >
                  Sign in to workspace
                </button>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-400">
                <span className="inline-flex items-center space-x-1.5">
                  <Check size={14} className="text-emerald-400" />
                  <span>Works with GitHub PRs</span>
                </span>
                <span className="inline-flex items-center space-x-1.5">
                  <Check size={14} className="text-emerald-400" />
                  <span>Unit, API, UI &amp; speed checks</span>
                </span>
                <span className="inline-flex items-center space-x-1.5">
                  <Check size={14} className="text-emerald-400" />
                  <span>Isolated Docker runs</span>
                </span>
              </div>
            </div>

            {/* Right Interactive Product Showcase */}
            <div className="lg:col-span-7 relative">
              <div
                aria-hidden="true"
                className="absolute -inset-4 bg-gradient-to-tr from-indigo-600/15 via-transparent to-emerald-500/10 blur-2xl rounded-3xl pointer-events-none"
              />

              <div className="relative rounded-xl border border-zinc-800 bg-zinc-900/90 shadow-2xl overflow-hidden">
                {/* Browser Frame Header & Switcher */}
                <div className="px-4 py-2.5 border-b border-zinc-800 bg-zinc-950/90 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  </div>

                  <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-[11px]">
                    {HERO_VIEWS.map((view) => (
                      <button
                        key={view.id}
                        type="button"
                        onClick={() => setActiveHeroView(view.id)}
                        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                          activeHeroView === view.id
                            ? 'bg-indigo-600 text-white'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {view.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Real Software Image */}
                <div className="bg-zinc-950">
                  <img
                    src={currentHero.src}
                    alt={currentHero.alt}
                    className="w-full h-auto block"
                  />
                </div>

                {/* Caption Bar */}
                <div className="px-4 py-2.5 border-t border-zinc-800 bg-zinc-900/80 text-xs text-zinc-400">
                  <span>{currentHero.caption}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works: Interactive Step Walkthrough with Screenshots */}
        <section
          id="how-it-works"
          className="border-t border-zinc-900 py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto"
        >
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              How it works
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">
              From repository setup to pull request confidence in three steps
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Interactive Step List */}
            <div className="lg:col-span-5 space-y-3">
              {WORKFLOW_STEPS.map((item, idx) => {
                const isSelected = activeStep === idx;
                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => setActiveStep(idx)}
                    className={`w-full text-left p-5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-950/20 border-indigo-500/50'
                        : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-xs font-mono font-semibold ${
                          isSelected ? 'text-indigo-400' : 'text-zinc-500'
                        }`}
                      >
                        Step {item.step}
                      </span>
                      {isSelected && (
                        <span className="text-[11px] text-emerald-400 font-medium">
                          Showing preview
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-zinc-100">{item.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed mt-1.5">{item.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Matching Step Software Screenshot */}
            <div className="lg:col-span-7 rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-xl">
              <div className="bg-zinc-950">
                <img
                  src={currentStep.image}
                  alt={currentStep.alt}
                  className="w-full h-auto block"
                />
              </div>
              <div className="px-4 py-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                <span>{currentStep.caption}</span>
                <span className="font-mono text-zinc-500 shrink-0 ml-3">
                  {currentStep.step} / 03
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Product Tour: Visual Deep-Dive Showcases */}
        <section
          id="features"
          className="border-t border-zinc-900 py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-20"
        >
          {/* Showcase 1: Code Map */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1 rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
              <img
                src="/screenshots/code-map.png"
                alt="Test360 AI code dependency map highlighting routes, controllers, and models"
                className="w-full h-auto block"
              />
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
              <div className="inline-flex items-center space-x-2 text-xs font-medium text-emerald-400">
                <Network size={15} />
                <span>Code impact mapping</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">
                Know every route and model touched by a change
              </h3>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                Test360 maps how routes, middleware, controllers, and Mongoose models connect, so you
                never ship a change that breaks a downstream endpoint.
              </p>
              <ul className="space-y-2.5 text-sm text-zinc-300 pt-1">
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  <span>Highlights modified files and affected dependencies</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  <span>Inspect route handlers, schema fields, and env keys</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Showcase 2: Generated Tests & Quality History */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center space-x-2 text-xs font-medium text-indigo-400">
                <Layers size={15} />
                <span>Generated test suites</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">
                Readable test cases paired with runnable code
              </h3>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                Every pull request gets clean boundary checks for zero values, negative inputs,
                missing headers, and valid flows across Unit, API, Browser, and Speed suites.
              </p>
              <ul className="space-y-2.5 text-sm text-zinc-300 pt-1">
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={15} className="text-indigo-400 shrink-0" />
                  <span>Copy-ready Jest, Supertest, Playwright, and load tests</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={15} className="text-indigo-400 shrink-0" />
                  <span>Clear explanations for why each check exists</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7 rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
              <img
                src="/screenshots/generated-tests.png"
                alt="Test360 AI generated test suite viewer"
                className="w-full h-auto block"
              />
            </div>
          </div>

          {/* Compact 3-Card Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
            {[
              {
                icon: Bug,
                color: 'text-indigo-400',
                title: 'Edge-case bug detection',
                desc: 'Automatically tests zero values, negative numbers, and missing fields before code merges.',
              },
              {
                icon: Gauge,
                color: 'text-emerald-400',
                title: 'API speed tracking',
                desc: 'Monitors endpoint response times under concurrent traffic and spots slowdowns early.',
              },
              {
                icon: TrendingUp,
                color: 'text-indigo-400',
                title: 'PR quality trends',
                desc: 'Compare pull requests side-by-side and post ready-to-copy summaries directly on GitHub.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <Icon size={17} className={item.color} />
                  </div>
                  <h4 className="text-base font-semibold text-zinc-100">{item.title}</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Security Section */}
        <section
          id="security"
          className="border-t border-zinc-900 py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto"
        >
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl space-y-3">
              <div className="inline-flex items-center space-x-2 text-xs font-medium text-emerald-400">
                <ShieldCheck size={15} />
                <span>Isolated execution</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-50">
                Every check runs inside an isolated container
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Tests execute inside locked-down Docker containers with capped CPU and memory,
                read-only root filesystems, and no external network access.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 shrink-0 text-xs">
              <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800">
                <div className="text-zinc-500">Permissions</div>
                <div className="text-zinc-100 font-medium mt-1">Non-root user</div>
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800">
                <div className="text-zinc-500">Filesystem</div>
                <div className="text-zinc-100 font-medium mt-1">Read-only root</div>
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800">
                <div className="text-zinc-500">Resources</div>
                <div className="text-zinc-100 font-medium mt-1">Capped CPU &amp; RAM</div>
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800">
                <div className="text-zinc-500">Network</div>
                <div className="text-zinc-100 font-medium mt-1">Isolated by default</div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="border-t border-zinc-900 py-20 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">
                Start checking your pull requests today
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 mt-2">
                Create an account to connect your repository in under a minute.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                type="button"
                onClick={() => onNavigateAuth('login')}
                className="px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium text-sm border border-zinc-800 transition-colors"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => onNavigateAuth('register')}
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors inline-flex items-center space-x-2"
              >
                <span>Create free account</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center space-x-2">
            <Cpu size={14} className="text-indigo-400" />
            <span className="font-medium text-zinc-300">Test360 AI</span>
          </div>
          <div className="flex items-center space-x-6">
            <button
              type="button"
              onClick={() => onNavigateAuth('login')}
              className="hover:text-zinc-300 transition-colors"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => onNavigateAuth('register')}
              className="hover:text-zinc-300 transition-colors"
            >
              Register
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
