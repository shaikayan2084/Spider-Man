import { useEffect, useRef } from 'react'

function generateHeroTheme(sampleRate = 44100) {
  const ctx = new OfflineAudioContext(1, sampleRate * 8, sampleRate)
  const sr = sampleRate

  const notes = [
    { fret: 52, dur: 0.4 },
    { fret: 52, dur: 0.2 },
    { fret: 56, dur: 0.3 },
    { fret: 59, dur: 0.3 },
    { fret: 64, dur: 0.6 },
    { fret: 59, dur: 0.3 },
    { fret: 56, dur: 0.3 },
    { fret: 52, dur: 0.4 },
    { fret: 54, dur: 0.3 },
    { fret: 56, dur: 0.3 },
    { fret: 59, dur: 0.3 },
    { fret: 61, dur: 0.4 },
    { fret: 59, dur: 0.3 },
    { fret: 56, dur: 0.3 },
    { fret: 54, dur: 0.3 },
    { fret: 52, dur: 0.6 },
    { fret: 59, dur: 0.3 },
    { fret: 64, dur: 0.4 },
    { fret: 68, dur: 0.3 },
    { fret: 71, dur: 0.4 },
    { fret: 73, dur: 0.6 },
    { fret: 71, dur: 0.3 },
    { fret: 68, dur: 0.3 },
    { fret: 64, dur: 0.3 },
    { fret: 61, dur: 0.4 },
    { fret: 59, dur: 0.8 },
  ]

  const freq = (m) => 440 * Math.pow(2, (m - 69) / 12)
  let time = 0

  const playNote = (f, dur) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = f
    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(0.12, time + 0.02)
    gain.gain.linearRampToValueAtTime(0.08, time + dur * 0.6)
    gain.gain.linearRampToValueAtTime(0, time + dur)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(time)
    osc.stop(time + dur)
  }

  notes.forEach((n) => {
    playNote(freq(n.fret), n.dur)
    time += n.dur
  })

  time += 0.5
  return ctx.startRendering().then((buffer) => buffer)
}

export default function MusicPlayer() {
  const startedRef = useRef(false)

  useEffect(() => {
    let audioCtx
    let source
    let gainNode

    generateHeroTheme().then((buffer) => {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      gainNode = audioCtx.createGain()
      gainNode.gain.value = 0

      source = audioCtx.createBufferSource()
      source.buffer = buffer
      source.loop = true
      source.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      source.start(0)

      const start = () => {
        if (startedRef.current) return
        startedRef.current = true
        if (audioCtx.state === 'suspended') audioCtx.resume()
        gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 1)
        document.removeEventListener('click', start)
        document.removeEventListener('touchstart', start)
      }

      document.addEventListener('click', start)
      document.addEventListener('touchstart', start)
    })

    return () => {
      if (source) { try { source.stop() } catch {} }
      if (audioCtx) audioCtx.close()
    }
  }, [])

  return null
}
