// src/components/TaskCard.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { MoreVertical, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useDeleteTask } from '@/hooks/useApi';
import type { Task } from '@/types';

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const deleteTaskMutation = useDeleteTask();

    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'DONE';

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this task?')) {
            await deleteTaskMutation.mutateAsync(task.id);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DONE': return 'bg-status-completed/20 text-status-completed';
            case 'IN_PROGRESS': return 'bg-status-progress/20 text-status-progress';
            case 'TODO': return 'bg-status-todo/20 text-status-todo';
            case 'REVIEW': return 'bg-status-progress/20 text-status-progress';
            default: return 'bg-muted/20 text-muted-foreground';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'CRITICAL': return 'border-priority-critical text-priority-critical';
            case 'HIGH': return 'border-priority-high text-priority-high';
            case 'MEDIUM': return 'border-priority-medium text-priority-medium';
            case 'LOW': return 'border-priority-low text-priority-low';
            default: return 'border-muted text-muted-foreground';
        }
    };

    return (
        <Card className={cn(
            "shadow-card hover:shadow-elegant transition-all duration-300 animate-fade-in",
            isOverdue && "border-destructive"
        )}>
            <CardContent className="p-4">
                <div className="space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="font-medium text-sm">{task.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-3 w-3" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-32 p-1">
                                <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={handleDelete}>
                                    <Trash2 className="h-3 w-3 mr-2" />
                                    Delete
                                </Button>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex items-center justify-between">
                        <Badge variant="secondary" className={cn('text-xs', getStatusColor(task.status))}>{task.status.replace('_', ' ')}</Badge>
                        <Badge variant="outline" className={cn('text-xs', getPriorityColor(task.priority))}>{task.priority}</Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{task.project.name}</span>
                        <span className={isOverdue ? 'text-destructive font-medium' : ''}>{format(parseISO(task.dueDate), 'MMM dd')}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                            <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-xs">{task.assignee?.name?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{task.assignee?.name || 'Unassigned'}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default TaskCard;
