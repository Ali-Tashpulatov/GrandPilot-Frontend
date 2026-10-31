import { Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from '@/components/SplashScreen';
import AppLayout from '@/components/layout/AppLayout';
import OverviewPage from '@/pages/OverviewPage';
import TicketsPage from '@/pages/TicketsPage';
import PlaygroundPage from '@/pages/PlaygroundPage';
import RulesPage from '@/pages/RulesPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SettingsPage from '@/pages/SettingsPage';

export default function App() {
  return (
    <SplashScreen>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/playground" element={<PlaygroundPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </SplashScreen>
  );
}
