import { motion } from 'framer-motion'
import './Mission.css'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 70, damping: 12 } },
}

export default function Mission() {
  return (
    <div className="mission-section">
      <motion.div
        className="mission-container"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="mission-line" variants={fadeUp} />
        <motion.h2 className="mission-heading" variants={fadeUp}>
          TO BE CONTINUED
        </motion.h2>
        <motion.div className="mission-line" variants={fadeUp} />
        <motion.p className="mission-sub" variants={fadeUp}>
          The Spider-Verse is infinite. The legacy lives on.
        </motion.p>

        <motion.div className="mission-quote" variants={fadeUp}>
          <p>
            "Whoever wears this mask, if they're doing the right thing,
            if they're helping people — they're Spider-Man."
          </p>
          <span>— Miles Morales</span>
        </motion.div>

        <motion.div className="mission-grid" variants={fadeUp}>
          <div className="mission-card" style={{ '--m-color': '#cc0000' }}>
            <span className="mission-era">2002 — 2007</span>
            <h3>Tobey Maguire</h3>
            <p>The one who started it all.</p>
          </div>
          <div className="mission-card" style={{ '--m-color': '#8b0000' }}>
            <span className="mission-era">2012 — 2014</span>
            <h3>Andrew Garfield</h3>
            <p>The one who kept swinging.</p>
          </div>
          <div className="mission-card" style={{ '--m-color': '#cc0000' }}>
            <span className="mission-era">2016 — Present</span>
            <h3>Tom Holland</h3>
            <p>The one who brought them home.</p>
          </div>
        </motion.div>

        <motion.p className="mission-credit" variants={fadeUp}>
          Inspired by the art of Nixell Cho • 360° Panorama
        </motion.p>
      </motion.div>
    </div>
  )
}
