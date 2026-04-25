import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { auth } from './api/client'
import LoginPage    from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import QueuePage    from './pages/QueuePage'
import ParentKidsPage from './pages/ParentKidsPage'
import TeacherStudentsPage from './pages/TeacherStudentsPage'
import TeacherQueuePage from './pages/TeacherQueuePage'

function PrivateRoute({ children }) {
  return auth.loggedIn() ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<LoginPage />} />
        <Route path="/register"  element={<RegisterPage />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/queue/:sectionId" element={<PrivateRoute><QueuePage /></PrivateRoute>} />
        <Route path="/kids"          element={<PrivateRoute><ParentKidsPage /></PrivateRoute>} />
        <Route path="/teacher"       element={<PrivateRoute><TeacherStudentsPage /></PrivateRoute>} />
        <Route path="/teacher-queue" element={<PrivateRoute><TeacherQueuePage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
