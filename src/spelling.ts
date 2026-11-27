export type EuphonyResult = {
  /** 0〜100。高いほど発音しやすい */
  score: number
  /** 加点・減点の理由 */
  notes: string[]
}

type Adjustment = { delta: number; note?: string }

/** 何も特徴が無い語の基準点。加点だけで上限近くに届くよう高めに置いている */
const BASE_SCORE = 82
const MIN_SCORE = 10
const MAX_SCORE = 100
/** 長すぎる語の 1 文字ごとの減点 */
const OVERLENGTH_PENALTY_PER_CHAR = 5
const LONG_THRESHOLD = 11

// y は語中でほぼ母音として読まれるため母音側に入れる
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y'])

const normalize = (word: string): string =>
  word
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

const isVowel = (ch: string): boolean => VOWELS.has(ch)

function lengthAdjustment(length: number): Adjustment {
  if (length < 4) return { delta: -10, note: '短すぎる' }
  if (length <= 8) return { delta: 10, note: '理想的な文字数 (4-8字)' }
  if (length <= LONG_THRESHOLD) return { delta: 3 }
  return {
    delta: -(length - LONG_THRESHOLD) * OVERLENGTH_PENALTY_PER_CHAR,
    note: 'やや長め',
  }
}

/** 母音・子音それぞれの最長連続数 */
function maxStreaks(word: string): { vowel: number; consonant: number } {
  const initial = { vowel: 0, consonant: 0, maxVowel: 0, maxConsonant: 0 }
  const result = [...word].reduce((acc, ch) => {
    const vowel = isVowel(ch) ? acc.vowel + 1 : 0
    const consonant = isVowel(ch) ? 0 : acc.consonant + 1
    return {
      vowel,
      consonant,
      maxVowel: Math.max(acc.maxVowel, vowel),
      maxConsonant: Math.max(acc.maxConsonant, consonant),
    }
  }, initial)
  return { vowel: result.maxVowel, consonant: result.maxConsonant }
}

function patternAdjustments(word: string): Adjustment[] {
  const streaks = maxStreaks(word)
  const consonantAdjustment: Adjustment =
    streaks.consonant >= 4
      ? { delta: -18, note: '子音クラスタ過密' }
      : streaks.consonant <= 2
        ? { delta: 5, note: '滑らかな音節交替' }
        : { delta: 0 }
  return [
    /(.)\1\1/.test(word) ? { delta: -25, note: '同一文字3連続' } : null,
    // ee / oo は英語で自然なので減点しない
    /(aa|ii|uu|yy)/.test(word) ? { delta: -12, note: '同母音連続' } : null,
    streaks.vowel >= 3 ? { delta: -10, note: '母音3連続' } : null,
    consonantAdjustment,
  ].filter((a): a is Adjustment => a !== null)
}

/**
 * 英字の綴りだけから発音しやすさを 0〜100 で採点する (v0 の簡易版)。
 * 発音記号には変換せず、文字数と母音・子音の並びを見る。
 */
export function scoreSpelling(word: string): EuphonyResult {
  const w = normalize(word)
  if (!w) return { score: 0, notes: ['空文字'] }

  const adjustments = [lengthAdjustment(w.length), ...patternAdjustments(w)]
  const raw = adjustments.reduce((sum, a) => sum + a.delta, BASE_SCORE)
  return {
    score: Math.max(MIN_SCORE, Math.min(MAX_SCORE, raw)),
    notes: adjustments.flatMap((a) => (a.note ? [a.note] : [])),
  }
}
