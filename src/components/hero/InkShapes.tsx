import { useEffect, useRef } from 'react'

/** Same recipe as the Inkling hero artwork. */
const SEEDS = [
  4080338587, 2713983725, 38430317, 1770525004, 3398537396, 930963614, 338165897,
  2228226371, 1966101379, 3760791918, 4151914198,
]
const COLS = 24
const ROWS = 16
const ROUND = 0.8
const COUNT = 3
const DECLUTTER = 2
const BLACK = '#161311'
const PALETTE = ['#0155BF', '#EF402C', '#0E9972']
const VIEW_W = 660
const VIEW_H = 440

const CELL = Math.min(588 / COLS, 392 / ROWS)
const ORIGIN_X = (VIEW_W - COLS * CELL) / 2
const ORIGIN_Y = (VIEW_H - ROWS * CELL) / 2
const BLUR = Math.max(1, Math.round(1 + ROUND * 13))
const PAD = BLUR + 3
const FIELD_W = COLS * 10 + PAD * 2
const FIELD_H = ROWS * 10 + PAD * 2
const SAMPLE = CELL / 10
const FIELD_ORIGIN_X = ORIGIN_X - PAD * SAMPLE
const FIELD_ORIGIN_Y = ORIGIN_Y - PAD * SAMPLE

const BRUSH: [number, number][] = []
for (let x = -3; x <= 3; x++) {
  for (let y = -3; y <= 3; y++) {
    if (Math.hypot(y, x) <= 2.1) BRUSH.push([x, y])
  }
}

type Rand = () => number

type InkBlob = {
  base: Uint8Array
  color: string
  ghost: boolean
  dying: boolean
  fieldBase: Float32Array
  fieldNow: Float32Array
  fieldTo: Float32Array
  path: SVGPathElement | null
}

const EMPTY = new Float32Array(FIELD_W * FIELD_H)

function makeRand(seed: number): Rand {
  let state = seed | 0
  return () => {
    state = (state + 1831565813) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: T[], rand: Rand) {
  const copy = items.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function between(rand: Rand, min: number, max: number) {
  return min + rand() * (max - min)
}

function declutterOnce(grid: Uint8Array) {
  const next = grid.slice()
  let changed = false
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      let neighbors = 0
      if (x > 0 && grid[y * COLS + x - 1]) neighbors++
      if (x < COLS - 1 && grid[y * COLS + x + 1]) neighbors++
      if (y > 0 && grid[(y - 1) * COLS + x]) neighbors++
      if (y < ROWS - 1 && grid[(y + 1) * COLS + x]) neighbors++
      const index = y * COLS + x
      if (grid[index]) {
        if (neighbors <= 1) {
          next[index] = 0
          changed = true
        }
      } else if (neighbors >= 3) {
        next[index] = 1
        changed = true
      }
    }
  }
  return { out: next, changed }
}

function declutter(grid: Uint8Array, passes: number) {
  let current = grid
  for (let pass = 0; pass < passes; pass++) {
    const step = declutterOnce(current)
    current = step.out
    if (!step.changed) break
  }
  return current
}

function inkWalk(rand: Rand) {
  const grid = new Uint8Array(COLS * ROWS)
  let x = Math.floor(COLS / 2)
  let y = Math.floor(ROWS / 2)
  grid[y * COLS + x] = 1
  let filled = 1
  let guard = 0
  const target = Math.floor(COLS * ROWS * between(rand, 0.32, 0.44))
  while (filled < target && guard++ < 5000) {
    x = Math.max(0, Math.min(COLS - 1, x + [-1, 0, 1][Math.floor(rand() * 3)]))
    y = Math.max(0, Math.min(ROWS - 1, y + [-1, 0, 1][Math.floor(rand() * 3)]))
    const index = y * COLS + x
    if (!grid[index]) {
      grid[index] = 1
      filled++
    }
  }
  return grid
}

function paintDisk(grid: Uint8Array, cx: number, cy: number, radius: number) {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (Math.hypot(x - cx, y - cy) <= radius) grid[y * COLS + x] = 1
    }
  }
}

