import { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
import '@fontsource-variable/dm-sans/wght.css'
import '@fontsource/barlow-condensed/latin-600.css'
import '@fontsource/barlow-condensed/latin-600-italic.css'
import './styles/global.css'
import './styles/studio.css'
import { Layout } from './ui/Layout'
import Home, { ArticlePage, Collection, Journal, NotFound } from './pages/Home'
import { Notice, Story } from './pages/Story'
import Bag from './pages/Bag'

const Product = lazy(() => import('./pages/Product')),
  Studio = lazy(() => import('./studio/Studio'))
function ArticleRoute() {
  const { id } = useParams()
  return <ArticlePage id={id ?? ''} />
}
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Suspense
      fallback={
        <div className="app-loading" role="status">
          正在载入页面…
        </div>
      }
    >
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="collection" element={<Collection />} />
          <Route path="product/court-01" element={<Product />} />
          <Route path="customize" element={<Studio />} />
          <Route path="story" element={<Story />} />
          <Route path="journal" element={<Journal />} />
          <Route path="journal/:id" element={<ArticleRoute />} />
          <Route path="bag" element={<Bag />} />
          <Route path="concept-notice" element={<Notice />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  </BrowserRouter>,
)
