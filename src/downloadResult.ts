import type { TarotCard } from './data/tarot.ts'
import type { SajuResult } from './domain/saju.ts'

export type DrawResult = Readonly<{
  card: TarotCard
  saju: SajuResult
  drawnAt: string
}>

export type DownloadArtifact = Readonly<{
  filename: string
  mimeType: 'image/png'
  width: 1080
  height: 1350
  blob: Blob
}>

const WIDTH = 1080
const HEIGHT = 1350
const ELEMENT_KO: Record<SajuResult['primaryElement'], string> = {
  WOOD: '목',
  FIRE: '화',
  EARTH: '토',
  METAL: '금',
  WATER: '수',
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('카드 이미지를 불러오지 못했습니다.'))
    image.src = src
  })
}

function wrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): number {
  const characters = [...text]
  const lines: string[] = []
  let line = ''

  for (const character of characters) {
    const next = line + character
    if (line && context.measureText(next).width > maxWidth) {
      lines.push(line)
      line = character
      if (lines.length === maxLines - 1) break
    } else {
      line = next
    }
  }
  if (line && lines.length < maxLines) lines.push(line)

  lines.forEach((value, index) => context.fillText(value, x, y + index * lineHeight))
  return y + lines.length * lineHeight
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('결과 이미지를 만들지 못했습니다.'))
    }, 'image/png')
  })
}

export async function renderResultPng(
  canvas: HTMLCanvasElement,
  result: DrawResult,
): Promise<DownloadArtifact> {
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas를 사용할 수 없습니다.')

  const cardImage = await loadImage(result.card.imagePath)
  const background = context.createLinearGradient(0, 0, WIDTH, HEIGHT)
  background.addColorStop(0, '#17152b')
  background.addColorStop(0.55, '#282044')
  background.addColorStop(1, '#5d2944')
  context.fillStyle = background
  context.fillRect(0, 0, WIDTH, HEIGHT)

  context.strokeStyle = 'rgba(240, 199, 123, 0.62)'
  context.lineWidth = 3
  context.strokeRect(38, 38, WIDTH - 76, HEIGHT - 76)

  context.fillStyle = '#f0c77b'
  context.font = '600 28px system-ui, sans-serif'
  context.textAlign = 'center'
  context.fillText('HAP · 오늘의 타로 한 장', WIDTH / 2, 88)

  const imageWidth = 360
  const imageHeight = 540
  context.drawImage(cardImage, (WIDTH - imageWidth) / 2, 120, imageWidth, imageHeight)
  context.strokeStyle = '#d7aa5c'
  context.lineWidth = 4
  context.strokeRect((WIDTH - imageWidth) / 2, 120, imageWidth, imageHeight)

  context.fillStyle = '#fff8e7'
  context.font = '700 48px system-ui, sans-serif'
  context.fillText(result.card.nameKo, WIDTH / 2, 728)
  context.fillStyle = '#d9c9ae'
  context.font = '500 24px system-ui, sans-serif'
  context.fillText(`${String(result.card.arcanaNumber).padStart(2, '0')} · ${result.card.nameEn}`, WIDTH / 2, 768)

  context.font = '700 31px system-ui, sans-serif'
  context.fillStyle = '#f0c77b'
  wrappedText(context, result.card.summary, WIDTH / 2, 828, 820, 42, 2)

  context.fillStyle = 'rgba(255, 248, 231, 0.1)'
  context.fillRect(94, 914, WIDTH - 188, 276)
  context.fillStyle = '#f0c77b'
  context.font = '600 22px system-ui, sans-serif'
  context.fillText(`오늘의 오행 · ${ELEMENT_KO[result.saju.primaryElement]}`, WIDTH / 2, 958)
  context.fillStyle = '#fff8e7'
  context.font = '700 32px system-ui, sans-serif'
  context.fillText(result.saju.title, WIDTH / 2, 1008)
  context.font = '500 25px system-ui, sans-serif'
  const afterSummary = wrappedText(context, result.saju.summary, WIDTH / 2, 1058, 770, 36, 2)
  context.fillStyle = '#f0c77b'
  wrappedText(context, result.card.partyMessage, WIDTH / 2, afterSummary + 10, 770, 36, 2)

  context.fillStyle = '#bcb0a4'
  context.font = '400 18px system-ui, sans-serif'
  context.fillText('생년월일 기반 엔터테인먼트용 간이 해석입니다.', WIDTH / 2, 1262)
  context.fillText('중요한 결정을 위한 예측이나 조언이 아닙니다.', WIDTH / 2, 1292)

  const blob = await canvasBlob(canvas)
  return {
    filename: `hap-tarot-${String(result.card.arcanaNumber).padStart(2, '0')}.png`,
    mimeType: 'image/png',
    width: WIDTH,
    height: HEIGHT,
    blob,
  }
}

export function downloadArtifact(artifact: DownloadArtifact): void {
  const url = URL.createObjectURL(artifact.blob)
  const link = document.createElement('a')
  link.href = url
  link.download = artifact.filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
