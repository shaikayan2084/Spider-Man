import { motion } from 'framer-motion'
import './Actors.css'

const DATA = [
  {
    id: 'tobey',
    name: 'Tobey Maguire',
    era: 'Sam Raimi Trilogy',
    years: '2002 — 2007',
    color: '#cc0000',
    accent: '#ffcc00',
    bg: 'linear-gradient(135deg, #1a0000, #330000)',
    img: '/images/tobey-ref.jpg',
    quote: 'With great power comes great responsibility.',
    desc: 'The first live-action Spider-Man. Tobey\'s Peter Parker was a shy, awkward teen who grew into a hero through loss and sacrifice. His trilogy defined superhero cinema.',
    movies: ['Spider-Man', 'Spider-Man 2', 'Spider-Man 3'],
    suit: 'Classic red & blue — organic webs',
    foe: 'Green Goblin, Doc Ock, Venom',
  },
  {
    id: 'andrew',
    name: 'Andrew Garfield',
    era: 'The Amazing Spider-Man',
    years: '2012 — 2014',
    color: '#8b0000',
    accent: '#ff6600',
    bg: 'linear-gradient(135deg, #000033, #1a0000)',
    img: '/images/andrew-ref.jpg',
    quote: 'You have a gift. You have a responsibility.',
    desc: 'Agile, witty, and emotionally raw. Andrew brought a new energy — his chemistry with Gwen Stacy made for one of cinema\'s most heartbreaking love stories.',
    movies: ['The Amazing Spider-Man', 'The Amazing Spider-Man 2'],
    suit: 'Dark red & blue — mechanical webshooters',
    foe: 'The Lizard, Electro, Green Goblin',
  },
  {
    id: 'tom',
    name: 'Tom Holland',
    era: 'Marvel Cinematic Universe',
    years: '2016 — Present',
    color: '#cc0000',
    accent: '#ffd700',
    bg: 'linear-gradient(135deg, #1a1a2e, #0a0a15)',
    img: '/images/tom-ref.jpg',
    quote: 'If you\'re nothing without the suit, then you shouldn\'t have it.',
    desc: 'The MCU\'s Spider-Man. Tom captured teenage energy perfectly — from Iron Man\'s protégé to the multiverse hero who brought all three generations together.',
    movies: [
      'Civil War', 'Homecoming', 'Infinity War',
      'Endgame', 'Far From Home', 'No Way Home',
    ],
    suit: 'Stark Tech — AI suit with Karen',
    foe: 'Vulture, Mysterio, Green Goblin',
  },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 70, damping: 12 } },
}

export default function Actors() {
  return (
    <div className="actors-section">
      <motion.div
        className="actors-container"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 className="actors-heading" variants={fadeUp}>
          The Men Behind the Mask
        </motion.h2>
        <motion.p className="actors-sub" variants={fadeUp}>
          Three generations. Three interpretations. One legacy.
        </motion.p>

        <div className="actors-grid">
          {DATA.map((actor, i) => (
            <motion.div
              key={actor.id}
              className="actor-card"
              variants={fadeUp}
              style={{ '--card-accent': actor.color, '--card-bg': actor.bg }}
            >
              <div className="actor-card-bg" style={{ background: actor.bg }} />
              <div className="actor-img-wrap">
                <img src={actor.img} alt={actor.name} />
                <div className="actor-era-tag" style={{ background: actor.color }}>{actor.era}</div>
              </div>
              <div className="actor-info">
                <h3 className="actor-name" style={{ color: actor.accent }}>{actor.name}</h3>
                <span className="actor-years">{actor.years}</span>
                <p className="actor-quote" style={{ borderColor: actor.color }}>
                  &ldquo;{actor.quote}&rdquo;
                </p>
                <p className="actor-desc">{actor.desc}</p>
                <div className="actor-details">
                  <div className="actor-detail-row">
                    <span className="actor-detail-label">Films</span>
                    <span className="actor-detail-val">{actor.movies.join(' • ')}</span>
                  </div>
                  <div className="actor-detail-row">
                    <span className="actor-detail-label">Suit</span>
                    <span className="actor-detail-val">{actor.suit}</span>
                  </div>
                  <div className="actor-detail-row">
                    <span className="actor-detail-label">Nemesis</span>
                    <span className="actor-detail-val">{actor.foe}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
