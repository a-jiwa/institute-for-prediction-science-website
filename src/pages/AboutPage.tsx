import { HeroSection } from '../components/sections/HomeSections'

const paragraphs = [
  'We aim to advance the practice and science of forecasting, helping people and organisations make better predictions and better decisions. Through competitions, training, research and new applications of forecasting and prediction-market data, we make forecasting measurable, engaging and accessible.',
  'Like any skill, forecasting improves with practice and feedback. We build the tools and frameworks that allow people to test their judgement, learn from outcomes and track their progress over time.',
  'Our work brings together research and practical experimentation. We collaborate with universities, companies and other organisations to develop forecasting ability, study how people predict and turn insights into useful tools and applications.',
  'Our ambition is to make forecasting a more rigorous, competitive and widely used discipline — improving how people and organisations navigate uncertainty.',
]

export function AboutPage() {
  return (
    <>
      <HeroSection lines={['About']} compact />
      <div className="home-cover about-page">
        <div className="page-stories">
          <article className="page-story">
            <div className="container">
              <div className="page-story__copy">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  )
}
