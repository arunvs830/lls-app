const DEFAULT_BACKEND_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://127.0.0.1:5001';

// In dev, call the Vite dev server (6001) and let it proxy /api to the backend.
// This avoids browser restrictions on port 6000 (ERR_UNSAFE_PORT).
export const API_ORIGIN = import.meta.env.DEV ? '' : DEFAULT_BACKEND_ORIGIN;
export const API_BASE = import.meta.env.DEV ? '/api' : `${API_ORIGIN}/api`;

// Generic API helper
async function apiRequest(endpoint, options = {}) {
    const isFormData = options.body instanceof FormData;

    const headers = {
        ...options.headers,
    };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        headers,
        ...options,
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}

// Academic Years
export const academicYearApi = {
    getAll: () => apiRequest('/academic-years'),
    create: (data) => apiRequest('/academic-years', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/academic-years/${id}`, { method: 'DELETE' }),
};

// Semesters
export const semesterApi = {
    getAll: () => apiRequest('/semesters'),
    create: (data) => apiRequest('/semesters', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/semesters/${id}`, { method: 'DELETE' }),
};

// Programs
export const programApi = {
    getAll: () => apiRequest('/programs'),
    create: (data) => apiRequest('/programs', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/programs/${id}`, { method: 'DELETE' }),
};

// Courses
export const courseApi = {
    getAll: () => apiRequest('/courses'),
    create: (data) => apiRequest('/courses', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/courses/${id}`, { method: 'DELETE' }),
};

// Staff
export const staffApi = {
    getAll: () => apiRequest('/staff'),
    create: (data) => apiRequest('/staff', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/staff/${id}`, { method: 'DELETE' }),
};

// Students
export const studentApi = {
    getAll: () => apiRequest('/students'),
    create: (data) => apiRequest('/students', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/students/${id}`, { method: 'DELETE' }),
};

// Staff-Course Allocation
export const staffCourseApi = {
    getAll: () => apiRequest('/staff-courses'),
    getByStaff: (staffId) => apiRequest(`/staff-courses?staff_id=${staffId}`),
    create: (data) => apiRequest('/staff-courses', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/staff-courses/${id}`, { method: 'DELETE' }),
};

// Study Materials (Videos)
export const studyMaterialApi = {
    getAll: () => apiRequest('/study-materials'),
    getByStaff: (staffId) => apiRequest(`/study-materials?staff_id=${staffId}`),
    getOne: (id) => apiRequest(`/study-materials/${id}`),
    getByCourse: (courseId) => apiRequest(`/courses/${courseId}/materials`),
    create: (data) => apiRequest('/study-materials', { method: 'POST', body: JSON.stringify(data) }),
    addToCourse: (courseId, data) => {
        const isFormData = data instanceof FormData;
        return apiRequest(`/courses/${courseId}/materials`, {
            method: 'POST',
            body: isFormData ? data : JSON.stringify(data)
        });
    },
    addChild: (parentId, data) => {
        const isFormData = data instanceof FormData;
        return apiRequest(`/study-materials/${parentId}/children`, {
            method: 'POST',
            body: isFormData ? data : JSON.stringify(data)
        });
    },
    delete: (id) => apiRequest(`/study-materials/${id}`, { method: 'DELETE' }),
};

// Assignments
export const assignmentApi = {
    getAll: () => apiRequest('/assignments'),
    getByCourse: (courseId) => apiRequest(`/assignments?course_id=${courseId}`),
    getByStaff: (staffId) => apiRequest(`/assignments?staff_id=${staffId}`),
    getByMaterial: (materialId) => apiRequest(`/assignments?study_material_id=${materialId}`),
    getByStudent: (studentId) => apiRequest(`/assignments?student_id=${studentId}`),
    getOne: (id) => apiRequest(`/assignments/${id}`),
    create: (formData) => apiRequest('/assignments', { method: 'POST', body: formData }),
    update: (id, formData) => apiRequest(`/assignments/${id}`, { method: 'PUT', body: formData }),
    delete: (id) => apiRequest(`/assignments/${id}`, { method: 'DELETE' }),
};

// Submissions
export const submissionApi = {
    getAll: (assignmentId) => apiRequest(`/submissions?assignment_id=${assignmentId}`),
    getByStudent: (studentId) => apiRequest(`/submissions?student_id=${studentId}`),
    getByAssignmentAndStudent: (assignmentId, studentId) => apiRequest(`/submissions?assignment_id=${assignmentId}&student_id=${studentId}`).then(data => data?.[0] || null),
    getForStaff: (staffId) => apiRequest(`/submissions?staff_id=${staffId}`),
    getForStaffCourse: (staffId, courseId) => apiRequest(`/submissions?staff_id=${staffId}&course_id=${courseId}`),
    create: (formData) => apiRequest('/submissions', { method: 'POST', body: formData }),
    evaluate: (id, data) => apiRequest(`/submissions/${id}/evaluate`, { method: 'POST', body: JSON.stringify(data) }),
    getPendingCount: (staffId) => apiRequest(`/submissions/pending-count/${staffId}`),
};

// Student Dashboard API
export const studentDashboardApi = {
    getDashboard: (studentId) => apiRequest(`/student/${studentId}/dashboard`),
    getCourses: (studentId) => apiRequest(`/student/${studentId}/courses`),
    getCourseMaterials: (studentId, courseId) => apiRequest(`/student/${studentId}/courses/${courseId}/materials`),
    getResults: (studentId) => apiRequest(`/student/${studentId}/results`),
    getCourseResults: (studentId) => apiRequest(`/student/${studentId}/course-results`),
    getCourseResultBreakdown: (studentId, courseId) => apiRequest(`/student/${studentId}/courses/${courseId}/result-breakdown`),
};

// MCQ / Quiz API
export const mcqApi = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return apiRequest(`/mcqs${params ? '?' + params : ''}`);
    },
    getOne: (id) => apiRequest(`/mcqs/${id}`),
    create: (data) => apiRequest('/mcqs', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/mcqs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/mcqs/${id}`, { method: 'DELETE' }),
    getCourseQuiz: (courseId, studentId) => apiRequest(`/courses/${courseId}/quiz?student_id=${studentId}`),
    getMaterialQuiz: (materialId, studentId) => apiRequest(`/materials/${materialId}/quiz?student_id=${studentId}`),
    submitAnswer: (mcqId, data) => apiRequest(`/mcqs/${mcqId}/attempt`, { method: 'POST', body: JSON.stringify(data) }),
    getStudentResults: (studentId) => apiRequest(`/student/${studentId}/quiz-results`),
};

