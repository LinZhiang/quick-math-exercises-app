import perfectScoreUrl from '@/assets/voice/全部答对.wav?url'

/** 与单题「答对了」同类人声，默认音量即可 */
const PERFECT_SCORE_PLAYBACK_VOLUME = 1
/** 满分结果出现后延迟播放，避免与「答对了」叠在一起 */
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

/** 在用户交互时预加载，避免满分时异步失去浏览器播放权限 */
export function prepareQbPerfectMidi(): void {
  const audio = getPerfectAudio()
  if (audio.readyState < HTMLMediaElement.HAVE_METADATA) {
    audio.load()
  }
}

/** 在用户手势回调链内安排延迟播放 */
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
      /* 静音环境等 */
    }
  }, PERFECT_SCORE_PLAY_DELAY_MS)
  return true
}

/** 全部答对祝贺音（全部答对.wav） */
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
