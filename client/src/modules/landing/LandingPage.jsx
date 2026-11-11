import React from 'react';
import {
  Cpu,
  ArrowRight,
  GitPullRequest,
  Layers,
  ShieldCheck,
  Gauge,
  FolderGit2,
  Bug,
  Users,
  Check,
} from 'lucide-react';

export const LandingPage = ({ onNavigateAuth }) => {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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
              Features
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
              className="px-4 py-2 text-xs sm:text-sm font-medium text-zinc-950 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-20 pb-20 sm:pt-28 sm:pb-24 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-50 leading-[1.1]">
              Automated testing for every pull request.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl">
              Connect your Node.js or Express repository to automatically generate and run tests whenever
              code changes. Catch broken endpoints and edge-case crashes before anyone merges to main.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigateAuth('register')}
                className="px-5 py-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-sm transition-colors inline-flex items-center justify-center space-x-2"
              >
                <span>Create an account</span>
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

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-400">
              <span className="inline-flex items-center space-x-1.5">
                <Check size={14} className="text-zinc-300" />
                <span>Works with GitHub PRs</span>
              </span>
              <span className="inline-flex items-center space-x-1.5">
                <Check size={14} className="text-zinc-300" />
                <span>Unit, API, UI, and load checks</span>
              </span>
              <span className="inline-flex items-center space-x-1.5">
                <Check size={14} className="text-zinc-300" />
                <span>Isolated Docker execution</span>
              </span>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          className="border-t border-zinc-900 py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto"
        >
          <div className="max-w-xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">
              How it works
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-zinc-400">
              Set up your repository once and get clear feedback on every pull request.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
              <span className="text-xs font-mono text-zinc-500">01</span>
              <h3 className="text-base font-semibold text-zinc-100">Connect your repository</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Add your GitHub repo and point Test360 to your routes, controllers, and models folders.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
              <span className="text-xs font-mono text-zinc-500">02</span>
              <h3 className="text-base font-semibold text-zinc-100">Run checks automatically</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                When a pull request opens, Test360 finds what changed and generates tests for those files.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
              <span className="text-xs font-mono text-zinc-500">03</span>
              <h3 className="text-base font-semibold text-zinc-100">Review and fix issues</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                See which tests passed or failed, check the exact line that broke, and fix it before merging.
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section
          id="features"
          className="border-t border-zinc-900 py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto"
        >
          <div className="max-w-xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">
              Everything your team needs to ship safely
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-zinc-400">
              Practical tools built for Node.js, Express, and full-stack JavaScript backends.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: GitPullRequest,
                title: 'Smart impact mapping',
                desc: 'Finds which routes and database models are affected by a pull request so nothing gets missed.',
              },
              {
                icon: Layers,
                title: 'All-in-one test suites',
                desc: 'Runs unit checks, API endpoint requests, browser smoke flows, and load tests together.',
              },
              {
                icon: Bug,
                title: 'Edge-case bug catching',
                desc: 'Tests missing fields, negative numbers, and bad inputs that often cause server crashes.',
              },
              {
                icon: Gauge,
                title: 'Speed under heavy traffic',
                desc: 'Measures how fast your endpoints respond when many users hit your API at once.',
              },
              {
                icon: FolderGit2,
                title: 'Flexible folder setup',
                desc: 'Works with your project structure and lets you trigger simulated PR runs anytime.',
              },
              {
                icon: Users,
                title: 'Clear team access',
                desc: 'Keep track of past PR checks with dedicated roles for developers, reviewers, and admins.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800/90 space-y-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
                    <Icon size={17} />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-100">{item.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Security Section */}
        <section
          id="security"
          className="border-t border-zinc-900 py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto"
        >
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl space-y-3">
              <div className="inline-flex items-center space-x-2 text-xs font-medium text-zinc-300">
                <ShieldCheck size={15} className="text-zinc-200" />
                <span>Isolated Execution</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-50">
                Every test runs inside a clean container
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Tests run in locked-down Docker containers with strict memory and CPU limits, read-only
                filesystems, and no external network access. Your main environment stays completely safe.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 shrink-0 text-xs">
              <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800">
                <div className="text-zinc-500">User permissions</div>
                <div className="text-zinc-200 font-medium mt-1">Non-root only</div>
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800">
                <div className="text-zinc-500">Filesystem</div>
                <div className="text-zinc-200 font-medium mt-1">Read-only root</div>
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800">
                <div className="text-zinc-500">Resource limits</div>
                <div className="text-zinc-200 font-medium mt-1">Capped CPU &amp; RAM</div>
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800">
                <div className="text-zinc-500">Network access</div>
                <div className="text-zinc-200 font-medium mt-1">Disabled by default</div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="border-t border-zinc-900 py-20 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">
                Ready to get started?
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 mt-2">
                Create an account to connect your first repository in under a minute.
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
                className="px-5 py-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-sm transition-colors inline-flex items-center space-x-2"
              >
                <span>Get started</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center space-x-2">
            <Cpu size={14} className="text-zinc-400" />
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
