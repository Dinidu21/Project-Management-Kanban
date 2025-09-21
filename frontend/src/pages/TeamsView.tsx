// src/pages/TeamsView.tsx
import React, { useState } from 'react';
import { useTeams, useDeleteTeam } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Users, Settings, Edit, Trash2 } from 'lucide-react';
import TeamModal from '@/components/TeamModal';

const TeamsView: React.FC = () => {
    const { data: teams = [], isLoading, error } = useTeams();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editTeam, setEditTeam] = useState<{ id: number; name: string; description?: string } | null>(null);
    const [manageTeam, setManageTeam] = useState<{ id: number; name: string; description?: string } | null>(null);
    const [deleteTeam, setDeleteTeam] = useState<{ id: number; name: string } | null>(null);

    const deleteTeamMutation = useDeleteTeam();

    if (isLoading) return <div>Loading teams...</div>;
    if (error) return <div>Error loading teams: {(error as any)?.message || 'Unknown error'}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Teams</h1>
                <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    New Team
                </Button>
            </div>

            {teams.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No teams found. Create your first team!</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team: any) => (
                        <Card key={team.id} className="shadow-card hover:shadow-elegant transition-shadow duration-300">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold">{team.name}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">{team.description || '—'}</p>
                                    </div>
                                    <div className="flex space-x-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setEditTeam({ id: team.id, name: team.name, description: team.description })}
                                            title="Edit team"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setManageTeam({ id: team.id, name: team.name, description: team.description })}
                                            title="Manage members"
                                        >
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setDeleteTeam({ id: team.id, name: team.name })}
                                            title="Delete team"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-4 text-xs text-muted-foreground">
                                    <div>Owner: {team?.owner?.username || team?.owner?.email || '—'}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create new team */}
            <TeamModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode="create"
                onSaved={() => setIsModalOpen(false)}
            />

            {/* Edit team */}
            <TeamModal
                isOpen={!!editTeam}
                onClose={() => setEditTeam(null)}
                team={editTeam as any}
                mode="edit"
                onSaved={() => setEditTeam(null)}
            />

            {/* Manage members for a team */}
            <TeamModal
                isOpen={!!manageTeam}
                onClose={() => setManageTeam(null)}
                team={manageTeam as any}
                mode="manage-members"
                onSaved={() => setManageTeam(null)}
            />

            {/* Delete confirmation dialog */}
            <AlertDialog open={!!deleteTeam} onOpenChange={() => setDeleteTeam(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Team</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the team "{deleteTeam?.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                if (deleteTeam) {
                                    try {
                                        await deleteTeamMutation.mutateAsync(deleteTeam.id);
                                        setDeleteTeam(null);
                                    } catch (error) {
                                        console.error('Failed to delete team:', error);
                                    }
                                }
                            }}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default TeamsView;