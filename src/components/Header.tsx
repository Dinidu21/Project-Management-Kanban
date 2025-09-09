// src/components/Header.tsx
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import ProfileModal from './ProfileModal';
import { LogOut, Target, Home, FolderOpen, CheckCircle } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useApi';
import apiService from '@/services/api';

const Header: React.FC<{ onNavigate: (view: string) => void; currentView: string }> = ({ onNavigate, currentView }) => {
    const { data: user } = useCurrentUser();

    const handleLogout = () => {
        apiService.logout();
        window.location.reload();
    };

    const [isProfileOpen, setIsProfileOpen] = React.useState(false);

    return (
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <Target className="h-4 w-4 text-white" />
                        </div>
                        <h1 className="text-xl font-bold">ProjectHub</h1>
                    </div>

                    <nav className="hidden md:flex items-center space-x-1">
                        {[{ id: 'dashboard', label: 'Dashboard', icon: Home }, { id: 'projects', label: 'Projects', icon: FolderOpen }, { id: 'tasks', label: 'Tasks', icon: CheckCircle }].map(({ id, label, icon: Icon }) => (
                            <Button key={id} variant={currentView === id ? 'secondary' : 'ghost'} onClick={() => onNavigate(id)} className="flex items-center space-x-2"><Icon className="h-4 w-4" /><span>{label}</span></Button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setIsProfileOpen(true)}>
                        <Avatar>
                            <AvatarFallback>{(user?.username || 'U').toString().split(' ').map((n: string) => n[0]).join('') || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="hidden md:block">
                            <p className="text-sm font-medium">{(user as any)?.firstName || (user as any)?.username || 'User'}</p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>

                    <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="h-4 w-4" /></Button>
                </div>
            </div>
            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </header>
    );
};

export default Header;
