import { useParams } from 'react-router-dom'
import { ArticlePage } from '../components/research/ArticlePage'

export function DetailPage() {
  const { slug = '' } = useParams()
  return <ArticlePage slug={slug} />
}
