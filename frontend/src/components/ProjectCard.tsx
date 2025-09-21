// src/components/ProjectCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { MoreVertical, Trash2, FolderOpen } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTasks, useUpdateProject, useDeleteProject, useCurrentUser } from '@/hooks/useApi';
import type { Project } from '@/types';

const ProjectCard: React.FC<{ project: Project; onEdit?: () => void }> = ({ project, onEdit }) => {
    const { data: tasks = [] } = useTasks();
    const updateProjectMutation = useUpdateProject();
    const deleteProjectMutation = useDeleteProject();
    const { data: currentUser } = useCurrentUser();
    const isGuest = currentUser?.role === 'GUEST';

    console.debug('[ProjectCard] project', project);

    const projectTasks = tasks.filter(t => String(t.project.id) === String(project.id));
    const completedTasks = projectTasks.filter(t => t.status === 'DONE').length;
    const progress = projectTasks.length ? Math.round((completedTasks / projectTasks.length) * 100) : 0;

    const handleDelete = async () => {
        if (isGuest) return;
        if (confirm('Are you sure you want to delete this project?')) {
            // backend expects numeric id; coerce if necessary
            await deleteProjectMutation.mutateAsync(Number(project.id));
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-status-progress/20 text-status-progress';
            case 'COMPLETED': return 'bg-status-completed/20 text-status-completed';
            case 'PLANNING': return 'bg-status-todo/20 text-status-todo';
            case 'ON_HOLD': return 'bg-destructive/20 text-destructive';
            default: return 'bg-muted/20 text-muted-foreground';
        }
    };

    // Helpers to render user names/initials from available fields
    const userDisplayName = (u?: any) => {
        if (!u) return '';
        const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
        return full || u.username || u.email || '';
    };
    const userInitials = (u?: any) => {
        const name = userDisplayName(u);
        return name ? name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : '?';
    };

    const ownerName = userDisplayName(project?.owner as any);
    const initials = userInitials(project?.owner as any);
    const endDateDisplay = project?.endDate ? (() => {
        try {
            return format(parseISO(project.endDate), 'MMM dd, yyyy');
        } catch (e) {
            console.warn('[ProjectCard] invalid endDate for project', project.id, project.endDate);
            return project.endDate;
        }
    })() : '—';

    return (
        <Card className="shadow-card hover:shadow-elegant transition-all duration-300 animate-fade-in">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-32 p-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => onEdit && onEdit()}
                                disabled={isGuest}
                                title={isGuest ? 'Guests cannot edit projects' : undefined}
                            >
                                <FolderOpen className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-destructive"
                                onClick={handleDelete}
                                disabled={isGuest}
                                title={isGuest ? 'Guests cannot delete projects' : undefined}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        </PopoverContent>
                    </Popover>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <Badge variant="secondary" className={cn(getStatusColor(project.status))}>
                            {project.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-muted-foreground">{endDateDisplay}</span>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-md overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{completedTasks} of {projectTasks.length} tasks completed</p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">{ownerName || 'Unknown'}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{projectTasks.length} tasks</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProjectCard;
