import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { SmoothScroll } from './components/layout/CookieBanner'
import { HomePage } from './pages/HomePage'
import { ResearchPage } from './pages/ResearchPage'
import { AboutPage } from './pages/AboutPage'
import { CareersPage } from './pages/CareersPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { DetailPage } from './pages/DetailPage'
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
            <Route path="/about" element={<AboutPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/careers/:slug" element={<DetailPage type="career" />} />
            <Route path="/team/:slug" element={<DetailPage type="team" />} />
            <Route path="/privacy-policy" element={<PrivacyPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SmoothScroll>
  )
}

export default App