function cluster(cx: number, cy: number, kind: string, rand: Rand) {
  const grid = new Uint8Array(COLS * ROWS)
  if (kind === 'tiny') {
    const x = Math.round(cx)
    const y = Math.round(cy)
    const circles: [number, number, number][] = [
      [x, y, between(rand, 2, 2.3)],
      [x + (Math.floor(rand() * 3) - 1), y + (Math.floor(rand() * 3) - 1), between(rand, 1.5, 1.8)],
    ]
    for (const [px, py, radius] of circles) paintDisk(grid, px, py, radius)
    return grid
  }
  const medium = kind === 'med'
  const circles = medium ? 3 + Math.floor(rand() * 2) : 2 + Math.floor(rand() * 2)
  const spread = medium ? 1.9 : 1.3
  const radiusMin = medium ? 1.9 : 1.6
  const radiusMax = medium ? 2.7 : 2.2
  for (let i = 0; i < circles; i++) {
    paintDisk(
      grid,
      cx + between(rand, -spread, spread),
      cy + between(rand, -spread, spread),
      between(rand, radiusMin, radiusMax),
    )
  }
  return grid
}

function blurX(src: Float32Array, radius: number) {
  const out = new Float32Array(src.length)
  const span = radius * 2 + 1
  for (let y = 0; y < FIELD_H; y++) {
    let sum = 0
    for (let x = -radius; x <= radius; x++) {
      if (x >= 0 && x < FIELD_W) sum += src[x * FIELD_H + y]
    }
    for (let x = 0; x < FIELD_W; x++) {
      out[x * FIELD_H + y] = sum / span
      const leave = x - radius
      const enter = x + radius + 1
      if (leave >= 0 && leave < FIELD_W) sum -= src[leave * FIELD_H + y]
      if (enter >= 0 && enter < FIELD_W) sum += src[enter * FIELD_H + y]
    }
  }
  return out
}

function blurY(src: Float32Array, radius: number) {
  const out = new Float32Array(src.length)
  const span = radius * 2 + 1
  for (let x = 0; x < FIELD_W; x++) {
    const column = x * FIELD_H
    let sum = 0
    for (let y = -radius; y <= radius; y++) {
      if (y >= 0 && y < FIELD_H) sum += src[column + y]
    }
    for (let y = 0; y < FIELD_H; y++) {
      out[column + y] = sum / span
      const leave = y - radius
      const enter = y + radius + 1
      if (leave >= 0 && leave < FIELD_H) sum -= src[column + leave]
      if (enter >= 0 && enter < FIELD_H) sum += src[column + enter]
    }
  }
  return out
}

function raster(grid: Uint8Array) {
  let field = new Float32Array(FIELD_W * FIELD_H)
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!grid[y * COLS + x]) continue
      const x0 = PAD + x * 10
      const y0 = PAD + y * 10
      for (let sx = x0; sx < x0 + 10; sx++) {
        const column = sx * FIELD_H
        for (let sy = y0; sy < y0 + 10; sy++) field[column + sy] = 1
      }
    }
  }
  for (let pass = 0; pass < 3; pass++) {
    field = blurX(field, BLUR)
    field = blurY(field, BLUR)
  }
  return field
}

