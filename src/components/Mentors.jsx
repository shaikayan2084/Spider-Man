import { motion } from 'framer-motion'
import './Mentors.css'

const MENTORS = [
  {
    spidey: 'Tobey Maguire',
    spideyImg: '/images/tobey-ref.jpg',
    mentor: 'Dr. Otto Octavius',
    role: 'Nuclear Physicist & Mentor',
    era: 'Spider-Man 2 (2004)',
    color: '#cc0000',
    quote: 'Sometimes, to do what\'s right, we have to be steady and give up the thing we want the most.',
    desc: 'Before the tentacles took control, Otto Octavius was Peter Parker\'s respected professor and scientific idol. A brilliant nuclear physicist working on a fusion reactor, he mentored Peter academically and represented the responsible scientist Peter aspired to become.',
    before: 'A kind-hearted genius who believed in science for the betterment of humanity.',
    after: 'Consumed by his own creation, but ultimately redeemed by Peter\'s belief in him.',
    relation: 'Scientific idol turned tragic villain — redeemed by his student.',
  },
  {
    spidey: 'Andrew Garfield',
    spideyImg: '/images/andrew-ref.jpg',
    mentor: 'Dr. Curt Connors',
    role: 'Oscorp Scientist & Mentor',
    era: 'The Amazing Spider-Man (2012)',
    color: '#0066FF',
    quote: 'I wanted to make the world a better place. I wanted to help people.',
    desc: 'Dr. Curt Connors was the closest thing Peter Parker had to a father figure at Oscorp. A brilliant herpetologist working on cross-species genetics, he took Peter under his wing, sharing lab space and scientific wisdom. His desperate attempt to regrow his lost arm led to his transformation into The Lizard.',
    before: 'A gentle scientist driven by a noble dream — to create a world without amputees.',
    after: 'His good intentions twisted by the reptile serum, becoming the very monster he sought to cure.',
    relation: 'Father figure turned foe — a tragic fall from grace.',
  },
  {
    spidey: 'Tom Holland',
    spideyImg: '/images/tom-ref.jpg',
    mentor: 'Tony Stark',
    role: 'Iron Man & Avenger Mentor',
    era: 'Marvel Cinematic Universe (2016-2019)',
    color: '#E62429',
    quote: 'If you\'re nothing without the suit, then you shouldn\'t have it.',
    desc: 'Tony Stark saw something special in the kid from Queens. More than just supplying tech, Tony taught Peter about responsibility, sacrifice, and what it truly means to be an Avenger. From the training wheels protocol to that gut-wrenching hug before the snap — their bond was the emotional core of the MCU\'s Spider-Man story.',
    before: 'A billionaire genius who saw his younger self in Peter — talent without direction.',
    after: 'A mentor who gave Peter the greatest lesson: the hero makes the suit, not the other way around.',
    relation: 'Father figure who prepared his protégé to stand alone — and believed in him till the end.',
  },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 60, damping: 14 } },
}

export default function Mentors() {
  return (
    <div className="mentors-section">
      <motion.div className="mentors-inner" variants={container} initial="hidden" animate="visible">
        <motion.h2 className="mentors-heading" variants={fadeUp}>
          The Mentors Who Shaped Them
        </motion.h2>
        <motion.p className="mentors-sub" variants={fadeUp}>
          Every hero needs a guide. Every Spider-Man was forged by those who came before — or fell beside them.
        </motion.p>

        <div className="mentors-list">
          {MENTORS.map((m, i) => (
            <motion.div
              key={i}
              className="mentor-card"
              variants={fadeUp}
              style={{ '--m-color': m.color }}
            >
              <div className="mentor-spidey-section">
                <div className="mentor-avatar mentor-avatar-spidey">
                  <img src={m.spideyImg} alt={m.spidey} />
                </div>
                <div className="mentor-connector" style={{ background: m.color }}>
                  <span className="mentor-connector-icon">→</span>
                </div>
                <div className="mentor-avatar mentor-avatar-mentor">
                  <div className="mentor-avatar-placeholder" style={{ background: `linear-gradient(135deg, ${m.color}, #1a1a2e)` }}>
                    <span className="mentor-avatar-initials">
                      {m.mentor.split(' ').map(s => s[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mentor-body">
                <div className="mentor-tag" style={{ background: m.color }}>
                  {m.era}
                </div>
                <h3 className="mentor-spidey-name">{m.spidey}</h3>
                <h4 className="mentor-name" style={{ color: m.color }}>{m.mentor}</h4>
                <span className="mentor-role">{m.role}</span>

                <div className="mentor-quote">
                  <span className="mentor-quote-mark">&ldquo;</span>
                  <p>{m.quote}</p>
                  <span className="mentor-quote-mark">&rdquo;</span>
                </div>

                <p className="mentor-desc">{m.desc}</p>

                <div className="mentor-dual">
                  <div className="mentor-phase mentor-before">
                    <span className="mentor-phase-label">Before</span>
                    <p>{m.before}</p>
                  </div>
                  <div className="mentor-phase mentor-after">
                    <span className="mentor-phase-label">After</span>
                    <p>{m.after}</p>
                  </div>
                </div>

                <div className="mentor-relation" style={{ borderColor: m.color }}>
                  <span className="mentor-relation-label">The Bond</span>
                  <p>{m.relation}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
