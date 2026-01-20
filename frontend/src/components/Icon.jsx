import React from 'react';
import {
    // Navigation & Layout
    LayoutDashboard,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    
    // Academic
    BookOpen,
    Library,
    GraduationCap,
    Award,
    Calendar,
    FileText,
    File,
    
    // Actions
    ClipboardList,
    Edit,
    Trash2,
    Plus,
    Minus,
    Check,
    Save,
    Download,
    Upload,
    Search,
    Filter,
    RefreshCw,
    
    // User & People
    User,
    Users,
    UserCircle,
    UserPlus,
    
    // Communication
    Bell,
    Mail,
    MessageSquare,
    Send,
    
    // Quiz & Assessment
    HelpCircle,
    CheckCircle,
    XCircle,
    AlertCircle,
    
    // Results & Stats
    Trophy,
    TrendingUp,
    TrendingDown,
    BarChart,
    PieChart,
    
    // Media
    Play,
    Pause,
    Video,
    Image,
    
    // System
    Settings,
    LogOut,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    Info,
    AlertTriangle,
    
    // Documents
    FileText as Document,
    Folder,
    FolderOpen,
} from 'lucide-react';

const iconMap = {
    // Navigation
    dashboard: LayoutDashboard,
    menu: Menu,
    close: X,
    'chevron-left': ChevronLeft,
    'chevron-right': ChevronRight,
    'chevron-down': ChevronDown,
    'chevron-up': ChevronUp,
    
    // Academic
    book: BookOpen,
    library: Library,
    graduation: GraduationCap,
    award: Award,
    certificate: Award,
    calendar: Calendar,
    courses: BookOpen,
    course: BookOpen,
    
    // Documents
    file: FileText,
    document: Document,
    material: FileText,
    materials: FileText,
    folder: Folder,
    'folder-open': FolderOpen,
    
    // Actions
    clipboard: ClipboardList,
    assignment: ClipboardList,
    assignments: ClipboardList,
    edit: Edit,
    delete: Trash2,
    add: Plus,
    remove: Minus,
    check: Check,
    save: Save,
    download: Download,
    upload: Upload,
    search: Search,
    filter: Filter,
    refresh: RefreshCw,
    
    // Users
    user: User,
    users: Users,
    'user-circle': UserCircle,
    student: UserCircle,
    students: UserCircle,
    staff: Users,
    'user-plus': UserPlus,
    
    // Communication
    bell: Bell,
    notification: Bell,
    mail: Mail,
    message: MessageSquare,
    send: Send,
    
    // Quiz & Tests
    quiz: HelpCircle,
    question: HelpCircle,
    'check-circle': CheckCircle,
    'x-circle': XCircle,
    alert: AlertCircle,
    
    // Results & Analytics
    trophy: Trophy,
    results: Trophy,
    'trending-up': TrendingUp,
    'trending-down': TrendingDown,
    chart: BarChart,
    'bar-chart': BarChart,
    'pie-chart': PieChart,
    stats: BarChart,
    
    // Media
    play: Play,
    pause: Pause,
    video: Video,
    image: Image,
    
    // System
    settings: Settings,
    logout: LogOut,
    lock: Lock,
    unlock: Unlock,
    eye: Eye,
    'eye-off': EyeOff,
    info: Info,
    warning: AlertTriangle,
};

const Icon = ({ name, size = 20, className = '', ...props }) => {
    const IconComponent = iconMap[name] || AlertCircle;
    
    return (
        <IconComponent 
            size={size} 
            className={className}
            {...props}
        />
    );
};

export default Icon;