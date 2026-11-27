# word-euphony

> Quantify the euphony (ease of pronunciation) of words, 0-100.

Status: **v0 (pre-release)**. `scoreSpelling` scores plain spelling with simple heuristics (length, vowel/consonant runs). IPA-based scoring is planned.

## Install

```
$ npm install word-euphony
```

## Usage

```js
import { scoreSpelling } from 'word-euphony'

scoreSpelling('lumora')
// => { score: 97, notes: ['理想的な文字数 (4-8字)', '滑らかな音節交替'] }
```

## Roadmap

1. Scoring layer on IPA phoneme sequences (syllable structure, sonority sequencing, per-language phonotactics)
2. Rule-based grapheme-to-phoneme for Romaji / Latin-style readings
3. English reading (later)

## Doc

[./test](./test)

## License

MIT © [anozon](https://anozon.me)
