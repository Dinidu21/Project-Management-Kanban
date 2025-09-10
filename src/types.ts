// src/types.ts
export interface User {
    id: string | number;
    username?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: 'ADMIN' | 'TEAM_LEAD' | 'MEMBER' | 'GUEST';
}

export interface TeamLite {
    id: number | string;
    name: string;
}

export interface Project {
    id: string | number;
    name: string;
    description?: string;
    status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
    startDate?: string;
    endDate?: string;
    owner: User;
    team?: TeamLite | null;
    createdAt: string;
    updatedAt: string;
}

export interface Task {
    id: string | number;
    title: string;
    description?: string;
    status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate?: string;
    project: Project;
    assignee?: User;
    createdAt: string;
    updatedAt: string;
}

export { };
