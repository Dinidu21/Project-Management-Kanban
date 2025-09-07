// src/services/api.ts
import axios, { AxiosInstance, AxiosResponse } from "axios";

// -------- AUTH --------
export interface LoginRequest {
    username: string;  // Java expects username, not email
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export interface AuthResponse {
    token: string;
    type: string;       // Java returns "Bearer"
    username: string;
    email: string;
}

// -------- USER --------
export interface User {
    id: number;          // Java uses Long (number in JSON)
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: "USER" | "ADMIN";
    createdAt: string;
    updatedAt: string;
}

// -------- PROJECTS --------
export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";

export interface ProjectRequest {
    name: string;
    description?: string;
    status: ProjectStatus;
    startDate?: string;  // Java LocalDate serialized as ISO string
    endDate?: string;
}

export interface Project {
    id: number;
    name: string;
    description?: string;
    status: ProjectStatus;
    startDate?: string;
    endDate?: string;
    owner: User;
    createdAt: string;
    updatedAt: string;
}

// -------- TASKS --------
export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";  // Java uses URGENT, not CRITICAL

export interface TaskRequest {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    projectId: number;
    assigneeId?: number;
    tags?: string[];  // exists in Java DTO
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    project: Project;
    assignee?: User;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CurrentUser {
    id: number;
    username: string;
    email: string;
    role: string;
}

// -------- API SERVICE --------
class ApiService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
            timeout: 10000,
            headers: { "Content-Type": "application/json" },
        });

        // Add token
        this.client.interceptors.request.use((config) => {
            const token = localStorage.getItem("auth_token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        // Handle errors
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem("auth_token");
                    window.location.href = "/login";
                }
                return Promise.reject(error);
            }
        );
    }

    // -------- AUTH --------
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response: AxiosResponse<AuthResponse> = await this.client.post("/auth/login", data);
        if (response.data.token) {
            localStorage.setItem("auth_token", response.data.token);
        }
        return response.data;
    }

    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response: AxiosResponse<AuthResponse> = await this.client.post("/auth/register", data);
        if (response.data.token) {
            localStorage.setItem("auth_token", response.data.token);
        }
        return response.data;
    }

    logout(): void {
        localStorage.removeItem("auth_token");
    }

    // -------- PROJECTS --------
    async getProjects(): Promise<Project[]> {
        const response: AxiosResponse<Project[]> = await this.client.get("/projects");
        return response.data;
    }

    async getProject(id: number): Promise<Project> {
        const response: AxiosResponse<Project> = await this.client.get(`/projects/${id}`);
        return response.data;
    }

    async createProject(data: ProjectRequest): Promise<Project> {
        const response: AxiosResponse<Project> = await this.client.post("/projects", data);
        return response.data;
    }

    async updateProject(id: number, data: ProjectRequest): Promise<Project> {
        const response: AxiosResponse<Project> = await this.client.put(`/projects/${id}`, data);
        return response.data;
    }

    async deleteProject(id: number): Promise<void> {
        await this.client.delete(`/projects/${id}`);
    }

    // -------- TASKS --------
    async getTasks(): Promise<Task[]> {
        const response: AxiosResponse<Task[]> = await this.client.get("/tasks");
        return response.data;
    }

    async getTask(id: number): Promise<Task> {
        const response: AxiosResponse<Task> = await this.client.get(`/tasks/${id}`);
        return response.data;
    }

    async createTask(data: TaskRequest): Promise<Task> {
        const response: AxiosResponse<Task> = await this.client.post("/tasks", data);
        return response.data;
    }

    async updateTask(id: number, data: Partial<TaskRequest>): Promise<Task> {
        const response: AxiosResponse<Task> = await this.client.put(`/tasks/${id}`, data);
        return response.data;
    }

    async deleteTask(id: number): Promise<void> {
        await this.client.delete(`/tasks/${id}`);
    }

    async getTaskCountByStatus(status: TaskStatus): Promise<number> {
        const response: AxiosResponse<number> = await this.client.get(`/tasks/stats/${status}`);
        return response.data;
    }

    // -------- USER --------
    isAuthenticated(): boolean {
        return !!localStorage.getItem("auth_token");
    }

    async getCurrentUser(): Promise<CurrentUser> {
        const response: AxiosResponse<CurrentUser> = await this.client.get("/auth/me");
        return response.data;
    }
}

export const apiService = new ApiService();
export default apiService;