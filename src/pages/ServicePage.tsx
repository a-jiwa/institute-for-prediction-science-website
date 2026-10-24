import { useParams } from 'react-router-dom'
import { getService } from '../data/services'
import { CompetitionsPage } from './CompetitionsPage'
import { LabPage } from './LabPage'
import { NotFoundPage } from './NotFoundPage'
import { TrainingPage } from './TrainingPage'

export function ServicePage() {
  const { slug } = useParams()
  const service = getService(slug)

  if (!service) return <NotFoundPage />

  if (service.id === 'competitions') {
    return (
      <div className="home-cover">
        <CompetitionsPage />
      </div>
    )
  }

  if (service.id === 'training') {
    return (
      <div className="home-cover">
        <TrainingPage />
      </div>
    )
  }

  if (service.id === 'lab') {
    return (
      <div className="home-cover">
        <LabPage />
      </div>
    )
  }

  return <NotFoundPage />
}