// Authentication API
export const authApi = {
    login: async (email, password, role) => {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role })
        });
        return response.json();
    },
    register: async (data) => {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }
};

// Certificate API
export const certificateApi = {
    getAll: () => apiRequest('/certificate-layouts'),
    getOne: (id) => apiRequest(`/certificate-layouts/${id}`),
    create: (data) => apiRequest('/certificate-layouts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/certificate-layouts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/certificate-layouts/${id}`, { method: 'DELETE' }),
    getByProgram: (programId) => apiRequest(`/programs/${programId}/certificate-layouts`),
    getDefaultByProgram: (programId) => apiRequest(`/programs/${programId}/default-certificate-layout`),
};

// Notification API
export const notificationApi = {
    getAll: (userType, userId, unreadOnly = false) =>
        apiRequest(`/notifications/${userType}/${userId}?unread_only=${unreadOnly}`),
    getUnreadCount: (userType, userId) =>
        apiRequest(`/notifications/${userType}/${userId}/count`),
    markAsRead: (notificationId) =>
        apiRequest(`/notifications/${notificationId}/read`, { method: 'PUT' }),
    markAllAsRead: (userType, userId) =>
        apiRequest(`/notifications/${userType}/${userId}/read-all`, { method: 'PUT' }),
    delete: (notificationId) =>
        apiRequest(`/notifications/${notificationId}`, { method: 'DELETE' }),
};

// Communication/Messages API
export const communicationApi = {
    getInbox: (userType, userId) =>
        apiRequest(`/communications/inbox/${userType}/${userId}`),
    getSent: (userType, userId) =>
        apiRequest(`/communications/sent/${userType}/${userId}`),
    getOne: (id) =>
        apiRequest(`/communications/${id}`),
    send: (data) =>
        apiRequest('/communications', { method: 'POST', body: JSON.stringify(data) }),
    markAsRead: (id) =>
        apiRequest(`/communications/${id}/read`, { method: 'PUT' }),
    delete: (id) =>
        apiRequest(`/communications/${id}`, { method: 'DELETE' }),
    getUnreadCount: (userType, userId) =>
        apiRequest(`/communications/unread-count/${userType}/${userId}`)
};

// Report API
export const reportApi = {
    getStaffReports: (staffId, filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return apiRequest(`/reports/staff/${staffId}${params ? '?' + params : ''}`);
    }
};

// Admin API
export const adminApi = {
    getStaffReport: () => apiRequest('/admin/staff-report'),
    getCourseReport: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.academic_year_id) params.append('academic_year_id', filters.academic_year_id);
        if (filters.program_id) params.append('program_id', filters.program_id);
        if (filters.semester_id) params.append('semester_id', filters.semester_id);
        const queryString = params.toString();
        return apiRequest(`/admin/course-report${queryString ? '?' + queryString : ''}`);
    }
};
