import { CONTACT_EMAIL, SITE_NAME } from '../components/icons/Logo'
import { SITE_HOST } from '../data/site'
import { LegalPage } from './LegalPage'

export function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      lead="How the Institute handles personal information when you use this website."
    >
      <section>
        <h2>Who we are</h2>
        <p>
          {SITE_NAME} (“we”) is a research institute. This policy covers {SITE_HOST}: visits to the site,
          messages you send us, and the newsletter we point you to. It does not cover a research study, forecasting
          competition, or training programme. Those activities use their own notice.
        </p>
        <p>
          Questions about this policy can go to{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <p>This website does not ask you to create an account. We collect very little:</p>
        <ul>
          <li>The contents of emails you send us, including your email address.</li>
          <li>
            Standard server logs our host keeps so the site stays available and secure, such as IP address, browser
            type, and the pages requested.
          </li>
        </ul>
        <p>
          Our newsletter is published on Substack. If you subscribe, Substack collects that information under its own
          policy. We do not run the signup on this website.
        </p>
      </section>

      <section>
        <h2>How we use it</h2>
        <p>
          We use what you send us to reply, and we use server logs to keep the website working. We do not sell personal
          information, we do not use it for advertising, and we do not make automated decisions about you.
        </p>
      </section>

      <section id="cookies">
        <h2>Cookies</h2>
        <p>
          This website does not set cookies. Details are in our <a href="/cookie-policy">cookie policy</a>.
        </p>
      </section>

      <section>
        <h2>Who we share it with</h2>
        <p>We share personal information only when we need to:</p>
        <ul>
          <li>With the provider that hosts this website, so the site can run.</li>
          <li>With Substack, if you choose to subscribe to the newsletter there.</li>
          <li>When the law requires it, or to protect the institute, our people, or others.</li>
        </ul>
      </section>

      <section>
        <h2>How long we keep it</h2>
        <p>
          We keep email enquiries for as long as we need them to respond and keep a record of the exchange, then we
          delete them. Server logs are kept only for a short period.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can ask what we hold about you, ask us to correct it, or ask us to delete it. Email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We aim to reply within 30 days.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          This website is not aimed at children, and we do not knowingly collect personal information from them. If you
          believe we have, email us and we will delete it.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>We may update this policy. When we do, we change the date at the top of the page.</p>
      </section>
    </LegalPage>
  )
}
