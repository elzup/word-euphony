import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { scoreSpelling } from '../src/index.ts'

// 期待値は naming-lib の scorePhonetics (移植元) の出力と一致させている
describe('scoreSpelling', () => {
  test('4-8 文字で子音連続が短い語は高得点', () => {
    assert.deepEqual(scoreSpelling('lumora'), {
      score: 97,
      notes: ['理想的な文字数 (4-8字)', '滑らかな音節交替'],
    })
  })

  test('空文字は 0 点', () => {
    assert.deepEqual(scoreSpelling(''), { score: 0, notes: ['空文字'] })
  })

  test('記号と大文字は正規化される', () => {
    assert.deepEqual(scoreSpelling(' Lu-Mora! '), scoreSpelling('lumora'))
  })

  test('子音 4 連続以上は減点', () => {
    assert.deepEqual(scoreSpelling('strengthsx'), {
      score: 67,
      notes: ['子音クラスタ過密'],
    })
  })

  test('同一文字 3 連続と母音 3 連続は重ねて減点', () => {
    assert.deepEqual(scoreSpelling('booo'), {
      score: 62,
      notes: [
        '理想的な文字数 (4-8字)',
        '同一文字3連続',
        '母音3連続',
        '滑らかな音節交替',
      ],
    })
  })

  test('同母音連続 (aa) は減点', () => {
    assert.equal(scoreSpelling('aardvark').score, 80)
  })

  test('長すぎる語は 1 文字ごとに減点', () => {
    assert.equal(scoreSpelling('internationalization').score, 42)
  })

  test('短すぎる語は減点', () => {
    assert.equal(scoreSpelling('xyz').score, 77)
  })
})
