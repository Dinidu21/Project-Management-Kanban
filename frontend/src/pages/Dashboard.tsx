// src/pages/Dashboard.tsx
import React from 'react';
import { useProjects, useTasks } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Activity, FolderOpen, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Dashboard: React.FC = () => {
    const { data: projects = [] } = useProjects();
    const { data: tasks = [] } = useTasks();

    const stats = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'ACTIVE').length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'DONE').length,
        inProgressTasks: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        overdueTasks: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'DONE').length
    };

    const completionRate = stats.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="flex items-center space-x-2 text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    <span>Last updated: {format(new Date(), 'MMM dd, HH:mm')}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-card hover:shadow-elegant transition-shadow duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Projects</p>
                                <p className="text-3xl font-bold">{stats.totalProjects}</p>
                                <p className="text-sm text-status-progress">{stats.activeProjects} active</p>
                            </div>
                            <FolderOpen className="h-8 w-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-card hover:shadow-elegant transition-shadow duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Tasks</p>
                                <p className="text-3xl font-bold">{stats.totalTasks}</p>
                                <p className="text-sm text-status-completed">{stats.completedTasks} completed</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-status-completed" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-card hover:shadow-elegant transition-shadow duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">In Progress</p>
                                <p className="text-3xl font-bold">{stats.inProgressTasks}</p>
                                <p className="text-sm text-status-progress">Active tasks</p>
                            </div>
                            <Clock className="h-8 w-8 text-status-progress" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-card hover:shadow-elegant transition-shadow duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Overdue</p>
                                <p className="text-3xl font-bold">{stats.overdueTasks}</p>
                                <p className="text-sm text-destructive">Need attention</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-card">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5" />
                            <span>Progress Overview</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Overall Completion</span>
                                    <span>{completionRate}%</span>
                                </div>
                                <Progress value={completionRate} className="h-2" />
                            </div>
                            <div className="grid grid-cols-4 gap-4 pt-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-status-todo">
                                        {tasks.filter(t => t.status === 'TODO').length}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Todo</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-status-progress">{stats.inProgressTasks}</div>
                                    <div className="text-xs text-muted-foreground">In Progress</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-status-progress">
                                        {tasks.filter(t => t.status === 'REVIEW').length}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Review</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-status-completed">{stats.completedTasks}</div>
                                    <div className="text-xs text-muted-foreground">Done</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-card">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Clock className="h-5 w-5" />
                            <span>Recent Tasks</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {tasks.slice(0, 4).map((task) => (
                                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-gradient-card">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{task.title}</p>
                                        <p className="text-xs text-muted-foreground">{task.project.name}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                'text-xs',
                                                task.status === 'DONE' && 'bg-status-completed/20 text-status-completed',
                                                task.status === 'IN_PROGRESS' && 'bg-status-progress/20 text-status-progress',
                                                task.status === 'TODO' && 'bg-status-todo/20 text-status-todo',
                                                task.status === 'REVIEW' && 'bg-status-progress/20 text-status-progress'
                                            )}
                                        >
                                            {task.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
