// src/services/api.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types based on your backend DTOs
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface ProjectRequest {
    name: string;
    description: string;
    status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
    startDate: string;
    endDate: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
    startDate: string;
    endDate: string;
    owner: User;
    createdAt: string;
    updatedAt: string;
}

export interface TaskRequest {
    title: string;
    description: string;
    status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    dueDate: string;
    projectId: string;
    assigneeId?: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    dueDate: string;
    project: Project;
    assignee?: User;
    createdAt: string;
    updatedAt: string;
}

class ApiService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add auth token
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Token expired or invalid
                    localStorage.removeItem('auth_token');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    // Auth endpoints
    async login(loginData: LoginRequest): Promise<AuthResponse> {
        const response: AxiosResponse<AuthResponse> = await this.client.post('/auth/login', loginData);
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
        }
        return response.data;
    }

    async register(registerData: RegisterRequest): Promise<AuthResponse> {
        const response: AxiosResponse<AuthResponse> = await this.client.post('/auth/register', registerData);
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
        }
        return response.data;
    }

    logout(): void {
        localStorage.removeItem('auth_token');
    }

    // Project endpoints
    async getProjects(): Promise<Project[]> {
        const response: AxiosResponse<Project[]> = await this.client.get('/projects');
        return response.data;
    }

    async getProject(id: string): Promise<Project> {
        const response: AxiosResponse<Project> = await this.client.get(`/projects/${id}`);
        return response.data;
    }

    async createProject(projectData: ProjectRequest): Promise<Project> {
        const response: AxiosResponse<Project> = await this.client.post('/projects', projectData);
        return response.data;
    }

    async updateProject(id: string, projectData: ProjectRequest): Promise<Project> {
        const response: AxiosResponse<Project> = await this.client.put(`/projects/${id}`, projectData);
        return response.data;
    }

    async deleteProject(id: string): Promise<void> {
        await this.client.delete(`/projects/${id}`);
    }

    // Task endpoints
    async getTasks(): Promise<Task[]> {
        const response: AxiosResponse<Task[]> = await this.client.get('/tasks');
        return response.data;
    }

    async getTask(id: string): Promise<Task> {
        const response: AxiosResponse<Task> = await this.client.get(`/tasks/${id}`);
        return response.data;
    }

    async createTask(taskData: TaskRequest): Promise<Task> {
        const response: AxiosResponse<Task> = await this.client.post('/tasks', taskData);
        return response.data;
    }

    async updateTask(id: string, taskData: Partial<TaskRequest>): Promise<Task> {
        const response: AxiosResponse<Task> = await this.client.put(`/tasks/${id}`, taskData);
        return response.data;
    }

    async deleteTask(id: string): Promise<void> {
        await this.client.delete(`/tasks/${id}`);
    }

    async getTaskCountByStatus(status: Task['status']): Promise<number> {
        const response: AxiosResponse<number> = await this.client.get(`/tasks/stats/${status}`);
        return response.data;
    }

    // Utility method to check if user is authenticated
    isAuthenticated(): boolean {
        return !!localStorage.getItem('auth_token');
    }

    // Get current user from token (you might need to add a /me endpoint to your backend)
    async getCurrentUser(): Promise<User> {
        const response: AxiosResponse<User> = await this.client.get('/auth/me');
        return response.data;
    }
}

export const apiService = new ApiService();
export default apiService;