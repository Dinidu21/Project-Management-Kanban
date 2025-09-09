// src/pages/ProjectsView.tsx
import React, { useState } from 'react';
import { useProjects, useUpdateProject } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Kanban, List, Plus } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import ProjectModal from '@/components/ProjectModal';

const ProjectsView: React.FC = () => {
    const { data: projects = [], isLoading, error } = useProjects();
    const updateProject = useUpdateProject();
    const [draggingId, setDraggingId] = useState<number | null>(null);

    const handleProjectDrop = async (e: React.DragEvent, newStatus: string) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        if (!id) return;
        const projectId = Number(id);

        // optimistic update
        // get current projects from cache via local array 'projects'
        const prev = projects.slice();
        // quick local update for UI
        // (we won't mutate the original array reference here; React Query will be invalidated)

        try {
            // fetch full project from API to ensure required fields are present
            const full = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/projects/${projectId}`, { headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('auth_token') ? `Bearer ${localStorage.getItem('auth_token')}` : '' } });
            if (!full.ok) throw new Error('Failed to fetch project');
            const projectJson = await full.json();

            const payload = {
                name: projectJson.name,
                description: projectJson.description || '',
                status: newStatus,
                startDate: projectJson.startDate ?? null,
                endDate: projectJson.endDate ?? null,
            };

            await updateProject.mutateAsync({ id: projectId, data: payload as any });
        } catch (err) {
            console.error('Failed to move project', err);
        } finally {
            setDraggingId(null);
        }
    };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    if (isLoading) return <div>Loading projects...</div>;
    if (error) return <div>Error loading projects: {error.message}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Projects</h1>
                <div className="flex items-center space-x-2">
                    <div className="flex rounded-lg bg-muted p-1">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                        >
                            <Kanban className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                    </Button>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-muted-foreground">
                        <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No projects found. Create your first project!</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(['PLANNING','ACTIVE','ON_HOLD','COMPLETED','CANCELLED'] as const).map(col => (
                        <div key={col} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleProjectDrop(e, col)} className="p-2 rounded-md bg-card">
                            <h3 className="text-sm font-medium mb-2">{col.replace('_',' ')}</h3>
                            {projects.filter(p => p.status === col).map(project => (
                                <div key={project.id} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', String(project.id))} className="mb-3">
                                    <ProjectCard project={project} onEdit={() => { setSelectedProject(project); setIsModalOpen(true); }} />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            <ProjectModal isOpen={isModalOpen} project={selectedProject} onClose={() => { setIsModalOpen(false); setSelectedProject(null); }} onSaved={() => { setSelectedProject(null); }} />
        </div>
    );
};

export default ProjectsView;
