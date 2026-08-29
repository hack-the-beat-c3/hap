// E2E 검증: 호스트 생성 → 게스트 참여 → 동시 공개. 콘솔 에러 수집 + 단계별 스크린샷.
// 실행: node scripts/e2e.mjs  (dev 서버가 127.0.0.1:5188 에 떠 있어야 함)
import { chromium } from 'playwright'

const BASE = 'http://127.0.0.1:5188/'
const OUT = process.env.KIROCREW_SCRATCH || '/tmp'
const errors = []

const browser = await chromium.launch()
// 같은 context = 같은 BroadcastChannel 버스(호스트+게스트 탭 동기화).
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
ctx.on('console', (m) => {
  if (m.type() === 'error') errors.push('[console] ' + m.text())
})
ctx.on('pageerror', (e) => errors.push('[pageerror] ' + e.message))

const host = await ctx.newPage()
await host.goto(BASE)
await host.getByRole('button', { name: '파티 만들기' }).click()
// 호스트 생년월일 입력
await host.getByLabel('닉네임').fill('민지(호스트)')
await host.locator('.row3 input').nth(0).fill('1996')
await host.locator('.row3 input').nth(1).fill('3')
await host.locator('.row3 input').nth(2).fill('21')
await host.getByText('출생 시각 모름').click()
await host.getByRole('button', { name: '파티 열기' }).click()
await host.waitForSelector('.pin-big')
const pin = (await host.locator('.pin-big').textContent())?.trim()
console.log('STEP1 host created room, PIN =', pin)
await host.screenshot({ path: `${OUT}/step1-host-lobby.png` })

// 게스트 탭
const guest = await ctx.newPage()
await guest.goto(`${BASE}?pin=${pin}`)
await guest.getByLabel('닉네임').fill('현우(게스트)')
await guest.locator('.row3 input').nth(0).fill('1994')
await guest.locator('.row3 input').nth(1).fill('7')
await guest.locator('.row3 input').nth(2).fill('9')
await guest.locator('label:has-text("출생 시각") input').first().fill('14')
await guest.getByRole('button', { name: '입장하기' }).click()
await guest.waitForSelector('.players')
await guest.getByRole('button', { name: '준비 완료' }).click()
console.log('STEP2 guest joined + ready')
// 호스트 화면에 게스트가 보이는지(실시간 동기화)
await host.waitForSelector('.players li:has-text("현우")', { timeout: 3000 })
const count = await host.locator('.players li').count()
console.log('STEP2 host sees participants =', count)
await host.screenshot({ path: `${OUT}/step2-host-sees-guest.png` })

// 공개
await host.getByRole('button', { name: /카드 공개/ }).click()
await host.waitForSelector('.crown-name', { timeout: 3000 })
await guest.waitForSelector('.crown-name', { timeout: 3000 })
const hostWinner = (await host.locator('.crown-name').textContent())?.trim()
const guestWinner = (await guest.locator('.crown-name').textContent())?.trim()
console.log('STEP3 host winner =', hostWinner)
console.log('STEP3 guest winner =', guestWinner)
console.log('STEP3 winners match =', hostWinner === guestWinner)
const chemRows = await host.locator('.chem-table tbody tr').count()
console.log('STEP3 chemistry matrix rows =', chemRows)
await host.screenshot({ path: `${OUT}/step3-reveal.png`, fullPage: true })

console.log('\nCONSOLE ERRORS:', errors.length === 0 ? 'none ✓' : errors)
await browser.close()
process.exit(errors.length === 0 && hostWinner === guestWinner && count === 2 ? 0 : 1)
