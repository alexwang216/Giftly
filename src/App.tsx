import { Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import HomePage from "./pages/HomePage";
import CardDetailPage from "./pages/CardDetailPage";
import ReloadPrompt from "./components/pwa/ReloadPrompt";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/card/:cardId" element={<CardDetailPage />} />
      </Routes>
      <ReloadPrompt />
    </AppShell>
  );
}
