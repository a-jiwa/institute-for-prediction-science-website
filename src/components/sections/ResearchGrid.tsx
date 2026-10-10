import { useMemo, useState } from 'react'
import { SmartLink } from '../ui/SmartLink'
import researchAll from '../../data/research-all.json'
import { assetUrl } from '../../utils/assetUrl'

const FILTER_OPTIONS = ['All', 'Working paper', 'Academic article', 'Project', 'Editorial']

type ResearchItem = {
  href: string
  external?: boolean
  type: string
  title: string
  image: string
  excerpt: string
  date: string
  size: string
}

function ItemLink({ item }: { item: ResearchItem }) {
  if (item.external) {
    return <a href={item.href} target="_blank" rel="noopener noreferrer" />
  }
  return <SmartLink href={item.href} />
}

function SmallCard({ item }: { item: ResearchItem }) {
  return (
    <section className="items">
      <div className="item">
        <ItemLink item={item} />
        <div className="top">
          <div className="thumb">
            <div className="label">{item.type}</div>
            {item.image && <img src={assetUrl(item.image)} alt="" loading="lazy" />}
          </div>
          <div className="f--h3 title">{item.title}</div>
        </div>
        {item.date && <div className="bottom">{item.date}</div>}
      </div>
    </section>
  )
}

function LargeCard({ item }: { item: ResearchItem }) {
  const isMedium = item.size.includes('Medium_')
  const isLeft = item.size.includes('_Left')
  const isRight = item.size.includes('_Right')
  const imageCol = isMedium ? 'col-4-sm' : 'col-6-sm'
  const textCol = isMedium ? 'col-8-sm' : 'col-6-sm'

  const thumb = item.image ? (
    <div className="thumb">
      <img src={assetUrl(item.image)} alt="" loading="lazy" />
    </div>
  ) : null

  const gridLink = (
    <>
      {isLeft && <div className={imageCol}>{thumb}</div>}
      <div className={textCol}>
        <div className="block">
          <div className="top">
            <div className="f--subtitle">{item.type}</div>
            <div className="f--h2 title">{item.title}</div>
            {item.excerpt && <div className="excerpt">{item.excerpt}</div>}
          </div>
          {item.date && <div className="date">{item.date}</div>}
        </div>
      </div>
      {isRight && <div className={imageCol}>{thumb}</div>}
    </>
  )

  return (
    <div>
      <div className="hidden-md">
        <SmallCard item={item} />
      </div>
      <div className="visible-md">
        <section className="item" style={{ ['--color' as string]: '#1F19CC' }}>
          {item.external ? (
            <a href={item.href} className="grid" target="_blank" rel="noopener noreferrer">
              {gridLink}
            </a>
          ) : (
            <SmartLink href={item.href} className="grid">
              {gridLink}
            </SmartLink>
          )}
        </section>
      </div>
    </div>
  )
}

function MasonryItem({ item }: { item: ResearchItem }) {
  const gridClass = item.size === 'Small' ? 'col-6-sm col-3-xmd' : 'col-12-sm'

  return (
    <div className={gridClass}>
      {item.size === 'Small' ? <SmallCard item={item} /> : <LargeCard item={item} />}
    </div>
  )
}

export function ResearchGrid() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const items = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (researchAll as ResearchItem[]).filter((item) => {
      const matchesFilter = filter === 'All' || item.type === filter
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.excerpt.toLowerCase().includes(q)
      return matchesFilter && matchesSearch
    })
  }, [filter, search])

  return (
    <div id="masonry">
      <div className="container">
        <div className="filters-drop">
          <button
            type="button"
            className={`drop${mobileFiltersOpen ? ' active' : ''}`}
            onClick={() => setMobileFiltersOpen((open) => !open)}
          >
            {filter === 'All' ? 'All research' : filter}
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
              <path d="M1 1L5 5L9 1" stroke="#102B23" />
            </svg>
          </button>

          <div className="filters">
            <ul className="bar" data-label="Type of research:">
              {FILTER_OPTIONS.map((option) => (
                <li key={option} className={filter === option ? 'active' : ''}>
                  <button
                    type="button"
                    onClick={() => {
                      setFilter(option)
                      setMobileFiltersOpen(false)
                    }}
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
            <div className="bar">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setMobileFiltersOpen(false)
                }}
              >
                <input
                  type="search"
                  placeholder="Research search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit">Go</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="list">
        <div className="container">
          <div className="grid">
            {items.map((item) => (
              <MasonryItem key={item.href} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
