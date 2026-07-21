import { motion } from 'framer-motion'
import './ActorSection.css'

const ACTORS = {
  tobey: {
    id: 'tobey',
    name: 'Tobey Maguire',
    era: 'Sam Raimi Trilogy',
    years: '2002 — 2007',
    color: '#CC0000',
    accent1: '#FFCC00',
    accent2: '#1E90FF',
    bgGif: '/images/tobey-bg.gif',
    refImg: '/images/tobey-ref.jpg',
    actionImg: '/images/tobey-action.jpg',
    quote: 'With great power comes great responsibility.',
    desc: 'The one who started it all. Tobey Maguire\'s Peter Parker was an awkward, kind-hearted teen from Queens who learned that heroism isn\'t about strength — it\'s about sacrifice. His trilogy defined superhero cinema and gave us the most iconic Spider-Man story ever told.',
    sub: 'The Original Web-Slinger',
    films: ['Spider-Man (2002)', 'Spider-Man 2 (2004)', 'Spider-Man 3 (2007)'],
    suit: 'Classic Red & Blue — Organic Webbing',
    foe: 'Green Goblin · Doctor Octopus · Venom',
    traits: ['Selfless', 'Enduring', 'The Original Hero'],
    mask: 'The mask never changed. The man underneath did.',
  },
  andrew: {
    id: 'andrew',
    name: 'Andrew Garfield',
    era: 'The Amazing Spider-Man',
    years: '2012 — 2014',
    color: '#0066FF',
    accent1: '#FF6600',
    accent2: '#00CCFF',
    bgGif: '/images/andrew-bg.gif',
    refImg: '/images/andrew-ref.jpg',
    actionImg: '/images/andrew-action.jpg',
    quote: 'You have a gift. You have a responsibility.',
    desc: 'Agile, witty, and emotionally raw — Andrew Garfield brought a new kind of Spider-Man. His chemistry with Gwen Stacy remains one of cinema\'s most heartbreaking love stories. That swing through the city? Pure poetry in motion.',
    sub: 'The Amazing One',
    films: ['The Amazing Spider-Man (2012)', 'The Amazing Spider-Man 2 (2014)'],
    suit: 'Dark Red & Blue — Mechanical Webshooters',
    foe: 'The Lizard · Electro · Green Goblin',
    traits: ['Agile', 'Passionate', 'The Heartbreaker'],
    mask: 'He wore his heart on the mask.',
  },
  tom: {
    id: 'tom',
    name: 'Tom Holland',
    era: 'Marvel Cinematic Universe',
    years: '2016 — Present',
    color: '#E62429',
    accent1: '#FFD700',
    accent2: '#00D4FF',
    bgGif: '/images/tom-bg.gif',
    refImg: '/images/tom-ref.jpg',
    actionImg: '/images/tom-action.jpg',
    quote: 'If you\'re nothing without the suit, then you shouldn\'t have it.',
    desc: 'The kid who grew up in front of our eyes. Tom Holland\'s Spider-Man went from Iron Man\'s eager protégé to the multiverse hero who brought Tobey and Andrew together. He captures teenage energy like no one else — awkward, excited, and unstoppable.',
    sub: 'The MCU Hero',
    films: ['Civil War', 'Homecoming', 'Infinity War', 'Endgame', 'Far From Home', 'No Way Home'],
    suit: 'Stark Tech — AI Suit with Karen',
    foe: 'Vulture · Mysterio · Green Goblin',
    traits: ['Youthful', 'Tech-Savvy', 'The Uniter'],
    mask: 'He earned the suit. Then he outgrew it.',
  },
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 60, damping: 14 } },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
}

export default function ActorSection({ actorId }) {
  const a = ACTORS[actorId]

  return (
    <div className={`actor-section actor-${a.id}`}>
      <div className="actor-bg-layer">
        <img src={a.bgGif} alt="" className="actor-bg-gif" />
        <div className="actor-bg-overlay" />
      </div>

      <motion.div className="actor-inner" variants={container} initial="hidden" animate="visible">
        <motion.div className="actor-top" variants={container}>
          <motion.span className="actor-era-badge" variants={fadeUp} style={{ background: a.color }}>
            {a.era}
          </motion.span>
          <motion.h1 className="actor-name" variants={fadeUp}>
            {a.name}
          </motion.h1>
          <motion.span className="actor-years" variants={fadeUp} style={{ color: a.accent1 }}>
            {a.years}
          </motion.span>
          <motion.p className="actor-sub" variants={fadeUp}>
            {a.sub}
          </motion.p>
        </motion.div>

        <motion.div className="actor-quote-block" variants={fadeUp}>
          <span className="actor-quote-mark" style={{ color: a.color }}>&ldquo;</span>
          <p className="actor-quote-text">{a.quote}</p>
          <span className="actor-quote-mark" style={{ color: a.color }}>&rdquo;</span>
        </motion.div>

        <motion.div className="actor-main" variants={fadeUp}>
          <div className="actor-photo-col">
            <div className="actor-photo-frame">
              <img src={a.refImg} alt={a.name} />
              <div className="actor-photo-glow" style={{ boxShadow: `0 0 60px ${a.color}40, 0 0 120px ${a.color}20` }} />
            </div>
          </div>

          <div className="actor-info-col">
            <motion.p className="actor-desc" variants={fadeUp}>{a.desc}</motion.p>

            <motion.div className="actor-detail-grid" variants={fadeUp}>
              <div className="actor-detail-card" style={{ borderColor: a.color }}>
                <span className="actor-detail-icon" style={{ color: a.color }}>🎬</span>
                <h4>Films</h4>
                <ul className="actor-film-list">
                  {a.films.map((f, i) => (
                    <li key={i} style={{ '--dot': a.color }}>{f}</li>
                  ))}
                </ul>
              </div>

              <div className="actor-detail-card" style={{ borderColor: a.accent1 }}>
                <span className="actor-detail-icon" style={{ color: a.accent1 }}>🕸️</span>
                <h4>Suit</h4>
                <p>{a.suit}</p>
              </div>

              <div className="actor-detail-card" style={{ borderColor: a.accent2 }}>
                <span className="actor-detail-icon" style={{ color: a.accent2 }}>👹</span>
                <h4>Nemesis</h4>
                <p>{a.foe}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div className="actor-traits" variants={fadeUp}>
          {a.traits.map((t, i) => (
            <span key={i} className="actor-trait-tag" style={{ background: `${a.color}20`, borderColor: a.color, color: a.color }}>
              {t}
            </span>
          ))}
        </motion.div>

        <motion.p className="actor-mask-text" variants={fadeIn} style={{ color: a.accent1 }}>
          {a.mask}
        </motion.p>
      </motion.div>
    </div>
  )
}
