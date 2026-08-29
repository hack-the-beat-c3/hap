import assert from 'node:assert/strict'
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const cdpUrl = process.env.CDP_URL ?? 'http://127.0.0.1:9222'
const appUrl = process.env.APP_URL ?? 'http://127.0.0.1:5173'
const outputDir = path.resolve(process.argv[2] ?? 'docs/qa')
const startedAt = Date.now()
await mkdir(outputDir, { recursive: true })

const targetResponse = await fetch(`${cdpUrl}/json/new?${encodeURIComponent(appUrl)}`, { method: 'PUT' })
assert.equal(targetResponse.ok, true, `Chrome target 생성 실패: ${targetResponse.status}`)
const target = await targetResponse.json()
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})

let messageId = 0
const pending = new Map()
const browserErrors = []
const failedResponses = []
const requests = []

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.id) {
    const request = pending.get(message.id)
    if (!request) return
    pending.delete(message.id)
    if (message.error) request.reject(new Error(message.error.message))
    else request.resolve(message.result)
    return
  }

  if (message.method === 'Runtime.exceptionThrown') {
    browserErrors.push(message.params.exceptionDetails.text)
  }
  if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') {
    browserErrors.push(message.params.entry.text)
  }
  if (message.method === 'Network.requestWillBeSent') {
    requests.push({ method: message.params.request.method, url: message.params.request.url })
  }
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) {
    failedResponses.push(`${message.params.response.status} ${message.params.response.url}`)
  }
})

function send(method, params = {}) {
  const id = ++messageId
  socket.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }))
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

async function evaluate(expression) {
  const response = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  assert.equal(response.exceptionDetails, undefined, response.exceptionDetails?.text)
  return response.result.value
}

async function screenshot(filename) {
  const result = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
  await writeFile(path.join(outputDir, filename), Buffer.from(result.data, 'base64'))
}

try {
  await Promise.all([
    send('Page.enable'),
    send('Runtime.enable'),
    send('Network.enable'),
    send('Log.enable'),
  ])
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  })
  await send('Page.navigate', { url: appUrl })
  await wait(1200)

  assert.match(await evaluate('document.body.innerText'), /오늘의 기운을\s*한 장에 담다/)
  await screenshot('01-hero-mobile.png')

  await evaluate(`(() => {
    document.querySelectorAll('input[type="checkbox"]').forEach((input) => input.click())
    const input = document.querySelector('#birth-date')
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
    setter.call(input, '1994-07-16')
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
    document.querySelector('form').requestSubmit()
  })()`)
  await wait(250)

  const confirmation = await evaluate('document.body.innerText')
  assert.match(confirmation, /오늘의 오행/)
  assert.match(confirmation, /1994년 7월 16일/)
  await screenshot('02-saju-mobile.png')

  await evaluate(`(() => {
    Object.defineProperty(globalThis.crypto, 'getRandomValues', {
      configurable: true,
      value(values) { values[0] = 0; return values },
    })
    const button = [...document.querySelectorAll('button')]
      .find((item) => item.textContent.includes('타로카드로 오늘의 행운 1장 뽑아보기'))
    button.click()
  })()`)
  await wait(900)

  const result = await evaluate(`(() => ({
    text: document.body.innerText,
    birthDateInDom: document.documentElement.innerHTML.includes('1994-07-16'),
    localStorage: localStorage.length,
    sessionStorage: sessionStorage.length,
    downloadDisabled: document.querySelector('.download-button')?.disabled,
    cardLoaded: document.querySelector('.tarot-card img')?.complete && document.querySelector('.tarot-card img')?.naturalWidth > 0,
  }))()`)
  assert.match(result.text, /광대/)
  assert.equal(result.birthDateInDom, false)
  assert.equal(result.localStorage, 0)
  assert.equal(result.sessionStorage, 0)
  assert.equal(result.cardLoaded, true)
  assert.equal(result.downloadDisabled, false)
  await screenshot('03-result-mobile.png')

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await wait(200)
  await screenshot('04-result-desktop.png')

  await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: outputDir })
  await evaluate(`document.querySelector('.download-button').click()`)
  await wait(1500)
  const downloadedFiles = await readdir(outputDir)
  let resultPng
  for (const name of downloadedFiles.filter((item) => /^hap-tarot-00(?: \(\d+\))?\.png$/.test(item))) {
    if ((await stat(path.join(outputDir, name))).mtimeMs >= startedAt) resultPng = name
  }
  assert.ok(resultPng, '결과 PNG가 다운로드되지 않았습니다.')

  assert.deepEqual(browserErrors, [])
  assert.deepEqual(failedResponses, [])
  assert.equal(requests.some(({ method }) => !['GET', 'OPTIONS'].includes(method)), false)
  assert.equal(requests.some(({ url }) => url.includes('1994-07-16')), false)

  process.stdout.write(`${JSON.stringify({
    status: 'PASS',
    viewport: ['390x844', '1440x900'],
    card: '00-the-fool',
    screenshots: 4,
    browserErrors: 0,
    failedResponses: 0,
    userDataRequests: 0,
    download: resultPng,
  }, null, 2)}\n`)
} finally {
  socket.close()
  await fetch(`${cdpUrl}/json/close/${target.id}`).catch(() => undefined)
}
