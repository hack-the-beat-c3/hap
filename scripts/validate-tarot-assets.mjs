import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { TAROT_CARDS } from '../src/data/tarot.ts'

const assetDir = path.resolve('public/tarot')
const expected = TAROT_CARDS.map(({ imagePath }) => path.basename(imagePath)).sort()
const actual = (await readdir(assetDir)).filter((name) => name.endsWith('.png')).sort()
assert.deepEqual(actual, expected, '타로 PNG 파일명 또는 개수가 카드 데이터와 다릅니다.')

for (const filename of expected) {
  const png = await readFile(path.join(assetDir, filename))
  assert.equal(png.subarray(1, 4).toString(), 'PNG', `${filename}: PNG 형식이 아닙니다.`)
  assert.equal(png.readUInt32BE(16), 1024, `${filename}: 너비가 1024px이 아닙니다.`)
  assert.equal(png.readUInt32BE(20), 1536, `${filename}: 높이가 1536px이 아닙니다.`)
}

process.stdout.write(`tarot-assets: PASS (${expected.length} files, 1024x1536 PNG)\n`)
