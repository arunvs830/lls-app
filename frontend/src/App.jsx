import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLayout from './layouts/AdminLayout';
import StaffLayout from './layouts/StaffLayout';
import StudentLayout from './layouts/StudentLayout';
import Dashboard from './pages/admin/Dashboard';

// Admin imports
import AcademicYearList from './pages/admin/academic-year/AcademicYearList';
import AcademicYearForm from './pages/admin/academic-year/AcademicYearForm';
import SemesterList from './pages/admin/semester/SemesterList';
import SemesterForm from './pages/admin/semester/SemesterForm';
import ProgramList from './pages/admin/program/ProgramList';
import ProgramForm from './pages/admin/program/ProgramForm';
import CourseList from './pages/admin/course/CourseList';
import CourseForm from './pages/admin/course/CourseForm';
import StaffList from './pages/admin/staff/StaffList';
import StaffForm from './pages/admin/staff/StaffForm';
import StudentList from './pages/admin/student/StudentList';
import StudentForm from './pages/admin/student/StudentForm';
import StaffCourseList from './pages/admin/staff-course/StaffCourseList';
import StaffCourseForm from './pages/admin/staff-course/StaffCourseForm';
import CertificateLayoutList from './pages/admin/certificates/CertificateLayoutList';
import CertificateDesigner from './pages/admin/certificates/CertificateDesigner';
// Staff imports
import StaffDashboard from './pages/staff/Dashboard';
import MyCourseList from './pages/staff/courses/MyCourseList';
import CourseVideos from './pages/staff/courses/CourseVideos';
import AddVideoForm from './pages/staff/courses/AddVideoForm';
import MaterialList from './pages/staff/materials/MaterialList';
import MaterialForm from './pages/staff/materials/MaterialForm';
import AssignmentList from './pages/staff/assignments/AssignmentList';
import AssignmentForm from './pages/staff/assignments/AssignmentForm';
import SubmissionList from './pages/staff/assignments/SubmissionList';
import MCQList from './pages/staff/mcq/MCQList';
import MCQForm from './pages/staff/mcq/MCQForm';

// Student imports
import StudentDashboard from './pages/student/Dashboard';
import StudentCourseList from './pages/student/courses/CourseList';
import StudentCourseMaterials from './pages/student/courses/CourseMaterials';
import CourseEnrollment from './pages/student/courses/CourseEnrollment';
import StudentResultList from './pages/student/results/ResultList';
import StudentAssignmentList from './pages/student/assignments/StudentAssignmentList';
import SubmissionForm from './pages/student/assignments/SubmissionForm';
import QuizList from './pages/student/quiz/QuizList';
import QuizPlayer from './pages/student/quiz/QuizPlayer';
import QuizResults from './pages/student/quiz/QuizResults';
import MaterialQuizPlayer from './pages/student/quiz/MaterialQuizPlayer';

