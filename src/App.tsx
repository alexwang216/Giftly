import { Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import HomePage from "./pages/HomePage";
import CardDetailPage from "./pages/CardDetailPage";
import SettingsPage from "./pages/SettingsPage";
import ReloadPrompt from "./components/pwa/ReloadPrompt";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/card/:cardId" element={<CardDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      <ReloadPrompt />
    </AppShell>
  );
}
