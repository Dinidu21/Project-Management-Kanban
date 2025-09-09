import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCurrentUser, useUpdateUser } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { data: user } = useCurrentUser();
    const updateUser = useUpdateUser();
    const queryClient = useQueryClient();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (user) {
            setFirstName((user as any).firstName || '');
            setLastName((user as any).lastName || '');
            setUsername((user as any).username || '');
        }
    }, [user]);

    const handleSave = async () => {
        if (!user || (user as any).id === undefined) {
            toast({ title: 'Error', description: 'User not loaded' });
            return;
        }

        try {
            await updateUser.mutateAsync({ id: (user as any).id, data: { firstName, lastName, username: username || undefined, password: password || undefined } as any });
            // ensure the current user query is refetched so UI shows fresh data (and token rotation is applied)
            try {
                await queryClient.invalidateQueries({ queryKey: ['user'] });
                await queryClient.refetchQueries({ queryKey: ['user'] });
            } catch (e) {
                console.warn('Failed to refetch current user after update', e);
            }
            toast({ title: 'Success', description: 'Profile updated' });
            onClose();
        } catch (err) {
            console.error('Profile update failed', err);
            toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Profile</DialogTitle>
                    <DialogDescription id="profile-desc">Update your profile information. </DialogDescription>
                </DialogHeader>

                <div className="space-y-4" aria-describedby="profile-desc">
                    <label className="block text-sm font-medium">First name</label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />

                    <label className="block text-sm font-medium">Last name</label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />

                    <label className="block text-sm font-medium">Email</label>
                    <Input value={(user as any)?.email || ''} readOnly />

                    <label className="block text-sm font-medium">Username</label>
                    <Input value={username} onChange={(e) => setUsername(e.target.value)} />

                    <label className="block text-sm font-medium">Change password</label>
                    <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Leave blank to keep current password" />
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} className="ml-2" disabled={updateUser.status === 'pending'}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileModal;