function contour(field: Float32Array) {
  const segments: [number, number][][] = []
  const at = (x: number, y: number) => field[x * FIELD_H + y]
  const point = (
    x1: number,
    y1: number,
    v1: number,
    x2: number,
    y2: number,
    v2: number,
  ): [number, number] => {
    const t = (0.5 - v1) / (v2 - v1 || 1e-9)
    return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)]
  }

  for (let x = 0; x < FIELD_W - 1; x++) {
    for (let y = 0; y < FIELD_H - 1; y++) {
      const tl = at(x, y)
      const tr = at(x + 1, y)
      const br = at(x + 1, y + 1)
      const bl = at(x, y + 1)
      const code =
        (tl >= 0.5 ? 1 : 0) | (tr >= 0.5 ? 2 : 0) | (br >= 0.5 ? 4 : 0) | (bl >= 0.5 ? 8 : 0)
      if (code === 0 || code === 15) continue

      const x0 = FIELD_ORIGIN_X + x * SAMPLE
      const x1 = FIELD_ORIGIN_X + (x + 1) * SAMPLE
      const y0 = FIELD_ORIGIN_Y + y * SAMPLE
      const y1 = FIELD_ORIGIN_Y + (y + 1) * SAMPLE
      const edges: Record<string, [number, number]> = {}
      if ((tl >= 0.5) !== (tr >= 0.5)) edges.t = point(x0, y0, tl, x1, y0, tr)
      if ((tr >= 0.5) !== (br >= 0.5)) edges.r = point(x1, y0, tr, x1, y1, br)
      if ((br >= 0.5) !== (bl >= 0.5)) edges.b = point(x1, y1, br, x0, y1, bl)
      if ((bl >= 0.5) !== (tl >= 0.5)) edges.l = point(x0, y1, bl, x0, y0, tl)
      const keys = Object.keys(edges)
      if (keys.length === 2) {
        segments.push([edges[keys[0]], edges[keys[1]]])
      } else if (keys.length === 4) {
        const average = (tl + tr + br + bl) / 4
        if (code === 5) {
          if (average >= 0.5) {
            segments.push([edges.t, edges.r], [edges.b, edges.l])
          } else {
            segments.push([edges.t, edges.l], [edges.r, edges.b])
          }
        } else if (average >= 0.5) {
          segments.push([edges.t, edges.l], [edges.r, edges.b])
        } else {
          segments.push([edges.t, edges.r], [edges.b, edges.l])
        }
      }
    }
  }
  return chain(segments)
}

function chain(segments: number[][][]) {
  const key = (point: number[]) => `${point[0].toFixed(2)},${point[1].toFixed(2)}`
  const links = new Map<string, number[][]>()
  const points = new Map<string, number[]>()
  for (const [a, b] of segments) {
    const ka = key(a)
    const kb = key(b)
    points.set(ka, a)
    points.set(kb, b)
    const fromA = links.get(ka)
    if (fromA) fromA.push(b)
    else links.set(ka, [b])
    const fromB = links.get(kb)
    if (fromB) fromB.push(a)
    else links.set(kb, [a])
  }
  const seen = new Set<string>()
  const loops: number[][][] = []
  for (const start of points.keys()) {
    if (seen.has(start)) continue
    const loop: number[][] = []
    let current = start
    let previous = ''
    while (!seen.has(current)) {
      seen.add(current)
      const point = points.get(current)
      if (!point) break
      loop.push(point)
      const next = (links.get(current) ?? []).find(
        (candidate) => key(candidate) !== previous && !seen.has(key(candidate)),
      )
      if (!next) break
      previous = current
      current = key(next)
    }
    if (loop.length > 8) loops.push(loop)
  }
  return loops
}

function resample(loop: number[][], count: number) {
  const closed = loop.concat([loop[0]])
  const lengths = [0]
  let total = 0
  for (let i = 1; i < closed.length; i++) {
    total += Math.hypot(closed[i][0] - closed[i - 1][0], closed[i][1] - closed[i - 1][1])
    lengths.push(total)
  }
  const points: number[][] = []
  const step = total / count
  let index = 0
  for (let i = 0; i < count; i++) {
    const distance = i * step
    while (index < lengths.length - 1 && lengths[index + 1] < distance) index++
    const span = lengths[index + 1] - lengths[index] || 1
    const t = (distance - lengths[index]) / span
    points.push([
      closed[index][0] + (closed[index + 1][0] - closed[index][0]) * t,
      closed[index][1] + (closed[index + 1][1] - closed[index][1]) * t,
    ])
  }
  return points
}

function round2(value: number) {
  return Math.round(value * 100) / 100
}

function loopToPath(points: number[][]) {
  const count = points.length
  const at = (index: number) => points[(index % count + count) % count]
  let path = `M${round2(at(0)[0])},${round2(at(0)[1])}`
  for (let i = 0; i < count; i++) {
    const prev = at(i - 1)
    const current = at(i)
    const next = at(i + 1)
    const after = at(i + 2)
    const c1x = current[0] + (next[0] - prev[0]) / 6
    const c1y = current[1] + (next[1] - prev[1]) / 6
    const c2x = next[0] - (after[0] - current[0]) / 6
    const c2y = next[1] - (after[1] - current[1]) / 6
    path += `C${round2(c1x)},${round2(c1y)} ${round2(c2x)},${round2(c2y)} ${round2(next[0])},${round2(next[1])}`
  }
  return `${path}Z`
}

