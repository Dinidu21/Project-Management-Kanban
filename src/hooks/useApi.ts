// src/hooks/useApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import apiService, {
    LoginRequest,
    RegisterRequest,
    ProjectRequest,
    TaskRequest,
    Project,
    Task
} from '@/services/api';

// Query Keys
export const queryKeys = {
    projects: ['projects'] as const,
    project: (id: string) => ['projects', id] as const,
    tasks: ['tasks'] as const,
    task: (id: string) => ['tasks', id] as const,
    taskStats: (status: string) => ['tasks', 'stats', status] as const,
    user: ['user'] as const,
};

// Auth Hooks
export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: LoginRequest) => apiService.login(data),
        onSuccess: (response) => {
            queryClient.setQueryData(queryKeys.user, response.user);
            toast({
                title: "Success",
                description: "Logged in successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Login failed",
                variant: "destructive",
            });
        },
    });
};

export const useRegister = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: RegisterRequest) => apiService.register(data),
        onSuccess: (response) => {
            queryClient.setQueryData(queryKeys.user, response.user);
            toast({
                title: "Success",
                description: "Account created successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Registration failed",
                variant: "destructive",
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

// Project Hooks
export const useProjects = () => {
    return useQuery({
        queryKey: queryKeys.projects,
        queryFn: () => apiService.getProjects(),
        enabled: apiService.isAuthenticated(),
    });
};

export const useProject = (id: string) => {
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
                title: "Success",
                description: "Project created successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to create project",
                variant: "destructive",
            });
        },
    });
};

export const useUpdateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: ProjectRequest }) =>
            apiService.updateProject(id, data),
        onSuccess: (updatedProject) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects });
            queryClient.setQueryData(queryKeys.project(updatedProject.id), updatedProject);
            toast({
                title: "Success",
                description: "Project updated successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update project",
                variant: "destructive",
            });
        },
    });
};

export const useDeleteProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => apiService.deleteProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects });
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
            toast({
                title: "Success",
                description: "Project deleted successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to delete project",
                variant: "destructive",
            });
        },
    });
};

// Task Hooks
export const useTasks = () => {
    return useQuery({
        queryKey: queryKeys.tasks,
        queryFn: () => apiService.getTasks(),
        enabled: apiService.isAuthenticated(),
    });
};

export const useTask = (id: string) => {
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
                title: "Success",
                description: "Task created successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to create task",
                variant: "destructive",
            });
        },
    });
};

export const useUpdateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<TaskRequest> }) =>
            apiService.updateTask(id, data),
        onSuccess: (updatedTask) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
            queryClient.setQueryData(queryKeys.task(updatedTask.id), updatedTask);
            toast({
                title: "Success",
                description: "Task updated successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update task",
                variant: "destructive",
            });
        },
    });
};

export const useDeleteTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => apiService.deleteTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
            toast({
                title: "Success",
                description: "Task deleted successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to delete task",
                variant: "destructive",
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