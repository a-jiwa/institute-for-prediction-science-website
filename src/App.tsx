import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { SmoothScroll } from './components/layout/CookieBanner'
import { HomePage } from './pages/HomePage'
import { LabPage } from './pages/LabPage'
import { AboutInstitutePage } from './pages/AboutInstitutePage'
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
            <Route path="/research/:slug" element={<DetailPage />} />
            <Route
              path="/services/lab"
              element={
                <div className="home-cover">
                  <LabPage />
                </div>
              }
            />
            <Route
              path="/about"
              element={
                <div className="home-cover">
                  <AboutInstitutePage />
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
