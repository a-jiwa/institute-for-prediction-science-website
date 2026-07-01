import { Btn } from '../ui/Btn'

export function AboutIntroSection() {
  return (
    <section className="text">
      <div className="bg">
        <div className="parallax">
          <div className="svg" data-bg="text" aria-hidden />
        </div>
      </div>

      <div className="container">
        <div className="grid">
          <div className="col-12-sm">
            <div className="f--subtitle">About us</div>
          </div>
        </div>

        <div className="grid vstart-md">
          <div className="col-6-md">
            <div className="max">
              <h2>
                We apply the science of forecasting and probabilistic reasoning to transform how individuals
                and organisations make decisions under uncertainty.
              </h2>
            </div>
          </div>
          <div className="col-6-md">
            <div className="content">
              <p>
                Groundbreaking research — spearheaded by Philip Tetlock and colleagues — established that
                structured probabilistic thinking dramatically outperforms conventional expert intuition and
                gut-based decision-making. Adnaan Jiwa builds on this foundation by taking these insights
                out of the academic world and into practical reality — developing forecasting platforms,
                building prediction market tools, running annual forecasting competitions, and consulting
                on how to apply rigorous probabilistic thinking to real-world decisions. These methods are
                then brought to executives, organisations, and individuals to improve the quality of
                decisions on consequential issues.
              </p>
              <div className="cta">
                <Btn href="/research" orange>
                  Explore our research
                </Btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
