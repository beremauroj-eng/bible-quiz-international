(() => {
  "use strict";

  const ASSETS = Object.freeze({
    correct: "assets/sounds/correct.mp3",
    correctHard: "assets/sounds/correctHard.mp3",
    incorrect: "assets/sounds/incorrect.mp3",
    timeout: "assets/sounds/timeout.mp3",
    tick: "assets/sounds/tick.mp3",
    urgentTick: "assets/sounds/urgentTick.mp3",
    round: "assets/sounds/round.mp3",
    achievement: "assets/sounds/achievement.mp3",
    completeLow: "assets/sounds/completeLow.mp3",
    completeMid: "assets/sounds/completeMid.mp3",
    completeHigh: "assets/sounds/completeHigh.mp3",
    perfect: "assets/sounds/perfect.mp3",
    button: "assets/sounds/button.mp3",
    bookmark: "assets/sounds/bookmark.mp3",
    newQuiz: "assets/sounds/newQuiz.mp3",
    pageTurn: "assets/sounds/pageTurn.mp3",
  });

  const buffers = new Map();
  let ctx = null;
  let masterGain = null;
  let sfxGain = null;
  let compressor = null;
  let config = {
    enabled: true,
    masterVolume: 100,
    effectsVolume: 100,
    countdownSound: true,
  };

  function clamp(value, min = 0, max = 1) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  function ensureContext() {
    if (ctx) return ctx;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    ctx = new AudioContextClass();
    masterGain = ctx.createGain();
    sfxGain = ctx.createGain();
    compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 10;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.002;
    compressor.release.value = 0.22;
    sfxGain.connect(masterGain);
    masterGain.connect(compressor);
    compressor.connect(ctx.destination);
    applyVolumes(true);
    return ctx;
  }

  function volumeCurve(percent) {
    const normalised = clamp(percent / 100);
    return normalised === 0 ? 0 : Math.pow(normalised, 0.72);
  }

  function applyVolumes(immediate = false) {
    if (!ctx || !masterGain || !sfxGain) return;
    const now = ctx.currentTime;
    const ramp = immediate ? 0.001 : 0.08;
    const master = config.enabled ? volumeCurve(config.masterVolume) * 1.1 : 0;
    const effects = volumeCurve(config.effectsVolume) * 1.28;
    masterGain.gain.cancelScheduledValues(now);
    sfxGain.gain.cancelScheduledValues(now);
    masterGain.gain.setTargetAtTime(master, now, ramp);
    sfxGain.gain.setTargetAtTime(effects, now, ramp);
  }

  function configure(settings = {}) {
    config = {
      ...config,
      enabled: settings.sound !== undefined ? Boolean(settings.sound) : config.enabled,
      masterVolume: settings.masterVolume ?? config.masterVolume,
      effectsVolume: settings.effectsVolume ?? config.effectsVolume,
      countdownSound: settings.countdownSound !== undefined ? Boolean(settings.countdownSound) : config.countdownSound,
    };
    if (ctx) applyVolumes();
  }

  async function unlock() {
    const context = ensureContext();
    if (!context) return false;
    if (context.state === "suspended") await context.resume();
    preload();
    return true;
  }

  async function loadBuffer(name) {
    if (buffers.has(name)) return buffers.get(name);
    const context = ensureContext();
    const url = ASSETS[name];
    if (!context || !url) return null;
    const promise = fetch(url, { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`Sound request failed: ${response.status}`);
        return response.arrayBuffer();
      })
      .then((data) => context.decodeAudioData(data));
    buffers.set(name, promise);
    try {
      const decoded = await promise;
      buffers.set(name, decoded);
      return decoded;
    } catch (_) {
      buffers.delete(name);
      return null;
    }
  }

  async function play(name, options = {}) {
    if (typeof options === "boolean") options = { enabled: options };
    if (options.enabled === false || !config.enabled) return;
    const context = ensureContext();
    if (!context) return;
    if (context.state === "suspended") await context.resume();
    const buffer = await loadBuffer(name);
    if (!buffer || !config.enabled) return;
    const source = context.createBufferSource();
    const gain = context.createGain();
    const panner = context.createStereoPanner ? context.createStereoPanner() : null;
    source.buffer = buffer;
    gain.gain.value = clamp(options.volume ?? 1, 0, 1.5);
    source.connect(gain);
    if (panner) {
      panner.pan.value = clamp(options.pan ?? 0, -1, 1);
      gain.connect(panner);
      panner.connect(sfxGain);
    } else {
      gain.connect(sfxGain);
    }
    source.start(context.currentTime + Math.max(0, options.delay || 0));
    return source;
  }

  function countdown(remaining) {
    if (!config.enabled || !config.countdownSound || remaining > 5 || remaining < 1) return;
    play(remaining <= 2 ? "urgentTick" : "tick", {
      volume: remaining === 1 ? 1.18 : remaining === 2 ? 1.08 : 0.86,
    });
  }

  function performanceSound(percent) {
    if (percent === 100) return "perfect";
    if (percent >= 85) return "completeHigh";
    if (percent >= 60) return "completeMid";
    return "completeLow";
  }

  function preload(names = ["correct", "incorrect", "tick", "urgentTick", "button", "pageTurn"]) {
    if (!ctx) return;
    names.forEach((name) => loadBuffer(name));
  }

  window.BQAudio = { configure, unlock, preload, play, countdown, performanceSound };
})();
