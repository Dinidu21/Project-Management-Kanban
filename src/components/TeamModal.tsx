import React, { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useCreateTeam, useUpdateTeamMembers } from '@/hooks/useApi';
import { AxiosError } from 'axios';
import axios from 'axios'; // Import axios for the name check request

type TeamLite = {
    id: number;
    name: string;
    description?: string;
};

const TeamModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    team?: TeamLite | null;
    onSaved?: () => void;
}> = ({ isOpen, onClose, team = null, onSaved }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [memberIdsInput, setMemberIdsInput] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isNameAvailable, setIsNameAvailable] = useState<boolean | null>(null);

    const createTeam = useCreateTeam();
    const updateMembers = useUpdateTeamMembers();

    // Debounced function to check team name availability
    const checkTeamName = useCallback(
        debounce(async (name: string) => {
            if (!name.trim()) {
                setIsNameAvailable(null);
                return;
            }
            try {
                const response = await axios.get(`/api/teams/check-name/${encodeURIComponent(name)}`);
                setIsNameAvailable(!response.data); // If response.data is true, name exists, so not available
                setErrorMessage(null);
            } catch (error) {
                console.error('[TeamModal] check team name failed', error);
                setIsNameAvailable(null);
                setErrorMessage('Failed to check team name availability.');
            }
        }, 500),
        []
    );

    // Debounce function implementation
    function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
        let timeout: NodeJS.Timeout;
        return (...args: Parameters<T>) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    useEffect(() => {
        if (isOpen) {
            if (team) {
                setMemberIdsInput('');
                setErrorMessage(null);
            } else {
                setName('');
                setDescription('');
                setErrorMessage(null);
                setIsNameAvailable(null);
            }
        }
    }, [isOpen, team]);

    useEffect(() => {
        if (!team) {
            checkTeamName(name);
        }
    }, [name, checkTeamName, team]);

    const handleSubmitCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isNameAvailable === false) {
            setErrorMessage('A team with this name already exists.');
            return;
        }
        try {
            await createTeam.mutateAsync({ name, description });
            onClose();
            onSaved && onSaved();
        } catch (error) {
            console.error('[TeamModal] create failed', error);
            if (error instanceof AxiosError && error.response?.data) {
                setErrorMessage(error.response.data);
            } else {
                setErrorMessage('Failed to create team. Please try again.');
            }
        }
    };

    const handleSubmitMembers = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!team) return;

        try {
            const ids = memberIdsInput
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
                .map((s) => Number(s))
                .filter((n) => !Number.isNaN(n));

            await updateMembers.mutateAsync({ id: Number(team.id), memberIds: ids });
            onClose();
            onSaved && onSaved();
        } catch (error) {
            console.error('[TeamModal] update members failed', error);
            if (error instanceof AxiosError && error.response?.data) {
                setErrorMessage(error.response.data);
            } else {
                setErrorMessage('Failed to update team members. Please try again.');
            }
        }
    };

    const savingCreate =
        (createTeam as any).isLoading || (createTeam as any).isPending || (createTeam as any).status === 'loading';
    const savingMembers =
        (updateMembers as any).isLoading ||
        (updateMembers as any).isPending ||
        (updateMembers as any).status === 'loading';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{team ? `Manage Team: ${team.name}` : 'Create New Team'}</DialogTitle>
                </DialogHeader>

                {errorMessage && (
                    <div className="text-red-500 text-sm mb-4">{errorMessage}</div>
                )}

                {!team ? (
                    <form onSubmit={handleSubmitCreate} className="space-y-4">
                        <div>
                            <Label htmlFor="team-name">Team Name</Label>
                            <Input
                                id="team-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className={isNameAvailable === false ? 'border-red-500' : ''}
                            />
                            {isNameAvailable === false && (
                                <p className="text-xs text-red-500 mt-1">This team name is already taken.</p>
                            )}
                            {isNameAvailable === true && (
                                <p className="text-xs text-green-500 mt-1">This team name is available.</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="team-description">Description</Label>
                            <Textarea
                                id="team-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="flex space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-gradient-primary"
                                disabled={savingCreate || isNameAvailable === false}
                            >
                                {savingCreate ? 'Creating...' : 'Create'}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSubmitMembers} className="space-y-4">
                        <div>
                            <Label>Team</Label>
                            <div className="text-sm mt-1">
                                <div className="font-medium">{team.name}</div>
                                {team.description ? <div className="text-muted-foreground">{team.description}</div> : null}
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="member-ids">Member IDs (comma separated)</Label>
                            <Input
                                id="member-ids"
                                placeholder="e.g. 2, 5, 7"
                                value={memberIdsInput}
                                onChange={(e) => setMemberIdsInput(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Enter user IDs separated by commas. The owner will be kept as a member automatically.
                            </p>
                        </div>

                        <div className="flex space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1 bg-gradient-primary" disabled={savingMembers}>
                                {savingMembers ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default TeamModal;