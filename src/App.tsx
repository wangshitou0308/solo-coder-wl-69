import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import StoryDetailPage from '@/pages/StoryDetailPage';
import StorytellerListPage from '@/pages/StorytellerListPage';
import StorytellerDetailPage from '@/pages/StorytellerDetailPage';
import SubmitStoryPage from '@/pages/SubmitStoryPage';
import MyStoriesPage from '@/pages/MyStoriesPage';
import ReviewDashboardPage from '@/pages/ReviewDashboardPage';
import TagManagePage from '@/pages/TagManagePage';
import StorytellerManagePage from '@/pages/StorytellerManagePage';
import CategoryManagePage from '@/pages/CategoryManagePage';
import ExportDataPage from '@/pages/ExportDataPage';
import StatisticsPage from '@/pages/StatisticsPage';
import FavoritesPage from '@/pages/FavoritesPage';
import CollectionTasksPage from '@/pages/CollectionTasksPage';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-rice-50">
      <div className="card p-12 text-center max-w-md mx-4">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-cinnabar-50 flex items-center justify-center">
          <BookOpen className="w-12 h-12 text-cinnabar-500" />
        </div>
        <h1 className="font-serif text-4xl font-bold text-ink-900 mb-2">404</h1>
        <p className="text-ink-500 mb-6">您访问的页面不存在或已被移动</p>
        <Link to="/" className="btn-primary">
          返回首页
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/story/:id" element={<StoryDetailPage />} />
        <Route path="/storytellers" element={<StorytellerListPage />} />
        <Route path="/storyteller/:id" element={<StorytellerDetailPage />} />
        <Route path="/submit" element={<SubmitStoryPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/tasks" element={<CollectionTasksPage />} />
        <Route path="/stories/:id/edit" element={<SubmitStoryPage />} />
        <Route path="/contributor/my-stories" element={<MyStoriesPage />} />
        <Route path="/admin/review" element={<ReviewDashboardPage />} />
        <Route path="/admin/manage/tags" element={<TagManagePage />} />
        <Route path="/admin/manage/storytellers" element={<StorytellerManagePage />} />
        <Route path="/admin/manage/categories" element={<CategoryManagePage />} />
        <Route path="/admin/export" element={<ExportDataPage />} />
        <Route path="/admin/stats" element={<StatisticsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
