import { motion } from 'framer-motion'

const LEFT = [
  { key: 'hero', label: 'Home', icon: '🏠' },
  { key: 'tobey', label: 'Tobey', icon: '🕷' },
  { key: 'andrew', label: 'Andrew', icon: '⚡' },
  { key: 'tom', label: 'Tom', icon: '🕸' },
]

const RIGHT = [
  { key: 'mentors', label: 'Mentors', icon: '🧠' },
  { key: 'villains', label: 'Villains', icon: '👿' },
  { key: 'spiderverse', label: 'Spider-Verse', icon: '🌌' },
  { key: 'mission', label: 'Mission', icon: '🎯' },
]

const btnVariant = {
  hidden: { opacity: 0, y: -10 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.05 * i, duration: 0.3 },
  }),
}

export default function Navbar({ active, onNavigate }) {
  return (
    <nav className="navbar">
      <div className="nav-web-corner top-left" />
      <div className="nav-web-corner top-right" />

      <div className="nav-inner">
        <div className="nav-left-group">
          {LEFT.map(({ key, label, icon }, i) => (
            <motion.button
              key={label}
              className={`nav-btn ${active === key ? 'active' : ''}`}
              custom={i}
              variants={btnVariant}
              initial="hidden"
              animate="visible"
              onClick={() => onNavigate(key)}
            >
              <span className="nav-btn-glow" />
              <span className="nav-btn-icon">{icon}</span>
              <span className="nav-btn-label">{label}</span>
            </motion.button>
          ))}
        </div>

        <div className="nav-logo-wrap">
          <div className="nav-logo-web left-web" />
          <motion.div
            className="nav-logo"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
          >
            <span className="nav-logo-text">SPIDER</span>
            <span className="nav-logo-text nav-logo-accent">MAN</span>
            <div className="nav-logo-shine" />
            <div className="nav-logo-glow-ring" />
          </motion.div>
          <div className="nav-logo-web right-web" />
          <div className="nav-spider">🕷️</div>
        </div>

        <div className="nav-right-group">
          {RIGHT.map(({ key, label, icon }, i) => (
            <motion.button
              key={label}
              className={`nav-btn ${active === key ? 'active' : ''}`}
              custom={i + LEFT.length}
              variants={btnVariant}
              initial="hidden"
              animate="visible"
              onClick={() => onNavigate(key)}
            >
              <span className="nav-btn-glow" />
              <span className="nav-btn-icon">{icon}</span>
              <span className="nav-btn-label">{label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </nav>
  )
}
