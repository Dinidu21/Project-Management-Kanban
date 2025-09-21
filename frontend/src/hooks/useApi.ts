// src/hooks/useApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import apiService, {
    LoginRequest,
    RegisterRequest,
    ProjectRequest,
    TaskRequest,
    Project,
    Task,
    User,
    CurrentUser,
    Team,
    TeamRequest,
} from '@/services/api';

// Query Keys
export const queryKeys = {
    projects: ['projects'] as const,
    project: (id: number) => ['projects', id] as const,
    tasks: ['tasks'] as const,
    task: (id: number) => ['tasks', id] as const,
    taskStats: (status: string) => ['tasks', 'stats', status] as const,
    user: ['user'] as const,
    teams: ['teams'] as const,
    team: (id: number) => ['teams', id] as const,
};

// -------- AUTH HOOKS --------
export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: LoginRequest) => apiService.login(data),
        onSuccess: async () => {
            // fetch current user after login
            console.debug('[useApi] login onSuccess - fetching current user');
            const user = await apiService.getCurrentUser();
            console.debug('[useApi] current user', user);
            queryClient.setQueryData<CurrentUser>(queryKeys.user, user);
            toast({
                title: 'Success',
                description: 'Logged in successfully',
            });
        },
        onError: (error: any) => {
            console.error('[useApi] login onError', error);
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Login failed',
                variant: 'destructive',
            });
        },
    });
};

export const useRegister = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: RegisterRequest) => apiService.register(data),
        onSuccess: async (response, variables) => {
            console.debug('[useApi] register onSuccess - fetching current user');
            const user = await apiService.getCurrentUser();
            console.debug('[useApi] current user', user);
            queryClient.setQueryData<CurrentUser>(queryKeys.user, user);
            toast({
                title: 'Success',
                description: 'Account created successfully',
            });
            return { ...response, username: variables.username };
        },
        onError: (error: any) => {
            console.error('[useApi] register onError', error);
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Registration failed',
                variant: 'destructive',
            });
        },
    });
};

export const useCurrentUser = () => {
    return useQuery({
        queryKey: queryKeys.user,
        queryFn: () => apiService.getCurrentUser(),
        enabled: apiService.isAuthenticated(),
        retry: false,
    });
};

// -------- PROJECT HOOKS --------
export const useProjects = () => {
    return useQuery({
        queryKey: queryKeys.projects,
        queryFn: () => apiService.getProjects(),
        enabled: apiService.isAuthenticated(),
    });
};

export const useProject = (id: number) => {
    return useQuery({
        queryKey: queryKeys.project(id),
        queryFn: () => apiService.getProject(id),
        enabled: !!id && apiService.isAuthenticated(),
    });
};

export const useCreateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ProjectRequest) => apiService.createProject(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects });
            toast({
                title: 'Success',
                description: 'Project created successfully',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create project',
                variant: 'destructive',
            });
        },
    });
};

export const useUpdateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ProjectRequest }) =>
            apiService.updateProject(id, data),
        onSuccess: (updatedProject) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects });
            queryClient.setQueryData(queryKeys.project(updatedProject.id), updatedProject);
            toast({
                title: 'Success',
                description: 'Project updated successfully',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update project',
                variant: 'destructive',
            });
        },
    });
};

export const useDeleteProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => apiService.deleteProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects });
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
            toast({
                title: 'Success',
                description: 'Project deleted successfully',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete project',
                variant: 'destructive',
            });
        },
    });
};

// -------- TASK HOOKS --------
export const useTasks = () => {
    return useQuery({
        queryKey: queryKeys.tasks,
        queryFn: () => apiService.getTasks(),
        enabled: apiService.isAuthenticated(),
    });
};

export const useTask = (id: number) => {
    return useQuery({
        queryKey: queryKeys.task(id),
        queryFn: () => apiService.getTask(id),
        enabled: !!id && apiService.isAuthenticated(),
    });
};

export const useCreateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: TaskRequest) => apiService.createTask(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
            toast({
                title: 'Success',
                description: 'Task created successfully',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create task',
                variant: 'destructive',
            });
        },
    });
};

export const useUpdateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<TaskRequest> }) =>
            apiService.updateTask(id, data),
        onSuccess: (updatedTask) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
            queryClient.setQueryData(queryKeys.task(updatedTask.id), updatedTask);
            toast({
                title: 'Success',
                description: 'Task updated successfully',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update task',
                variant: 'destructive',
            });
        },
    });
};

export const useDeleteTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => apiService.deleteTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
            toast({
                title: 'Success',
                description: 'Task deleted successfully',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete task',
                variant: 'destructive',
            });
        },
    });
};

export const useTaskCountByStatus = (status: Task['status']) => {
    return useQuery({
        queryKey: queryKeys.taskStats(status),
        queryFn: () => apiService.getTaskCountByStatus(status),
        enabled: !!status && apiService.isAuthenticated(),
    });
};

// -------- USER MUTATIONS --------
export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<User> }) => apiService.updateUser(id, data),
        onSuccess: (updated) => {
            // updated may be a User or an object containing user + token (handled in api)
            queryClient.setQueryData(queryKeys.user, updated);
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update profile', variant: 'destructive' });
        },
    });
};

// -------- TEAM HOOKS --------
export const useTeams = () => {
    return useQuery({
        queryKey: queryKeys.teams,
        queryFn: () => apiService.getTeams(),
        enabled: apiService.isAuthenticated(),
    });
};

export const useCreateTeam = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: TeamRequest) => apiService.createTeam(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.teams });
            toast({ title: 'Success', description: 'Team created successfully' });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.response?.data?.message || 'Failed to create team', variant: 'destructive' });
        },
    });
};

export const useUpdateTeam = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: TeamRequest }) => apiService.updateTeam(id, data),
        onSuccess: (updatedTeam) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.teams });
            queryClient.setQueryData(queryKeys.team(updatedTeam.id), updatedTeam);
            toast({ title: 'Success', description: 'Team updated successfully' });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update team', variant: 'destructive' });
        },
    });
};

export const useDeleteTeam = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => apiService.deleteTeam(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.teams });
            toast({ title: 'Success', description: 'Team deleted successfully' });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.response?.data?.message || 'Failed to delete team', variant: 'destructive' });
        },
    });
};

export const useUpdateTeamMembers = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, memberIds }: { id: number; memberIds: number[] }) => apiService.updateTeamMembers(id, memberIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.teams });
            toast({ title: 'Success', description: 'Team members updated' });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update team members', variant: 'destructive' });
        },
    });
};