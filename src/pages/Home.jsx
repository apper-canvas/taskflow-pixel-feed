import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'

const Home = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-50 glass-effect border-b border-white/20 dark:border-surface-700/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-soft">
                <ApperIcon name="CheckSquare" className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold gradient-text">TaskFlow</h1>
                <p className="text-xs md:text-sm text-surface-600 dark:text-surface-400 hidden sm:block">Smart Task Management</p>
              </div>
            </motion.div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <motion.a 
                whileHover={{ y: -2 }}
                href="#dashboard" 
                className="text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
              >
                Dashboard
              </motion.a>
              <motion.a 
                whileHover={{ y: -2 }}
                href="#tasks" 
                className="text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
              >
                Tasks
              </motion.a>
              <motion.a 
                whileHover={{ y: -2 }}
                href="#analytics" 
                className="text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
              >
                Analytics
              </motion.a>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-3 md:space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 md:p-3 neu-button"
              >
                <ApperIcon 
                  name={isDarkMode ? "Sun" : "Moon"} 
                  className="w-5 h-5 md:w-6 md:h-6 text-surface-700 dark:text-surface-300" 
                />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl shadow-soft hover:shadow-card transition-all duration-300"
              >
                <ApperIcon name="Plus" className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-medium">New Task</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="sm:hidden p-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl shadow-soft"
              >
                <ApperIcon name="Plus" className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <MainFeature />
      </main>

      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary-200 to-secondary-200 dark:from-primary-900 dark:to-secondary-900 rounded-full opacity-20 blur-xl"
        />
        <motion.div
          animate={{ 
            y: [0, 30, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-accent/20 to-primary-200 dark:from-accent/10 dark:to-primary-900 rounded-full opacity-30 blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, 20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
          className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-br from-secondary-200 to-primary-200 dark:from-secondary-900 dark:to-primary-900 rounded-full opacity-15 blur-xl"
        />
      </div>
    </div>
  )
}

export default Home