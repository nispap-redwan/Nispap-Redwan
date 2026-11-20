/**
 * High-power Emergency Siren Synthesizer using Web Audio API
 * No external network audio files needed; plays immediately on all devices.
 */

class EmergencySiren {
  private ctx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private intervalId: number | null = null;
  private isPlaying = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startSiren() {
    if (this.isPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;

    // Master volume
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    // Primary oscillating tone
    this.osc1 = this.ctx.createOscillator();
    this.osc1.type = 'sawtooth';
    this.osc1.frequency.setValueAtTime(700, this.ctx.currentTime);

    // Secondary sub-tone for urgent punch
    this.osc2 = this.ctx.createOscillator();
    this.osc2.type = 'sine';
    this.osc2.frequency.setValueAtTime(350, this.ctx.currentTime);

    this.osc1.connect(this.gainNode);
    this.osc2.connect(this.gainNode);

    this.osc1.start();
    this.osc2.start();

    // Modulate pitch like a real village civil defense / police siren (700Hz to 1250Hz)
    let rising = true;
    let freq = 700;
    this.intervalId = window.setInterval(() => {
      if (!this.ctx || !this.osc1 || !this.isPlaying) return;
      if (rising) {
        freq += 60;
        if (freq >= 1200) rising = false;
      } else {
        freq -= 60;
        if (freq <= 650) rising = true;
      }
      this.osc1.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
      if (this.osc2) {
        this.osc2.frequency.setTargetAtTime(freq / 2, this.ctx.currentTime, 0.05);
      }
    }, 50);

    // Vibrate device if supported
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([500, 200, 500, 200, 800, 300]);
      } catch {
        // ignore
      }
    }

    // Voice announcement in Bengali
    this.speakVoiceAlert();
  }

  public speakVoiceAlert(text?: string) {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const alertMsg = new SpeechSynthesisUtterance(
          text || 'জরুরি সতর্কবার্তা! গ্রামে বিপদ বা ডাকাত চোরের আশঙ্কা দেখা দিয়েছে! সকল সচেতন যুবক দ্রুত এগিয়ে আসুন!'
        );
        alertMsg.lang = 'bn-BD';
        alertMsg.rate = 1.0;
        alertMsg.pitch = 1.1;
        window.speechSynthesis.speak(alertMsg);
      } catch {
        // ignore
      }
    }
  }

  public stopSiren() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.osc1) {
      try {
        this.osc1.stop();
        this.osc1.disconnect();
      } catch {
        // ignore
      }
      this.osc1 = null;
    }
    if (this.osc2) {
      try {
        this.osc2.stop();
        this.osc2.disconnect();
      } catch {
        // ignore
      }
      this.osc2 = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch {
        // ignore
      }
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }

  public isActive(): boolean {
    return this.isPlaying;
  }
}

export const sirenPlayer = new EmergencySiren();
