import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import TeacherLogin from './pages/TeacherLogin'
import TeacherDashboard from './pages/TeacherDashboard'
import TeacherPresent from './pages/TeacherPresent'
import TeacherResults from './pages/TeacherResults'
import StudentJoin from './pages/StudentJoin'
import StudentAnswer from './pages/StudentAnswer'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<TeacherLogin />} />
          <Route
            path="/teacher"
            element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>}
          />
          <Route
            path="/teacher/present/:activityId"
            element={<ProtectedRoute><TeacherPresent /></ProtectedRoute>}
          />
          <Route
            path="/teacher/results/:activityId"
            element={<ProtectedRoute><TeacherResults /></ProtectedRoute>}
          />
          <Route path="/join" element={<StudentJoin />} />
          <Route path="/answer/:roomCode" element={<StudentAnswer />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
