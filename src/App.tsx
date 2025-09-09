// src/App.tsx
import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

import Dashboard from '@/pages/Dashboard';
import ProjectsView from '@/pages/ProjectsView';
import TasksView from '@/pages/TasksView';
import Header from '@/components/Header';
import AuthForm from '@/components/AuthForm';
import { useCurrentUser } from '@/hooks/useApi';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLogin, setIsLogin] = useState(true);
  const [initialUsername, setInitialUsername] = useState('');

  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>;

  if (!user) return (
    <AuthForm
      isLogin={isLogin}
      onToggle={() => { setIsLogin(!isLogin); if (!isLogin) setInitialUsername(''); }}
      initialUsername={initialUsername}
      onSuccess={() => setCurrentView('dashboard')}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={setCurrentView} currentView={currentView} />
      <main className="container mx-auto px-4 py-8">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'projects' && <ProjectsView />}
        {currentView === 'tasks' && <TasksView />}
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppContent />
      <Toaster />
    </ThemeProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

export default App;