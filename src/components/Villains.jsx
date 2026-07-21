import { motion } from 'framer-motion'
import './Villains.css'

const VILLAINS = [
  {
    name: 'Green Goblin',
    actor: 'Willem Dafoe',
    era: 'Tobey / Tom',
    color: '#00cc44',
    img: '',
    desc: 'The original arch-nemesis. Norman Osborne\'s split personality brought chaos to both the Raimi trilogy and the MCU multiverse.',
  },
  {
    name: 'Doctor Octopus',
    actor: 'Alfred Molina',
    era: 'Tobey / Tom',
    color: '#cc6600',
    img: '',
    desc: 'Four mechanical arms fused to his spine made Doc Ock one of Spider-Man\'s most brilliant and dangerous foes.',
  },
  {
    name: 'Venom',
    actor: 'Topher Grace',
    era: 'Tobey',
    color: '#000000',
    img: '',
    desc: 'The alien symbiote bonded with Eddie Brock, creating a dark mirror of Spider-Man with all his powers — and none of his restraint.',
  },
  {
    name: 'The Lizard',
    actor: 'Rhys Ifans',
    era: 'Andrew',
    color: '#006644',
    img: '',
    desc: 'Dr. Curt Connors\' reptilian alter ego. A brilliant scientist transformed into a monstrous predator in the sewers of New York.',
  },
  {
    name: 'Electro',
    actor: 'Jamie Foxx',
    era: 'Andrew / Tom',
    color: '#0044ff',
    img: '',
    desc: 'Max Dillon was an electrical engineer transformed into a living weapon of pure energy. Blue electricity crackles through his veins.',
  },
  {
    name: 'Vulture',
    actor: 'Michael Keaton',
    era: 'Tom',
    color: '#885500',
    img: '',
    desc: 'Adrian Toomes used salvaged Chitauri tech to build a flying suit of destruction — proving you don\'t need superpowers to be a deadly threat.',
  },
  {
    name: 'Mysterio',
    actor: 'Jake Gyllenhaal',
    era: 'Tom',
    color: '#22aa88',
    img: '',
    desc: 'Quentin Beck, Master of Illusions. The greatest trick he ever pulled was making the world believe he was a hero.',
  },
  {
    name: 'The Spot',
    actor: 'Jason Schwartzman',
    era: 'Animated',
    color: '#ffffff',
    img: '',
    desc: 'From comedic bank robber to multiversal threat. His portal powers made him the catalyst for the Spider-Verse collision.',
  },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 60, damping: 12 } },
}

export default function Villains() {
  return (
    <div className="villains-section">
      <motion.div
        className="villains-container"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 className="villains-heading" variants={fadeUp}>
          Rogues Gallery
        </motion.h2>
        <motion.p className="villains-sub" variants={fadeUp}>
          Every hero is only as great as the villains they face.
        </motion.p>

        <div className="villains-grid">
          {VILLAINS.map((v, i) => (
            <motion.div
              key={i}
              className="villain-card"
              variants={fadeUp}
              style={{ '--v-color': v.color }}
            >
              <div className="villain-icon" style={{ background: v.color }}>
                <span>?</span>
              </div>
              <div className="villain-body">
                <h3 className="villain-name">{v.name}</h3>
                <span className="villain-actor">{v.actor}</span>
                <span className="villain-era">{v.era}</span>
                <p className="villain-desc">{v.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
