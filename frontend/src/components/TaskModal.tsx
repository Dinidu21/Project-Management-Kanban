// src/components/TaskModal.tsx
import React, { useEffect, useState } from 'react';
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
import { useProjects, useCurrentUser, useCreateTask, useUpdateTask } from '@/hooks/useApi';
import type { Task } from '@/types';

const TaskModal: React.FC<{ isOpen: boolean; onClose: () => void; task?: Task | null; onSaved?: () => void }> = ({ isOpen, onClose, task = null, onSaved }) => {
    const { data: projects = [] } = useProjects();
    const { data: user } = useCurrentUser();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'TODO' as any,
        priority: 'MEDIUM' as any,
        dueDate: new Date(),
        projectId: '' as any
    });

    const createTaskMutation = useCreateTask();
    const updateTaskMutation = useUpdateTask();

    useEffect(() => {
        if (task && isOpen) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                status: task.status || 'TODO',
                priority: task.priority || 'MEDIUM',
                dueDate: task.dueDate ? parseISO(task.dueDate) : new Date(),
                projectId: task.project?.id ? String(task.project.id) : (projects[0]?.id ? String(projects[0].id) : '')
            });
            return;
        }

        if (projects.length > 0 && !formData.projectId) {
            setFormData(prev => ({ ...prev, projectId: projects[0].id }));
        }
    }, [projects, task, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                status: formData.status,
                priority: formData.priority,
                dueDate: formData.dueDate.toISOString(),
                projectId: Number(formData.projectId),
                assigneeId: Number(user?.id)
            };

            if (task) {
                await updateTaskMutation.mutateAsync({ id: Number(task.id), data: payload });
            } else {
                await createTaskMutation.mutateAsync(payload);
            }

            onClose();
            onSaved && onSaved();
        } catch (error) {
            console.error('Failed to save task:', error);
        }
    };

    const mutation = task ? updateTaskMutation : createTaskMutation;
    const saving = Boolean((mutation as any).isLoading || (mutation as any).isPending || (mutation as any).status === 'loading');

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="title">Task Title</Label>
                        <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TODO">Todo</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="REVIEW">Review</SelectItem>
                                    <SelectItem value="DONE">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Low</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="URGENT">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="project">Project</Label>
                        <Select value={formData.projectId} onValueChange={(value) => setFormData({ ...formData, projectId: value })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map(project => (
                                    <SelectItem key={project.id} value={String(project.id)}>{project.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Due Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {format(formData.dueDate, 'MMM dd, yyyy')}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent mode="single" selected={formData.dueDate} onSelect={(date) => date && setFormData({ ...formData, dueDate: date })} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                        <Button type="submit" className="flex-1 bg-gradient-primary" disabled={saving}>{saving ? (task ? 'Saving...' : 'Creating...') : (task ? 'Save' : 'Create')}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default TaskModal;
