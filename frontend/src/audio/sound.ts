import { createAudioPlayer, AudioPlayer, setAudioModeAsync } from "expo-audio";

type Sfx = "tap" | "flip" | "draw" | "lock" | "tick";

const SOURCES = {
  tap: require("@/assets/audio/ui_tap.wav"),
  flip: require("@/assets/audio/card_flip.wav"),
  draw: require("@/assets/audio/card_draw.wav"),
  lock: require("@/assets/audio/scene_lock.wav"),
  tick: require("@/assets/audio/tick.wav"),
};

class SoundManager {
  private players: Partial<Record<Sfx, AudioPlayer>> = {};
  private ambientPlayer: AudioPlayer | null = null;
  private soundOn = true;
  private ambientOn = true;
  private ready = false;

  init() {
    if (this.ready) return;
    this.ready = true;
    try {
      setAudioModeAsync({ playsInSilentMode: true });
    } catch {}
  }

  setSound(on: boolean) {
    this.soundOn = on;
  }

  setAmbient(on: boolean) {
    this.ambientOn = on;
    if (!on) this.stopAmbient();
  }

  play(name: Sfx) {
    if (!this.soundOn) return;
    try {
      let p = this.players[name];
      if (!p) {
        p = createAudioPlayer(SOURCES[name]);
        p.volume = name === "tick" ? 0.4 : 0.7;
        this.players[name] = p;
      }
      p.seekTo(0);
      p.play();
    } catch {}
  }

  startAmbient() {
    if (!this.ambientOn) return;
    try {
      if (!this.ambientPlayer) {
        this.ambientPlayer = createAudioPlayer(require("@/assets/audio/ambient.wav"));
        this.ambientPlayer.loop = true;
        this.ambientPlayer.volume = 0.35;
      }
      this.ambientPlayer.seekTo(0);
      this.ambientPlayer.play();
    } catch {}
  }

  stopAmbient() {
    try {
      this.ambientPlayer?.pause();
    } catch {}
  }
}

export const sound = new SoundManager();
