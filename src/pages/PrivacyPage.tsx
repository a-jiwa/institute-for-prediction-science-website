import privacyContent from '../data/privacy-content.html?raw'

export function PrivacyPage() {
  return (
    <section className="post">
      <div className="inner">
        <div className="container">
          <div className="grid">
            <div className="col-8-sm">
              <h1 className="editorial-title">Privacy Policy</h1>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="grid">
          <div className="col-3-sm" />
          <div className="col-6-sm">
            <div className="content" dangerouslySetInnerHTML={{ __html: privacyContent }} />
          </div>
        </div>
      </div>
    </section>
  )
}
