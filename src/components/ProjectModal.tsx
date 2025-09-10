// src/components/ProjectModal.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { useCreateProject, useUpdateProject, useTeams } from '@/hooks/useApi';
import type { Project } from '@/types';
import { useEffect } from 'react';

const ProjectModal: React.FC<{ isOpen: boolean; onClose: () => void; project?: Project | null; onSaved?: () => void }> = ({ isOpen, onClose, project = null, onSaved }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'PLANNING' as any,
        startDate: new Date(),
        endDate: new Date(),
        teamId: '' as any
    });

    const createProjectMutation = useCreateProject();
    const updateProjectMutation = useUpdateProject();
    const { data: teams = [] } = useTeams();

    // populate form when editing
    useEffect(() => {
        if (project && isOpen) {
            setFormData({
                name: project.name || '',
                description: project.description || '',
                status: project.status || 'PLANNING',
                startDate: project.startDate ? parseISO(project.startDate) : new Date(),
                endDate: project.endDate ? parseISO(project.endDate) : new Date(),
                teamId: project.team?.id ? String(project.team.id) : ''
            });
        }
        if (!project && isOpen) {
            setFormData({
                name: '',
                description: '',
                status: 'PLANNING',
                startDate: new Date(),
                endDate: new Date(),
                teamId: ''
            });
        }
    }, [project, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                name: formData.name,
                description: formData.description,
                status: formData.status,
                startDate: formData.startDate.toISOString(),
                endDate: formData.endDate.toISOString(),
                teamId: formData.teamId ? Number(formData.teamId) : null
            };

            if (project) {
                await updateProjectMutation.mutateAsync({ id: Number(project.id), data: payload });
            } else {
                await createProjectMutation.mutateAsync(payload);
            }

            onClose();
            onSaved && onSaved();
        } catch (error) {
            console.error('Failed to save project:', error);
        }
    };

    const mutation = project ? updateProjectMutation : createProjectMutation;
    const saving = Boolean((mutation as any).isLoading || (mutation as any).isPending || (mutation as any).status === 'loading');

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{project ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Project Name</Label>
                        <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PLANNING">Planning</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Start Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {format(formData.startDate, 'MMM dd, yyyy')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent mode="single" selected={formData.startDate} onSelect={(date) => date && setFormData({ ...formData, startDate: date })} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div>
                            <Label>End Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {format(formData.endDate, 'MMM dd, yyyy')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent mode="single" selected={formData.endDate} onSelect={(date) => date && setFormData({ ...formData, endDate: date })} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="team">Team</Label>
                        <Select
                            value={formData.teamId === '' ? 'none' : String(formData.teamId)}
                            onValueChange={(value) =>
                                setFormData({ ...formData, teamId: value === 'none' ? '' : value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="No team (personal project)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No team</SelectItem>
                                {teams.map((t: any) => (
                                    <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                        <Button type="submit" className="flex-1 bg-gradient-primary" disabled={saving}>{saving ? (project ? 'Saving...' : 'Creating...') : (project ? 'Save' : 'Create')}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ProjectModal;
