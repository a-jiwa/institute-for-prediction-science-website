import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { SmoothScroll } from './components/layout/CookieBanner'
import { HomePage } from './pages/HomePage'
import { LabPage } from './pages/LabPage'
import { AboutInstitutePage } from './pages/AboutInstitutePage'
import { PrivacyPage } from './pages/PrivacyPage'
import { CookiePage } from './pages/CookiePage'
import { DetailPage } from './pages/DetailPage'
import { CareersPage } from './pages/CareersPage'
import { JobPage } from './pages/JobPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { routerBasename } from './utils/assetUrl'

function App() {
  return (
    <SmoothScroll>
      <BrowserRouter basename={routerBasename || undefined}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/research"
              element={
                <div className="home-cover">
                  <LabPage />
                </div>
              }
            />
            <Route path="/research/:slug" element={<DetailPage />} />
            <Route path="/services/lab" element={<Navigate to="/research" replace />} />
            <Route
              path="/about"
              element={
                <div className="home-cover">
                  <AboutInstitutePage />
                </div>
              }
            />
            <Route
              path="/careers"
              element={
                <div className="home-cover">
                  <CareersPage />
                </div>
              }
            />
            <Route
              path="/careers/:jobId"
              element={
                <div className="home-cover">
                  <JobPage />
                </div>
              }
            />
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
