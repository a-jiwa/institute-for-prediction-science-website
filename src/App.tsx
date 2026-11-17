import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { SmoothScroll } from './components/layout/CookieBanner'
import { HomePage } from './pages/HomePage'
import { ResearchPage } from './pages/ResearchPage'
import { ServicePage } from './pages/ServicePage'
import { AboutInstitutePage } from './pages/AboutInstitutePage'
import { CareersPage } from './pages/CareersPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { CookiePage } from './pages/CookiePage'
import { DetailPage } from './pages/DetailPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { routerBasename } from './utils/assetUrl'

function App() {
  return (
    <SmoothScroll>
      <BrowserRouter basename={routerBasename || undefined}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/research" element={<ResearchPage />} />
            <Route path="/research/:slug" element={<DetailPage type="research" />} />
            <Route path="/services" element={<Navigate to={{ pathname: '/', hash: 'services' }} replace />} />
            <Route path="/services/:slug" element={<ServicePage />} />
            <Route path="/our-work" element={<Navigate to={{ pathname: '/', hash: 'services' }} replace />} />
            <Route
              path="/about"
              element={
                <div className="home-cover">
                  <AboutInstitutePage />
                </div>
              }
            />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/careers/:slug" element={<DetailPage type="career" />} />
            <Route path="/team/:slug" element={<DetailPage type="team" />} />
            <Route path="/privacy-policy" element={<PrivacyPage />} />
            <Route path="/cookie-policy" element={<CookiePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SmoothScroll>
  )
}

export default App
