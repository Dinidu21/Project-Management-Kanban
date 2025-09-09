// src/pages/TasksView.tsx
import React, { useState, useEffect } from 'react';
import { useTasks, useProjects } from '@/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus } from 'lucide-react';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import { Button } from '@/components/ui/button';

const TasksView: React.FC = () => {
    const { data: tasks = [], isLoading, error } = useTasks();
    const { data: projects = [] } = useProjects();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    // filters drives the filteredTasks; we keep a local searchTerm to enable realtime typing
    const [filters, setFilters] = useState({ search: '', status: 'all', priority: 'all', project: 'all' });
    const [searchTerm, setSearchTerm] = useState<string>(filters.search);

    // debounce updating the filter.search so the UI updates smoothly while typing
    useEffect(() => {
        const id = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchTerm }));
        }, 150);
        return () => clearTimeout(id);
    }, [searchTerm, setFilters]);

    const filteredTasks = tasks.filter(task => {
        if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
        if (filters.status !== 'all' && task.status !== filters.status) return false;
        if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
        if (filters.project !== 'all' && String(task.project.id) !== filters.project) return false;
        return true;
    });

    if (isLoading) return <div>Loading tasks...</div>;
    if (error) return <div>Error loading tasks: {error.message}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Tasks</h1>
                <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-primary"><Plus className="h-4 w-4 mr-2" />New Task</Button>
            </div>

            <Card className="shadow-card">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                        </div>
                        <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="TODO">Todo</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="REVIEW">Review</SelectItem>
                                <SelectItem value="DONE">Done</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priority</SelectItem>
                                <SelectItem value="LOW">Low</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="URGENT">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filters.project} onValueChange={(value) => setFilters({ ...filters, project: value })}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Project" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Projects</SelectItem>
                                {projects.map(project => <SelectItem key={project.id} value={String(project.id)}>{project.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-muted-foreground">
                        <p>No tasks found matching your filters.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredTasks.map((task) => <TaskCard key={task.id} task={task} onEdit={() => { setSelectedTask(task); setIsModalOpen(true); }} />)}
                </div>
            )}

            <TaskModal isOpen={isModalOpen} task={selectedTask} onClose={() => { setIsModalOpen(false); setSelectedTask(null); }} onSaved={() => setSelectedTask(null)} />
        </div>
    );
};

export default TasksView;
