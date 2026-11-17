import { BLOG_URL, CONTACT_EMAIL, LINKEDIN_URL, X_URL } from '../components/icons/Logo'
import { LegalPage } from './LegalPage'

export function CookiePage() {
  return (
    <LegalPage
      title="Cookie policy"
      lead="This website does not use cookies. This page says what that means."
    >
      <section>
        <h2>Cookies on this website</h2>
        <p>
          predictionscience.org does not set cookies. There are no advertising cookies, no analytics cookies, and
          nothing to accept or refuse when you arrive.
        </p>
        <p>
          How we handle other personal information is in our <a href="/privacy-policy">privacy policy</a>.
        </p>
      </section>

      <section>
        <h2>Sites we link to</h2>
        <p>
          Some links leave this website. Those services set their own cookies under their own policies. On this site,
          that includes:
        </p>
        <ul>
          <li>
            <a href={BLOG_URL}>Our newsletter on Substack</a>
          </li>
          <li>
            <a href={LINKEDIN_URL}>LinkedIn</a>
          </li>
          <li>
            <a href={X_URL}>X</a>
          </li>
        </ul>
      </section>

      <section>
        <h2>Your browser</h2>
        <p>
          You can block or delete cookies in your browser settings. Because this site does not set any, that will not
          change how predictionscience.org works.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          If we start using cookies, we will update this page and the date at the top before we do. Questions can go
          to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
    </LegalPage>
  )
}
