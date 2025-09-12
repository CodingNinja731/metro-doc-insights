import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ml';

export interface Translations {
  // Navigation & Common
  login: string;
  logout: string;
  dashboard: string;
  documents: string;
  search: string;
  upload: string;
  admin: string;
  settings: string;
  notifications: string;
  
  // Login Page
  welcomeToIntelliDoc: string;
  kmrlDocumentPlatform: string;
  username: string;
  password: string;
  rememberMe: string;
  forgotPassword: string;
  signIn: string;
  
  // Dashboard
  documentsProcessedToday: string;
  pendingDocuments: string;
  averageProcessingTime: string;
  recentDocuments: string;
  processingPipeline: string;
  filterByDepartment: string;
  filterByUrgency: string;
  filterByDate: string;
  
  // Document Upload
  dragAndDropFiles: string;
  orClickToSelect: string;
  supportedFormats: string;
  uploadProgress: string;
  
  // Document Inspector
  aiSummary: string;
  actionItems: string;
  metadata: string;
  auditTrail: string;
  downloadOriginal: string;
  viewFullText: string;
  reprocessDocument: string;
  addComment: string;
  
  // Status
  pending: string;
  processing: string;
  completed: string;
  error: string;
  high: string;
  medium: string;
  low: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Navigation & Common
    login: 'Login',
    logout: 'Logout',
    dashboard: 'Dashboard',
    documents: 'Documents',
    search: 'Search',
    upload: 'Upload',
    admin: 'Admin',
    settings: 'Settings',
    notifications: 'Notifications',
    
    // Login Page
    welcomeToIntelliDoc: 'Welcome to IntelliDoc',
    kmrlDocumentPlatform: 'KMRL Document Processing Platform',
    username: 'Username',
    password: 'Password',
    rememberMe: 'Remember Me',
    forgotPassword: 'Forgot Password?',
    signIn: 'Sign In',
    
    // Dashboard
    documentsProcessedToday: 'Processed Today',
    pendingDocuments: 'Pending',
    averageProcessingTime: 'Avg. Processing Time',
    recentDocuments: 'Recent Documents',
    processingPipeline: 'Processing Pipeline',
    filterByDepartment: 'Filter by Department',
    filterByUrgency: 'Filter by Urgency',
    filterByDate: 'Filter by Date',
    
    // Document Upload
    dragAndDropFiles: 'Drag and drop files here',
    orClickToSelect: 'or click to select files',
    supportedFormats: 'Supported formats: PDF, DOC, DOCX, JPG, PNG',
    uploadProgress: 'Upload Progress',
    
    // Document Inspector
    aiSummary: 'AI Summary',
    actionItems: 'Action Items',
    metadata: 'Metadata',
    auditTrail: 'Audit Trail',
    downloadOriginal: 'Download Original',
    viewFullText: 'View Full Text',
    reprocessDocument: 'Reprocess',
    addComment: 'Add Comment',
    
    // Status
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    error: 'Error',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  },
  ml: {
    // Navigation & Common
    login: 'ലോഗിൻ',
    logout: 'ലോഗൗട്ട്',
    dashboard: 'ഡാഷ്ബോർഡ്',
    documents: 'രേഖകൾ',
    search: 'തിരയുക',
    upload: 'അപ്‌ലോഡ്',
    admin: 'അഡ്മിൻ',
    settings: 'സെറ്റിംഗ്സ്',
    notifications: 'അറിയിപ്പുകൾ',
    
    // Login Page
    welcomeToIntelliDoc: 'ഇന്റലിഡോക്കിലേക്ക് സ്വാഗതം',
    kmrlDocumentPlatform: 'കെഎംആർഎൽ രേഖ പ്രോസസ്സിംഗ് പ്ലാറ്റ്ഫോം',
    username: 'ഉപയോക്തൃനാമം',
    password: 'പാസ്‌വേഡ്',
    rememberMe: 'എന്നെ ഓർക്കുക',
    forgotPassword: 'പാസ്‌വേഡ് മറന്നോ?',
    signIn: 'സൈൻ ഇൻ',
    
    // Dashboard
    documentsProcessedToday: 'ഇന്ന് പ്രോസസ്സ് ചെയ്തത്',
    pendingDocuments: 'തീർപ്പുകൽപ്പിക്കാത്തത്',
    averageProcessingTime: 'ശരാശരി പ്രോസസ്സിംഗ് സമയം',
    recentDocuments: 'സമീപകാല രേഖകൾ',
    processingPipeline: 'പ്രോസസ്സിംഗ് പൈപ്പ്‌ലൈൻ',
    filterByDepartment: 'വകുപ്പ് അനുസരിച്ച് ഫിൽട്ടർ ചെയ്യുക',
    filterByUrgency: 'അടിയന്തിരത അനുസരിച്ച് ഫിൽട്ടർ ചെയ്യുക',
    filterByDate: 'തീയതി അനുസരിച്ച് ഫിൽട്ടർ ചെയ്യുക',
    
    // Document Upload
    dragAndDropFiles: 'ഫയലുകൾ ഇവിടെ വലിച്ചിട്ടുക',
    orClickToSelect: 'അല്ലെങ്കിൽ ഫയലുകൾ തിരഞ്ഞെടുക്കാൻ ക്ലിക്കുചെയ്യുക',
    supportedFormats: 'പിന്തുണയുള്ള ഫോർമാറ്റുകൾ: PDF, DOC, DOCX, JPG, PNG',
    uploadProgress: 'അപ്‌ലോഡ് പുരോഗതി',
    
    // Document Inspector
    aiSummary: 'AI സംഗ്രഹം',
    actionItems: 'പ്രവർത്തന ഇനങ്ങൾ',
    metadata: 'മെറ്റാഡാറ്റ',
    auditTrail: 'ഓഡിറ്റ് ട്രയൽ',
    downloadOriginal: 'യഥാർത്ഥ ഡൗൺലോഡ് ചെയ്യുക',
    viewFullText: 'പൂർണ്ണ ടെക്സ്റ്റ് കാണുക',
    reprocessDocument: 'വീണ്ടും പ്രോസസ്സ് ചെയ്യുക',
    addComment: 'കമന്റ് ചേർക്കുക',
    
    // Status
    pending: 'തീർപ്പുകൽപ്പിക്കാത്തത്',
    processing: 'പ്രോസസ്സിംഗ്',
    completed: 'പൂർത്തിയായി',
    error: 'പിശക്',
    high: 'ഉയർന്നത്',
    medium: 'ഇടത്തരം',
    low: 'താഴ്ന്നത്',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};