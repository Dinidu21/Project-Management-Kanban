// src/types.ts
export interface User {
    id: string;
    name: string;
    email: string;
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

export { };
