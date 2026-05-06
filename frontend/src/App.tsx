import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TeacherDashboard from './pages/TeacherDashboard'
import TeacherPresent from './pages/TeacherPresent'
import StudentJoin from './pages/StudentJoin'
import StudentAnswer from './pages/StudentAnswer'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/teacher" replace />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/present/:activityId" element={<TeacherPresent />} />
        <Route path="/join" element={<StudentJoin />} />
        <Route path="/answer/:roomCode" element={<StudentAnswer />} />
      </Routes>
    </BrowserRouter>
  )
}
