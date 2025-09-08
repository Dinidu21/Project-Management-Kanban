// src/components/AuthForm.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';
import { useLogin, useRegister } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';

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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" type="text" placeholder="Enter your username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                        </div>
                        {isLogin ? null : (
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="Enter your email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                            </div>
                        )}
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" placeholder="Enter your password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                        </div>
                        <Button type="submit" className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300" disabled={isLoading}>{isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}</Button>
                    </form>
                    <div className="text-center mt-4">
                        <Button variant="ghost" onClick={onToggle} className="text-sm">{isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AuthForm;
