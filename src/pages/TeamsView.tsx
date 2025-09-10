// src/pages/TeamsView.tsx
import React, { useState } from 'react';
import { useTeams } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Users, Settings } from 'lucide-react';
import TeamModal from '@/components/TeamModal';

const TeamsView: React.FC = () => {
    const { data: teams = [], isLoading, error } = useTeams();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [manageTeam, setManageTeam] = useState<{ id: number; name: string; description?: string } | null>(null);

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
                                    <Button variant="ghost" size="sm" onClick={() => setManageTeam({ id: team.id, name: team.name, description: team.description })}>
                                        <Settings className="h-4 w-4" />
                                    </Button>
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
                onSaved={() => setIsModalOpen(false)}
            />

            {/* Manage members for a team */}
            <TeamModal
                isOpen={!!manageTeam}
                onClose={() => setManageTeam(null)}
                team={manageTeam as any}
                onSaved={() => setManageTeam(null)}
            />
        </div>
    );
};

export default TeamsView;