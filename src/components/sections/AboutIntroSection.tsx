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
                We’re an independent research and innovation organisation exploring how forecasting can help
                people and organisations make better decisions under uncertainty.
              </h2>
            </div>
          </div>
          <div className="col-6-md">
            <div className="content">
              <p>
                We know that predictions influence decisions every day, but there are still relatively few ways
                to measure how good those predictions are, learn from mistakes and systematically improve. We
                want to change that by putting forecasting into practice, studying what works and developing
                new ways to use it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
