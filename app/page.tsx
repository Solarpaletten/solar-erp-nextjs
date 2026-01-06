import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-2xl font-bold text-blue-600">SOLAR ERP</div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Features</a>
              <a href="#integrations" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Integrations</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Pricing</a>
              <a href="#support" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Support</a>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-600 hover:text-blue-600 font-semibold transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Hero Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <span className="text-white text-6xl">☀️</span>
            </div>
          </div>

          {/* Hero Text */}
          <h1 className="text-6xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
            Solar ERP System
          </h1>
          <div className="text-2xl md:text-3xl text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold mb-4">
            Two-Level Multi-Tenant Architecture
          </div>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Advanced Enterprise Resource Planning solution with real-time data synchronization, 
            intuitive drag & drop interfaces, and professional workflow management for modern businesses.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link
              href="/login"
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 inline-flex items-center justify-center"
            >
              <span className="mr-2">🚀</span>
              Access Dashboard
              <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/register"
              className="group px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 inline-flex items-center justify-center"
            >
              <span className="mr-2">✨</span>
              Start Free Trial
              <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Demo Credentials Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-lg mx-auto mb-20 border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🔑</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Quick Demo Access
              </h3>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-4">
                <div className="text-sm text-gray-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Email:</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">solar@solar.com</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Password:</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">pass123</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-500 text-sm">
                * Real backend with PostgreSQL database connection
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Multi-Tenant Dashboard</h3>
            <p className="text-gray-600 leading-relaxed">
              Advanced dashboard with drag & drop elements, customizable layouts, 
              real-time data visualization, and company-specific contexts for seamless business management.
            </p>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">🏢</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Company Management</h3>
            <p className="text-gray-600 leading-relaxed">
              Effortlessly manage multiple companies, switch between business contexts, 
              and maintain separate operations with dedicated workflows and data isolation.
            </p>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">⚡</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Real-time Operations</h3>
            <p className="text-gray-600 leading-relaxed">
              Live data synchronization, instant updates across all modules, 
              and seamless integration with business workflows for maximum productivity.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-12 text-white text-center mb-24 shadow-2xl">
          <h2 className="text-4xl font-bold mb-12">Trusted by Growing Businesses</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="group">
              <div className="text-5xl font-bold mb-3 group-hover:scale-110 transition-transform duration-300">3+</div>
              <div className="text-blue-100 text-lg">Active Companies</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold mb-3 group-hover:scale-110 transition-transform duration-300">24/7</div>
              <div className="text-blue-100 text-lg">System Uptime</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold mb-3 group-hover:scale-110 transition-transform duration-300">100%</div>
              <div className="text-blue-100 text-lg">Data Security</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold mb-3 group-hover:scale-110 transition-transform duration-300">∞</div>
              <div className="text-blue-100 text-lg">Scalability</div>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div id="integrations" className="text-center mb-24">
          <h2 className="text-4xl font-bold text-gray-800 mb-8">Built with Modern Technology</h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Powered by cutting-edge technologies for performance, scalability, and developer experience
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'Next.js 15', color: 'from-black to-gray-800', icon: '⚡' },
              { name: 'TypeScript', color: 'from-blue-500 to-blue-600', icon: '🔷' },
              { name: 'PostgreSQL', color: 'from-blue-600 to-indigo-600', icon: '🐘' },
              { name: 'Prisma ORM', color: 'from-indigo-500 to-purple-600', icon: '🔺' },
              { name: 'Tailwind CSS', color: 'from-teal-400 to-cyan-500', icon: '🎨' },
              { name: 'JWT Auth', color: 'from-green-500 to-emerald-600', icon: '🔐' },
            ].map((tech, index) => (
              <div
                key={index}
                className={`px-6 py-3 bg-gradient-to-r ${tech.color} text-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 inline-flex items-center font-semibold`}
              >
                <span className="mr-2 text-lg">{tech.icon}</span>
                {tech.name}
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Ready to Transform Your Business?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join the next generation of enterprise resource planning with Solar ERP's 
            advanced multi-tenant architecture and intuitive user experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Start Your Free Trial
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Access Demo
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-sm border-t border-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-bold text-blue-600 mb-4">SOLAR ERP</div>
              <p className="text-gray-600 mb-4 max-w-md">
                Advanced Multi-Tenant Enterprise Resource Planning solution 
                built with modern technologies for growing businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">API</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Support</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Training</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 mt-8 text-center text-gray-500">
            <p>&copy; 2025 Solar ERP. Advanced Multi-Tenant Enterprise Resource Planning.</p>
            <p className="mt-2">Built with Next.js • Real-time PostgreSQL • Professional Grade</p>
          </div>
        </div>
      </footer>
    </div>
  )
}