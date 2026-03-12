import "@testing-library/jest-dom/vitest";

class AudioMock {
  currentTime = 0;
  preload = "";
  volume = 1;

  load() {}

  pause() {}

  play() {
    return Promise.resolve();
  }
}

Object.defineProperty(globalThis, "Audio", {
  writable: true,
  value: AudioMock,
});
