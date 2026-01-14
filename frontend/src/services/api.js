const API_BASE = 'http://localhost:5001/api';

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
    create: (data) => apiRequest('/staff-courses', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/staff-courses/${id}`, { method: 'DELETE' }),
};

// Study Materials (Videos)
export const studyMaterialApi = {
    getAll: () => apiRequest('/study-materials'),
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
    getOne: (id) => apiRequest(`/assignments/${id}`),
    create: (formData) => apiRequest('/assignments', { method: 'POST', body: formData }),
    update: (id, formData) => apiRequest(`/assignments/${id}`, { method: 'PUT', body: formData }),
    delete: (id) => apiRequest(`/assignments/${id}`, { method: 'DELETE' }),
};

// Submissions
export const submissionApi = {
    getAll: (assignmentId) => apiRequest(`/submissions?assignment_id=${assignmentId}`),
    getByStudent: (studentId) => apiRequest(`/submissions?student_id=${studentId}`),
    create: (formData) => apiRequest('/submissions', { method: 'POST', body: formData }),
    evaluate: (id, data) => apiRequest(`/submissions/${id}/evaluate`, { method: 'POST', body: JSON.stringify(data) }),
};

// Student Dashboard API
export const studentDashboardApi = {
    getDashboard: (studentId) => apiRequest(`/student/${studentId}/dashboard`),
    getCourses: (studentId) => apiRequest(`/student/${studentId}/courses`),
    getCourseMaterials: (studentId, courseId) => apiRequest(`/student/${studentId}/courses/${courseId}/materials`),
    getResults: (studentId) => apiRequest(`/student/${studentId}/results`),
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

