import { useParams } from 'react-router-dom'
import { getService } from '../data/services'
import { CompetitionsStandIn } from './CompetitionsStandIn'
import { LabStandIn } from './LabStandIn'
import { NotFoundPage } from './NotFoundPage'
import { TrainingStandIn } from './TrainingStandIn'

export function ServicePage() {
  const { slug } = useParams()
  const service = getService(slug)

  if (!service) return <NotFoundPage />

  if (service.id === 'competitions') {
    return (
      <div className="home-cover">
        <CompetitionsStandIn />
      </div>
    )
  }

  if (service.id === 'training') {
    return (
      <div className="home-cover">
        <TrainingStandIn />
      </div>
    )
  }

  if (service.id === 'lab') {
    return (
      <div className="home-cover">
        <LabStandIn />
      </div>
    )
  }

  return <NotFoundPage />
}
