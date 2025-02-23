"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiShield, FiSearch, FiAlertTriangle, FiUserCheck, FiTrendingUp, FiLock } from 'react-icons/fi';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <FiShield className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold">Nexus</span>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => router.push('/login')} className="text-sm font-medium hover:text-blue-400 transition-colors">
                Login
              </button>
              <button
                onClick={() => router.push('/onboarding')}
                className="bg-blue-500 hover:bg-blue-600 text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h1 className="text-5xl sm:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-8">
            Protect Your Platform
            <br />
            <span className="text-4xl sm:text-6xl">from High-Risk Users</span>
          </h1>
          <p className="mt-6 text-xl text-slate-300 max-w-3xl mx-auto">
            Identify and stop bad actors before they cause damage. Our data-driven platform helps you make informed decisions about who to trust.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/onboarding')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/25 transition-shadow"
            >
              Start Protecting Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/demo')}
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 rounded-xl font-bold text-lg border border-slate-700 hover:bg-slate-700 transition-colors"
            >
              Watch Demo
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="bg-slate-800/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700"
            >
              <div className="text-4xl font-bold text-blue-400">98%</div>
              <div className="mt-2 text-slate-300">Accuracy Rate</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700"
            >
              <div className="text-4xl font-bold text-blue-400">10+</div>
              <div className="mt-2 text-slate-300">Data Points</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700"
            >
              <div className="text-4xl font-bold text-blue-400">24/7</div>
              <div className="mt-2 text-slate-300">Real-time Protection</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg">Powerful features to keep your platform safe</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FiSearch className="w-8 h-8" />,
                title: 'Instant Verification',
                description: 'Check user history across platforms in milliseconds'
              },
              {
                icon: <FiTrendingUp className="w-8 h-8" />,
                title: 'Risk Scoring',
                description: 'Get detailed risk assessments powered by AI'
              },
              {
                icon: <FiAlertTriangle className="w-8 h-8" />,
                title: 'Early Warning',
                description: 'Detect potential threats before they become problems'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 transition-colors"
              >
                <div className="text-blue-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90" />
            <div className="relative px-8 py-16 sm:px-16 sm:py-24 text-center">
              <h2 className="text-4xl font-bold mb-4">
                Start protecting your platform today
              </h2>
              <p className="text-lg text-slate-100 mb-8 max-w-2xl mx-auto">
                Join thousands of platforms working together to create a safer digital environment.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/onboarding')}
                className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-100 transition-colors"
              >
                Get Started Now
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