// Shared imports
import Inbox from './pages/messages/Inbox';
import Compose from './pages/messages/Compose';
import MessageDetail from './pages/messages/MessageDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/academic-years" element={<AdminLayout><AcademicYearList /></AdminLayout>} />
        <Route path="/admin/academic-years/new" element={<AdminLayout><AcademicYearForm /></AdminLayout>} />
        <Route path="/admin/semesters" element={<AdminLayout><SemesterList /></AdminLayout>} />
        <Route path="/admin/semesters/new" element={<AdminLayout><SemesterForm /></AdminLayout>} />
        <Route path="/admin/programs" element={<AdminLayout><ProgramList /></AdminLayout>} />
        <Route path="/admin/programs/new" element={<AdminLayout><ProgramForm /></AdminLayout>} />
        <Route path="/admin/courses" element={<AdminLayout><CourseList /></AdminLayout>} />
        <Route path="/admin/courses/new" element={<AdminLayout><CourseForm /></AdminLayout>} />
        <Route path="/admin/staff" element={<AdminLayout><StaffList /></AdminLayout>} />
        <Route path="/admin/staff/new" element={<AdminLayout><StaffForm /></AdminLayout>} />
        <Route path="/admin/students" element={<AdminLayout><StudentList /></AdminLayout>} />
        <Route path="/admin/students/new" element={<AdminLayout><StudentForm /></AdminLayout>} />
        <Route path="/admin/staff-allocation" element={<AdminLayout><StaffCourseList /></AdminLayout>} />
        <Route path="/admin/staff-allocation/new" element={<AdminLayout><StaffCourseForm /></AdminLayout>} />
        <Route path="/admin/certificates" element={<AdminLayout><CertificateLayoutList /></AdminLayout>} />
        <Route path="/admin/certificates/new" element={<AdminLayout><CertificateDesigner /></AdminLayout>} />
        <Route path="/admin/certificates/edit/:id" element={<AdminLayout><CertificateDesigner /></AdminLayout>} />

        <Route path="/staff" element={<StaffLayout><StaffDashboard /></StaffLayout>} />
        <Route path="/staff/my-courses" element={<StaffLayout><MyCourseList /></StaffLayout>} />
        <Route path="/staff/course/:courseId/videos" element={<StaffLayout><CourseVideos /></StaffLayout>} />
        <Route path="/staff/course/:courseId/videos/new" element={<StaffLayout><AddVideoForm /></StaffLayout>} />
        <Route path="/staff/materials" element={<StaffLayout><MaterialList /></StaffLayout>} />
        <Route path="/staff/materials/new" element={<StaffLayout><MaterialForm /></StaffLayout>} />
        <Route path="/staff/assignments" element={<StaffLayout><AssignmentList /></StaffLayout>} />
        <Route path="/staff/assignments/new" element={<StaffLayout><AssignmentForm /></StaffLayout>} />
        <Route path="/staff/assignments/edit/:id" element={<StaffLayout><AssignmentForm /></StaffLayout>} />
        <Route path="/staff/assignments/:assignmentId/submissions" element={<StaffLayout><SubmissionList /></StaffLayout>} />
        <Route path="/staff/mcqs" element={<StaffLayout><MCQList /></StaffLayout>} />
        <Route path="/staff/mcqs/new" element={<StaffLayout><MCQForm /></StaffLayout>} />
        <Route path="/staff/mcqs/edit/:id" element={<StaffLayout><MCQForm /></StaffLayout>} />
        <Route path="/staff/mcqs/edit/:id" element={<StaffLayout><MCQForm /></StaffLayout>} />
        <Route path="/staff/messages" element={<StaffLayout><Inbox /></StaffLayout>} />
        <Route path="/staff/messages/new" element={<StaffLayout><Compose /></StaffLayout>} />
        <Route path="/staff/messages/:id" element={<StaffLayout><MessageDetail /></StaffLayout>} />

        <Route path="/student" element={<StudentLayout><StudentDashboard /></StudentLayout>} />
        <Route path="/student/courses" element={<StudentLayout><StudentCourseList /></StudentLayout>} />
        <Route path="/student/courses/:courseId" element={<StudentLayout><StudentCourseMaterials /></StudentLayout>} />
        <Route path="/student/enroll" element={<StudentLayout><CourseEnrollment /></StudentLayout>} />
        <Route path="/student/results" element={<StudentLayout><StudentResultList /></StudentLayout>} />
        <Route path="/student/assignments" element={<StudentLayout><StudentAssignmentList /></StudentLayout>} />
        <Route path="/student/assignments/submit/:assignmentId" element={<StudentLayout><SubmissionForm /></StudentLayout>} />
        <Route path="/student/quiz" element={<StudentLayout><QuizList /></StudentLayout>} />
        <Route path="/student/quiz/:courseId" element={<StudentLayout><QuizPlayer /></StudentLayout>} />
        <Route path="/student/quiz/results" element={<StudentLayout><QuizResults /></StudentLayout>} />
        <Route path="/student/quiz/material/:materialId" element={<StudentLayout><MaterialQuizPlayer /></StudentLayout>} />
        <Route path="/student/messages" element={<StudentLayout><Inbox /></StudentLayout>} />
        <Route path="/student/messages/new" element={<StudentLayout><Compose /></StudentLayout>} />
        <Route path="/student/messages/:id" element={<StudentLayout><MessageDetail /></StudentLayout>} />

      </Routes>
    </Router>
  );
}

export default App;

