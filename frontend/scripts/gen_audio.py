import numpy as np
import wave
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "audio")
os.makedirs(OUT, exist_ok=True)
SR = 44100


def write_wav(name, data):
    data = np.clip(data, -1, 1)
    pcm = (data * 32767).astype(np.int16)
    path = os.path.join(OUT, name)
    with wave.open(path, "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("wrote", name, len(data) / SR, "s")


def env(n, attack, release):
    e = np.ones(n)
    a = int(attack * n)
    r = int(release * n)
    if a > 0:
        e[:a] = np.linspace(0, 1, a)
    if r > 0:
        e[-r:] = np.linspace(1, 0, r)
    return e


# soft tap: short sine blip
def ui_tap():
    d = 0.06
    n = int(SR * d)
    t = np.linspace(0, d, n, False)
    s = np.sin(2 * np.pi * 660 * t) * 0.25
    s *= env(n, 0.05, 0.8)
    write_wav("ui_tap.wav", s)


# card flip: quick downward chirp + click
def card_flip():
    d = 0.18
    n = int(SR * d)
    t = np.linspace(0, d, n, False)
    f = np.linspace(900, 420, n)
    s = np.sin(2 * np.pi * f * t) * 0.3
    s *= env(n, 0.02, 0.6)
    write_wav("card_flip.wav", s)


# card draw: soft whoosh (filtered noise rising)
def card_draw():
    d = 0.45
    n = int(SR * d)
    noise = np.random.randn(n)
    # simple lowpass via cumulative smoothing
    b = np.copy(noise)
    alpha = 0.02
    for i in range(1, n):
        b[i] = b[i - 1] * (1 - alpha) + noise[i] * alpha
    b = b / (np.max(np.abs(b)) + 1e-9)
    swell = np.linspace(0.1, 1.0, n) ** 2
    s = b * swell * 0.35
    s *= env(n, 0.1, 0.5)
    write_wav("card_draw.wav", s)


# scene lock: deep warm thud (two low sines)
def scene_lock():
    d = 0.5
    n = int(SR * d)
    t = np.linspace(0, d, n, False)
    s = (np.sin(2 * np.pi * 110 * t) * 0.5 + np.sin(2 * np.pi * 165 * t) * 0.3)
    s *= np.exp(-t * 6)
    write_wav("scene_lock.wav", s)


# tick: tiny high blip
def tick():
    d = 0.04
    n = int(SR * d)
    t = np.linspace(0, d, n, False)
    s = np.sin(2 * np.pi * 1200 * t) * 0.2
    s *= env(n, 0.05, 0.7)
    write_wav("tick.wav", s)


# ambient pad loop: slow detuned low sines, ~10s, loopable
def ambient():
    d = 12.0
    n = int(SR * d)
    t = np.linspace(0, d, n, False)
    base = 0.0
    for freq, amp in [(55, 0.18), (82.5, 0.10), (110, 0.08), (164.8, 0.05)]:
        lfo = 1 + 0.02 * np.sin(2 * np.pi * (0.07 + freq / 4000) * t)
        base += np.sin(2 * np.pi * freq * t * lfo) * amp
    # gentle breathing volume
    breath = 0.7 + 0.3 * np.sin(2 * np.pi * (1 / d) * t)
    s = base * breath
    # crossfade ends for seamless loop
    xf = int(SR * 1.5)
    s[:xf] *= np.linspace(0, 1, xf)
    s[-xf:] *= np.linspace(1, 0, xf)
    s = s / (np.max(np.abs(s)) + 1e-9) * 0.5
    write_wav("ambient.wav", s)


ui_tap()
card_flip()
card_draw()
scene_lock()
tick()
ambient()
print("done")