function fieldToPath(field: Float32Array) {
  return contour(field)
    .map((loop) => {
      const count = Math.max(36, Math.min(200, Math.round(loop.length * 0.6)))
      return loopToPath(resample(loop, count))
    })
    .join(' ')
}

function brushCells(col: number, row: number) {
  const cells: number[] = []
  for (const [dx, dy] of BRUSH) {
    const x = col + dx
    const y = row + dy
    if (x >= 0 && y >= 0 && x < COLS && y < ROWS) cells.push(y * COLS + x)
  }
  return cells
}

function diskAt(col: number, row: number) {
  const grid = new Uint8Array(COLS * ROWS)
  for (const cell of brushCells(col, row)) grid[cell] = 1
  return grid
}

function createBlobs(seed: number): InkBlob[] {
  const rand = makeRand(seed || 1)
  const masks = [inkWalk(rand)]
  const colors = [BLACK]
  const palette = shuffle(PALETTE, rand)
  const spots: [number, number][] = [
    [COLS * 0.72, ROWS * 0.22],
    [COLS * 0.28, ROWS * 0.72],
    [COLS * 0.8, ROWS * 0.7],
  ]
  const kinds = shuffle(['med', 'small', 'tiny'], rand)
  for (let i = 0; i < COUNT && i < spots.length; i++) {
    const x = Math.max(0, Math.min(COLS - 1, spots[i][0]))
    const y = Math.max(0, Math.min(ROWS - 1, spots[i][1]))
    masks.push(cluster(x, y, kinds[i], rand))
    colors.push(palette[i % palette.length])
  }
  return masks.map((mask, index) => {
    const settled = declutter(mask, DECLUTTER)
    const field = raster(settled)
    return {
      base: settled,
      color: colors[index],
      ghost: false,
      dying: false,
      fieldBase: field,
      fieldNow: field.slice(),
      fieldTo: field,
      path: null,
    }
  })
}

function hitIndex(blobs: InkBlob[], col: number, row: number) {
  const cells = brushCells(col, row)
  for (let i = blobs.length - 1; i >= 0; i--) {
    if (blobs[i].ghost) continue
    if (cells.some((cell) => blobs[i].base[cell])) return i
  }
  return -1
}

