/**
 * 满分祝贺音（轻量版，用于 Cloudflare Pages 等体积敏感构建）
 */
import perfectScoreUrl from '@/assets/voice/答对了.wav?url'

const PERFECT_SCORE_PLAYBACK_VOLUME = 0.45
const PERFECT_SCORE_PLAY_DELAY_MS = 1000

let perfectAudio: HTMLAudioElement | null = null
let playDelayTimer: ReturnType<typeof setTimeout> | null = null

function getPerfectAudio(): HTMLAudioElement {
  if (!perfectAudio) {
    perfectAudio = new Audio(perfectScoreUrl)
    perfectAudio.preload = 'auto'
    perfectAudio.volume = PERFECT_SCORE_PLAYBACK_VOLUME
  }
  return perfectAudio
}

function clearPlayDelay(): void {
  if (playDelayTimer) {
    clearTimeout(playDelayTimer)
    playDelayTimer = null
  }
}

function resetPerfectAudio(): void {
  const audio = getPerfectAudio()
  audio.pause()
  audio.currentTime = 0
}

export function prepareQbPerfectMidi(): void {
  const audio = getPerfectAudio()
  if (audio.readyState < HTMLMediaElement.HAVE_METADATA) {
    audio.load()
  }
}

export function tryPlayQbPerfectMidiSync(): boolean {
  clearPlayDelay()
  resetPerfectAudio()
  playDelayTimer = setTimeout(() => {
    playDelayTimer = null
    try {
      const audio = getPerfectAudio()
      audio.currentTime = 0
      void audio.play()
    } catch {
      /* ignore */
    }
  }, PERFECT_SCORE_PLAY_DELAY_MS)
  return true
}

export async function startQbPerfectMidi(): Promise<boolean> {
  clearPlayDelay()
  resetPerfectAudio()
  return new Promise((resolve) => {
    playDelayTimer = setTimeout(() => {
      playDelayTimer = null
      const audio = getPerfectAudio()
      audio.currentTime = 0
      void audio
        .play()
        .then(() => resolve(true))
        .catch(() => resolve(false))
    }, PERFECT_SCORE_PLAY_DELAY_MS)
  })
}

export function stopQbPerfectMidi(): void {
  clearPlayDelay()
  if (!perfectAudio) return
  try {
    perfectAudio.pause()
    perfectAudio.currentTime = 0
  } catch {
    /* ignore */
  }
}
