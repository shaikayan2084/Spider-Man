import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ActorSection from './components/ActorSection'
import Villains from './components/Villains'
import SpiderVerse360 from './components/SpiderVerse360'
import Mission from './components/Mission'
import Mentors from './components/Mentors'
import MusicPlayer from './components/MusicPlayer'
import './App.css'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

function App() {
  const [activeSection, setActiveSection] = useState('hero')

  return (
    <div className="app">
      <Navbar active={activeSection} onNavigate={setActiveSection} />
      <MusicPlayer />
      <main className="main-content">
        <AnimatePresence mode="wait">
          {activeSection === 'hero' && (
            <motion.div key="hero" {...pageVariants}>
              <Hero />
            </motion.div>
          )}
          {activeSection === 'tobey' && (
            <motion.div key="tobey" {...pageVariants}>
              <ActorSection actorId="tobey" />
            </motion.div>
          )}
          {activeSection === 'andrew' && (
            <motion.div key="andrew" {...pageVariants}>
              <ActorSection actorId="andrew" />
            </motion.div>
          )}
          {activeSection === 'tom' && (
            <motion.div key="tom" {...pageVariants}>
              <ActorSection actorId="tom" />
            </motion.div>
          )}
          {activeSection === 'villains' && (
            <motion.div key="villains" {...pageVariants}>
              <Villains />
            </motion.div>
          )}
          {activeSection === 'mentors' && (
            <motion.div key="mentors" {...pageVariants}>
              <Mentors />
            </motion.div>
          )}
          {activeSection === 'spiderverse' && (
            <motion.div key="spiderverse" className="spiderverse-section" {...pageVariants}>
              <SpiderVerse360 />
            </motion.div>
          )}
          {activeSection === 'mission' && (
            <motion.div key="mission" {...pageVariants}>
              <Mission />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