export function InkShapes() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const marks = svg.querySelector('.ink-shapes__marks')
    if (!marks) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const seed = SEEDS[Math.floor(Math.random() * SEEDS.length)] >>> 0
    const blobs = createBlobs(seed)
    let frame = 0
    let running = false
    let hoverCell: string | null = null

    const syncPaths = () => {
      while (marks.childNodes.length < blobs.length) {
        marks.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'))
      }
      while (marks.childNodes.length > blobs.length) marks.lastChild?.remove()
      blobs.forEach((blob, index) => {
        const path = marks.childNodes[index] as SVGPathElement
        blob.path = path
        path.setAttribute('fill', blob.color)
        path.setAttribute('d', fieldToPath(blob.fieldNow))
      })
    }
    syncPaths()

    const dropGhost = () => {
      const ghost = blobs.find((blob) => blob.ghost)
      if (!ghost?.dying) return
      let peak = 0
      for (let i = 0; i < ghost.fieldNow.length; i++) {
        if (ghost.fieldNow[i] > peak) peak = ghost.fieldNow[i]
      }
      if (peak < 0.03) {
        blobs.splice(blobs.indexOf(ghost), 1)
        syncPaths()
      }
    }

    const step = () => {
      let maxDelta = 0
      for (const blob of blobs) {
        let local = 0
        for (let i = 0; i < blob.fieldNow.length; i++) {
          const delta = blob.fieldTo[i] - blob.fieldNow[i]
          blob.fieldNow[i] += delta * 0.14
          const abs = delta < 0 ? -delta : delta
          if (abs > local) local = abs
        }
        if (local > 0.0006 && blob.path) blob.path.setAttribute('d', fieldToPath(blob.fieldNow))
        if (local > maxDelta) maxDelta = local
      }
      dropGhost()
      if (maxDelta > 0.008) {
        frame = requestAnimationFrame(step)
      } else {
        for (const blob of blobs) blob.fieldNow.set(blob.fieldTo)
        dropGhost()
        for (const blob of blobs) blob.path?.setAttribute('d', fieldToPath(blob.fieldNow))
        running = false
      }
    }

    const kick = () => {
      if (reduced) {
        for (const blob of blobs) {
          blob.fieldNow.set(blob.fieldTo)
          blob.path?.setAttribute('d', fieldToPath(blob.fieldNow))
        }
        return
      }
      if (!running) {
        running = true
        frame = requestAnimationFrame(step)
      }
    }

    const ensureGhost = () => {
      const existing = blobs.find((blob) => blob.ghost)
      if (existing) return existing
      const ghost: InkBlob = {
        base: new Uint8Array(COLS * ROWS),
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        ghost: true,
        dying: false,
        fieldBase: EMPTY,
        fieldNow: new Float32Array(FIELD_W * FIELD_H),
        fieldTo: EMPTY,
        path: null,
      }
      blobs.push(ghost)
      syncPaths()
      return ghost
    }

    const hover = (cell: [number, number] | null) => {
      for (const blob of blobs) {
        if (!blob.ghost) blob.fieldTo = blob.fieldBase
      }
      const ghost = blobs.find((blob) => blob.ghost)
      if (cell) {
        const index = hitIndex(blobs, cell[0], cell[1])
        if (index >= 0) {
          const next = blobs[index].base.slice()
          for (const item of brushCells(cell[0], cell[1])) next[item] ^= 1
          blobs[index].fieldTo = raster(next)
          if (ghost) {
            ghost.dying = true
            ghost.fieldTo = EMPTY
          }
        } else {
          const follower = ghost ?? ensureGhost()
          follower.dying = false
          follower.base = diskAt(cell[0], cell[1])
          follower.fieldTo = raster(follower.base)
        }
      } else if (ghost) {
        ghost.dying = true
        ghost.fieldTo = EMPTY
      }
      kick()
    }

    const cellFromEvent = (event: PointerEvent) => {
      const rect = svg.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * VIEW_W
      const y = ((event.clientY - rect.top) / rect.height) * VIEW_H
      const col = Math.floor((x - ORIGIN_X) / CELL)
      const row = Math.floor((y - ORIGIN_Y) / CELL)
      if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return null
      return [col, row] as [number, number]
    }

    const onMove = (event: PointerEvent) => {
      const cell = cellFromEvent(event)
      const key = cell ? `${cell[0]},${cell[1]}` : null
      if (key === hoverCell) return
      hoverCell = key
      hover(cell)
    }

    const onLeave = () => {
      hoverCell = null
      const ghost = blobs.find((blob) => blob.ghost)
      if (ghost) {
        ghost.dying = true
        ghost.fieldTo = EMPTY
      }
      for (const blob of blobs) {
        if (!blob.ghost) blob.fieldTo = blob.fieldBase
      }
      kick()
    }

    const onDown = (event: PointerEvent) => {
      const cell = cellFromEvent(event)
      if (!cell) return
      const index = hitIndex(blobs, cell[0], cell[1])
      if (index >= 0) {
        for (const item of brushCells(cell[0], cell[1])) blobs[index].base[item] ^= 1
        blobs[index].fieldBase = raster(blobs[index].base)
        blobs[index].fieldTo = blobs[index].fieldBase
      } else {
        const ghost = ensureGhost()
        ghost.base = diskAt(cell[0], cell[1])
        ghost.ghost = false
        ghost.dying = false
        ghost.fieldBase = raster(ghost.base)
        ghost.fieldTo = ghost.fieldBase
        ghost.path?.setAttribute('fill', ghost.color)
      }
      hoverCell = null
      kick()
    }

    if (fine && !reduced) {
      svg.addEventListener('pointermove', onMove)
      svg.addEventListener('pointerleave', onLeave)
      svg.addEventListener('pointerdown', onDown)
    }

    return () => {
      cancelAnimationFrame(frame)
      svg.removeEventListener('pointermove', onMove)
      svg.removeEventListener('pointerleave', onLeave)
      svg.removeEventListener('pointerdown', onDown)
    }
  }, [])

  return (
    <div className="ink-shapes">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label="Abstract ink shapes"
      >
        <rect className="ink-shapes__bg" width={VIEW_W} height={VIEW_H} fill="transparent" />
        <g className="ink-shapes__marks" />
      </svg>
    </div>
  )
}
