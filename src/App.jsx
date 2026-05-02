import { HashRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import AdminPage from './pages/AdminPage.jsx'

export default function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/admin" element={<AdminPage />} />
            </Routes>
        </HashRouter>
    )
}
