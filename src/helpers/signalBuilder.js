export const SignalBuilder = {
  sinFormula: (w, t, phase = 0) => {
    return Math.sin((w * t) + phase)
  },

  cosFormula: (w, t, phase = 0) => {
    return Math.cos((w * t) + phase)
  },

  generateSignal: (freq, phase, duration, sampleRate, amp = 100) => {
    const w = 2 * Math.PI * freq
    let signal = []

    amp = Math.min(Math.abs(amp), 100)

    for (let i = 0; i < sampleRate * duration; i++) {
        const t = i * (1 / sampleRate)
        let value = 0

        value = amp * SignalBuilder.sinFormula(w, t, phase)

        signal.push(value)
    }

    return signal
  },

  generatePeriod: (freq, phase, sampleRate, freqP, nP = 1, amp = 100) => {
    nP = Math.floor(nP)
    const period = (1 / freqP) * nP

    return SignalBuilder.generateSignal(freq, phase, period, sampleRate, amp)
  }
}