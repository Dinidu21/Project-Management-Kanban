// src/components/AuthForm.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Target, Github } from 'lucide-react';
import { useLogin, useRegister } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import apiService from '@/services/api';

const AuthForm: React.FC<{ isLogin: boolean; onToggle: () => void; initialUsername?: string; onSuccess?: () => void }> = ({ isLogin, onToggle, initialUsername = '', onSuccess }) => {
    const [formData, setFormData] = useState({ username: initialUsername, email: '', password: '' });
    const loginMutation = useLogin();
    const registerMutation = useRegister();

    const queryClient = useQueryClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.debug('[AuthForm] submit', { isLogin, username: formData.username });
            if (isLogin) {
                const auth = await loginMutation.mutateAsync({ username: formData.username, password: formData.password });
                console.debug('[AuthForm] loginMutation result', auth);
                // ensure the current user query is refreshed
                await queryClient.invalidateQueries({ queryKey: ['user'] });
                if (onSuccess) {
                    console.debug('[AuthForm] calling onSuccess -> navigate to dashboard');
                    onSuccess();
                }
            } else {
                const response = await registerMutation.mutateAsync({ username: formData.username, email: formData.email, password: formData.password });
                console.debug('[AuthForm] registerMutation result', response);
                setFormData({ username: response.username || formData.username, email: '', password: '' });
                // ensure the current user query is refreshed after registration
                await queryClient.invalidateQueries({ queryKey: ['user'] });
                if (onSuccess) {
                    console.debug('[AuthForm] registration success -> calling onSuccess');
                    onSuccess();
                }
                // Do not force toggle to login: after successful registration the
                // auth token is stored and the hooks set the current user in the
                // query cache; the parent will detect the authenticated user and
                // navigate to the dashboard automatically.
            }
        } catch (error) {
            console.error('[AuthForm] Auth error:', error);
        }
    };

    // useMutation exposes `isLoading` (not `isPending`)
    const isLoading = (loginMutation as any).isLoading || (registerMutation as any).isLoading;

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md shadow-elegant animate-slide-up">
                <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <Target className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{isLogin ? 'Welcome back' : 'Create account'}</CardTitle>
                    <p className="text-muted-foreground">{isLogin ? 'Sign in to your account' : 'Start managing your projects today'}</p>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col space-y-2 mb-3">
                        <p className="text-center text-sm text-muted-foreground">Or continue with</p>
                        <div className="flex items-center justify-center space-x-2">
                            {/* Google Login */}
                            <button
                                onClick={() => {
                                    window.location.href = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/auth/oauth2/redirect/google';
                                }}
                                className="inline-flex items-center space-x-2 px-3 py-2 rounded-md border hover:shadow-sm"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                    <path d="M21.35 11.1h-9.18v2.92h5.35c-.23 1.35-1.18 2.5-2.52 3.23v2.69h4.08c2.38-2.2 3.74-5.45 3.74-8.84 0-.6-.05-1.19-.47-1.99z" fill="#4285F4" />
                                    <path d="M12.17 22c2.2 0 4.04-.73 5.39-1.97l-4.08-2.69c-.97.66-2.21 1.05-3.31 1.05-2.53 0-4.68-1.7-5.44-3.98H2.44v2.5C3.78 19.93 7.68 22 12.17 22z" fill="#34A853" />
                                    <path d="M6.73 13.41a6.5 6.5 0 010-4.82V6.09H2.44a10.02 10.02 0 000 11.82l4.29-2.5z" fill="#FBBC05" />
                                    <path d="M12.17 6.5c1.46 0 2.77.5 3.8 1.49l2.85-2.85C16.2 3.6 14.36 3 12.17 3 7.68 3 3.78 5.07 2.44 8.09l4.29 2.5c.76-2.28 2.91-3.98 5.44-3.98z" fill="#EA4335" />
                                </svg>
                                <span className="text-sm">Google</span>
                            </button>

                            {/* GitHub Login */}
                            <button
                                onClick={() => {
                                    window.location.href = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/auth/oauth2/redirect/github';
                                }}
                                className="inline-flex items-center space-x-2 px-3 py-2 rounded-md border hover:shadow-sm"
                            >
                                <Github className="w-4 h-4" />
                                <span className="text-sm">GitHub</span>
                            </button>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" type="text" placeholder="Enter your username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                        </div>
                        {!isLogin && (
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="Enter your email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                            </div>
                        )}
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" placeholder="Enter your password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                        </div>
                        <Button type="submit" className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300" disabled={isLoading}>
                            {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                        </Button>
                    </form>
                    <div className="text-center mt-4">
                        <Button variant="ghost" onClick={onToggle} className="text-sm">
                            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AuthForm;
