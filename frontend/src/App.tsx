import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './hooks/useTheme'
import Layout from './components/layout/Layout'
import HomePage from './components/HomePage'
import MoviesPage from './pages/MoviesPage'
import MovieDetailPage from './pages/MovieDetailPage'
import TVShowsPage from './pages/TVShowsPage'
import TVShowDetailPage from './pages/TVShowDetailPage'
import ScanPage from './pages/ScanPage'
import TestPage from './pages/TestPage'
import DetailTestPage from './pages/DetailTestPage'

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/tv-shows" element={<TVShowsPage />} />
          <Route path="/tv-shows/:id" element={<TVShowDetailPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/detail-test" element={<DetailTestPage />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  )
}

export default App
