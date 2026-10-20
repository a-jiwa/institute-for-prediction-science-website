import {
  KA_ASSESS_HERO,
  KA_ASSESS_SCORES,
  KA_ASSESS_TEACH,
} from './defaults'
import { KaAccordion } from './KaAccordion'
import { KaAssessSplit } from './KaAssessSplit'
import { KaClose } from './KaClose'
import { KaCourses } from './KaCourses'
import { KaFeatureCards } from './KaFeatureCards'
import { KaImpact } from './KaImpact'
import { KaIntro } from './KaIntro'
import { KaPullQuote } from './KaPullQuote'
import { KaQuote } from './KaQuote'
import { KaServices } from './KaServices'
import { KaSteps } from './KaSteps'
import { KaStudy } from './KaStudy'
import { KaSubjectChips } from './KaSubjectChips'

/** Full competitions stand-in layout as it was before copy customisation. */
export function KaStandInPage() {
  return (
    <div className="ka">
      <KaIntro />
      <KaFeatureCards />
      <KaAccordion />
      <KaSubjectChips />
      <KaServices />
      <KaImpact />
      <KaQuote />
      <KaStudy />
      <KaAssessSplit
        variant={KA_ASSESS_HERO.variant}
        title={KA_ASSESS_HERO.title}
        body={KA_ASSESS_HERO.body}
        image={KA_ASSESS_HERO.image}
        imageFirst={KA_ASSESS_HERO.imageFirst}
        actions={KA_ASSESS_HERO.actions}
      />
      <KaAssessSplit
        title={KA_ASSESS_SCORES.title}
        paragraphs={KA_ASSESS_SCORES.paragraphs}
        image={KA_ASSESS_SCORES.image}
        imageFirst={KA_ASSESS_SCORES.imageFirst}
      />
      <KaSteps />
      <KaAssessSplit
        media="calendar"
        title={KA_ASSESS_TEACH.title}
        paragraphs={KA_ASSESS_TEACH.paragraphs}
        image={KA_ASSESS_TEACH.image}
        imageFirst={KA_ASSESS_TEACH.imageFirst}
      />
      <KaPullQuote />
      <KaCourses />
      <KaClose />
    </div>
  )
}
