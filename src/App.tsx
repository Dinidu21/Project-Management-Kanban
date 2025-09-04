import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  User, 
  LogOut, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Kanban,
  List,
  Edit,
  Trash2,
  X,
  Eye,
  Users,
  FolderOpen,
  Target,
  TrendingUp,
  Activity,
  Settings,
  Home
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed';
  startDate: Date;
  endDate: Date;
  owner: User;
  tasks?: Task[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate: Date;
  project: Project;
  assignee: User;
  tags: Tag[];
}

interface AppState {
  user: User | null;
  projects: Project[];
  tasks: Task[];
  tags: Tag[];
  isLoading: boolean;
}

// Context
const AppContext = createContext<{
  state: AppState;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  createProject: (project: Omit<Project, 'id' | 'owner'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  createTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}>({} as any);

const useApp = () => useContext(AppContext);

// Mock API service
const api = {
  async login(email: string, password: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (email === 'demo@example.com' && password === 'password') {
      return { id: '1', name: 'Demo User', email: 'demo@example.com' };
    }
    throw new Error('Invalid credentials');
  },

  async register(name: string, email: string, password: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { id: Date.now().toString(), name, email };
  },

  async getProjects(): Promise<Project[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: '1',
        name: 'Website Redesign',
        description: 'Complete overhaul of company website with modern design',
        status: 'Active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        owner: { id: '1', name: 'Demo User', email: 'demo@example.com' }
      },
      {
        id: '2',
        name: 'Mobile App Development',
        description: 'Native iOS and Android app development',
        status: 'Planning',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-06-30'),
        owner: { id: '1', name: 'Demo User', email: 'demo@example.com' }
      }
    ];
  },

  async getTasks(): Promise<Task[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const projects = await this.getProjects();
    return [
      {
        id: '1',
        title: 'Design Homepage Mockup',
        description: 'Create high-fidelity mockup for new homepage design',
        status: 'In Progress',
        priority: 'High',
        dueDate: new Date('2024-02-15'),
        project: projects[0],
        assignee: { id: '1', name: 'Demo User', email: 'demo@example.com' },
        tags: [{ id: '1', name: 'Design', color: 'bg-blue-500' }]
      },
      {
        id: '2',
        title: 'Set up Development Environment',
        description: 'Configure local development environment for the project',
        status: 'Completed',
        priority: 'Medium',
        dueDate: new Date('2024-01-20'),
        project: projects[0],
        assignee: { id: '1', name: 'Demo User', email: 'demo@example.com' },
        tags: [{ id: '2', name: 'Development', color: 'bg-green-500' }]
      },
      {
        id: '3',
        title: 'Market Research',
        description: 'Research competitor apps and market trends',
        status: 'Todo',
        priority: 'Low',
        dueDate: new Date('2024-02-28'),
        project: projects[1],
        assignee: { id: '1', name: 'Demo User', email: 'demo@example.com' },
        tags: [{ id: '3', name: 'Research', color: 'bg-purple-500' }]
      }
    ];
  }
};

// Components
const AuthForm: React.FC<{ isLogin: boolean; onToggle: () => void }> = ({ isLogin, onToggle }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-elegant animate-slide-up">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-gradient-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Target className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isLogin ? 'Welcome back' : 'Create account'}
          </CardTitle>
          <p className="text-muted-foreground">
            {isLogin ? 'Sign in to your account' : 'Start managing your projects today'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required={!isLogin}
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="demo@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>
          <div className="text-center mt-4">
            <Button variant="ghost" onClick={onToggle} className="text-sm">
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { state } = useApp();
  const { tasks, projects } = state;

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'Active').length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'Completed').length,
    inProgressTasks: tasks.filter(t => t.status === 'In Progress').length,
    overdueTasks: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed').length
  };

  const completionRate = stats.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Activity className="h-4 w-4" />
          <span>Last updated: {format(new Date(), 'MMM dd, HH:mm')}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card hover:shadow-elegant transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-3xl font-bold">{stats.totalProjects}</p>
                <p className="text-sm text-status-progress">{stats.activeProjects} active</p>
              </div>
              <FolderOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-3xl font-bold">{stats.totalTasks}</p>
                <p className="text-sm text-status-completed">{stats.completedTasks} completed</p>
              </div>
              <CheckCircle className="h-8 w-8 text-status-completed" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold">{stats.inProgressTasks}</p>
                <p className="text-sm text-status-progress">Active tasks</p>
              </div>
              <Clock className="h-8 w-8 text-status-progress" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-3xl font-bold">{stats.overdueTasks}</p>
                <p className="text-sm text-destructive">Need attention</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Progress Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Completion</span>
                  <span>{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-status-todo">{tasks.filter(t => t.status === 'Todo').length}</div>
                  <div className="text-xs text-muted-foreground">Todo</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-status-progress">{stats.inProgressTasks}</div>
                  <div className="text-xs text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-status-completed">{stats.completedTasks}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Tasks</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.slice(0, 4).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-gradient-card">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.project.name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        'text-xs',
                        task.status === 'Completed' && 'bg-status-completed/20 text-status-completed',
                        task.status === 'In Progress' && 'bg-status-progress/20 text-status-progress',
                        task.status === 'Todo' && 'bg-status-todo/20 text-status-todo'
                      )}
                    >
                      {task.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ProjectCard: React.FC<{ project: Project; onEdit: (project: Project) => void; onDelete: (id: string) => void }> = ({
  project,
  onEdit,
  onDelete
}) => {
  const { state } = useApp();
  const projectTasks = state.tasks.filter(t => t.project.id === project.id);
  const completedTasks = projectTasks.filter(t => t.status === 'Completed').length;
  const progress = projectTasks.length ? Math.round((completedTasks / projectTasks.length) * 100) : 0;

  return (
    <Card className="shadow-card hover:shadow-elegant transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-32 p-1">
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => onEdit(project)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={() => onDelete(project.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <Badge 
              variant="secondary"
              className={cn(
                project.status === 'Active' && 'bg-status-progress/20 text-status-progress',
                project.status === 'Completed' && 'bg-status-completed/20 text-status-completed',
                project.status === 'Planning' && 'bg-status-todo/20 text-status-todo',
                project.status === 'On Hold' && 'bg-destructive/20 text-destructive'
              )}
            >
              {project.status}
            </Badge>
            <span className="text-muted-foreground">
              {format(project.endDate, 'MMM dd, yyyy')}
            </span>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {completedTasks} of {projectTasks.length} tasks completed
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {project.owner.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">{project.owner.name}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {projectTasks.length} tasks
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TaskCard: React.FC<{ task: Task; onEdit: (task: Task) => void; onDelete: (id: string) => void }> = ({
  task,
  onEdit,
  onDelete
}) => {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';

  return (
    <Card className={cn(
      "shadow-card hover:shadow-elegant transition-all duration-300 animate-fade-in",
      isOverdue && "border-destructive"
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-sm">{task.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-32 p-1">
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => onEdit(task)}>
                  <Edit className="h-3 w-3 mr-2" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={() => onDelete(task.id)}>
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </Button>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex items-center justify-between">
            <Badge 
              variant="secondary"
              className={cn(
                'text-xs',
                task.status === 'Completed' && 'bg-status-completed/20 text-status-completed',
                task.status === 'In Progress' && 'bg-status-progress/20 text-status-progress',
                task.status === 'Todo' && 'bg-status-todo/20 text-status-todo',
                task.status === 'Cancelled' && 'bg-status-cancelled/20 text-status-cancelled'
              )}
            >
              {task.status}
            </Badge>
            <Badge 
              variant="outline"
              className={cn(
                'text-xs',
                task.priority === 'Critical' && 'border-priority-critical text-priority-critical',
                task.priority === 'High' && 'border-priority-high text-priority-high',
                task.priority === 'Medium' && 'border-priority-medium text-priority-medium',
                task.priority === 'Low' && 'border-priority-low text-priority-low'
              )}
            >
              {task.priority}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{task.project.name}</span>
            <span className={isOverdue ? 'text-destructive font-medium' : ''}>
              {format(task.dueDate, 'MMM dd')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs">
                  {task.assignee.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
            </div>
            <div className="flex space-x-1">
              {task.tags.map(tag => (
                <Badge key={tag.id} variant="secondary" className="text-xs px-1 py-0">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ProjectModal: React.FC<{
  project?: Project;
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id' | 'owner'> | Project) => void;
}> = ({ project, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Planning' as Project['status'],
    startDate: new Date(),
    endDate: new Date()
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'Planning',
        startDate: new Date(),
        endDate: new Date()
      });
    }
  }, [project, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (project) {
      onSave({ ...project, ...formData });
    } else {
      onSave(formData);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'Create New Project'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Project['status'] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planning">Planning</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(formData.startDate, 'MMM dd, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => date && setFormData({ ...formData, startDate: date })}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(formData.endDate, 'MMM dd, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => date && setFormData({ ...formData, endDate: date })}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-primary">
              {project ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const TaskModal: React.FC<{
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'> | Task) => void;
}> = ({ task, isOpen, onClose, onSave }) => {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Todo' as Task['status'],
    priority: 'Medium' as Task['priority'],
    dueDate: new Date(),
    projectId: '',
    assigneeId: '',
    tagIds: [] as string[]
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        projectId: task.project.id,
        assigneeId: task.assignee.id,
        tagIds: task.tags.map(t => t.id)
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'Todo',
        priority: 'Medium',
        dueDate: new Date(),
        projectId: state.projects[0]?.id || '',
        assigneeId: state.user?.id || '',
        tagIds: []
      });
    }
  }, [task, isOpen, state.projects, state.user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const project = state.projects.find(p => p.id === formData.projectId)!;
    const assignee = state.user!; // In real app, would have users list
    const tags = state.tags.filter(t => formData.tagIds.includes(t.id));

    const taskData = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      dueDate: formData.dueDate,
      project,
      assignee,
      tags
    };

    if (task) {
      onSave({ ...task, ...taskData });
    } else {
      onSave(taskData);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Task['status'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todo">Todo</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as Task['priority'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="project">Project</Label>
            <Select value={formData.projectId} onValueChange={(value) => setFormData({ ...formData, projectId: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {state.projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(formData.dueDate, 'MMM dd, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => date && setFormData({ ...formData, dueDate: date })}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-primary">
              {task ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ProjectsView: React.FC = () => {
  const { state, createProject, updateProject, deleteProject } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteProject(id);
    }
  };

  const handleSave = async (projectData: any) => {
    if (editingProject) {
      await updateProject(editingProject.id, projectData);
    } else {
      await createProject(projectData);
    }
    setEditingProject(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>
        <div className="flex items-center space-x-2">
          <div className="flex rounded-lg bg-muted p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Kanban className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="space-y-0">
              {state.projects.map((project, index) => (
                <div
                  key={project.id}
                  className={cn(
                    "flex items-center justify-between p-4 border-b last:border-b-0",
                    index % 2 === 0 && "bg-muted/30"
                  )}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium">{project.name}</h3>
                      <Badge
                        variant="secondary"
                        className={cn(
                          project.status === 'Active' && 'bg-status-progress/20 text-status-progress',
                          project.status === 'Completed' && 'bg-status-completed/20 text-status-completed',
                          project.status === 'Planning' && 'bg-status-todo/20 text-status-todo',
                          project.status === 'On Hold' && 'bg-destructive/20 text-destructive'
                        )}
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-muted-foreground">
                      Due {format(project.endDate, 'MMM dd')}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(project)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(project.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ProjectModal
        project={editingProject || undefined}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
};

const TasksView: React.FC = () => {
  const { state, createTask, updateTask, deleteTask } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    project: 'all'
  });

  const filteredTasks = state.tasks.filter(task => {
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }
    if (filters.project !== 'all' && task.project.id !== filters.project) {
      return false;
    }
    return true;
  });

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id);
    }
  };

  const handleSave = async (taskData: any) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      await createTask(taskData);
    }
    setEditingTask(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Todo">Todo</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.project} onValueChange={(value) => setFilters({ ...filters, project: value })}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {state.projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tasks found matching your filters.</p>
          </div>
        </div>
      )}

      <TaskModal
        task={editingTask || undefined}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
};

const Header: React.FC<{ onNavigate: (view: string) => void; currentView: string }> = ({ onNavigate, currentView }) => {
  const { state, logout } = useApp();

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Target className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold">ProjectHub</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Home },
              { id: 'projects', label: 'Projects', icon: FolderOpen },
              { id: 'tasks', label: 'Tasks', icon: CheckCircle }
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={currentView === id ? 'secondary' : 'ghost'}
                onClick={() => onNavigate(id)}
                className="flex items-center space-x-2"
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarFallback>
                {state.user?.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium">{state.user?.name}</p>
              <p className="text-xs text-muted-foreground">{state.user?.email}</p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

// Main App Component
const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    user: null,
    projects: [],
    tasks: [],
    tags: [
      { id: '1', name: 'Design', color: 'bg-blue-500' },
      { id: '2', name: 'Development', color: 'bg-green-500' },
      { id: '3', name: 'Research', color: 'bg-purple-500' }
    ],
    isLoading: false
  });
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    // Auto-enable dark mode
    document.documentElement.classList.add('dark');
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const user = await api.login(email, password);
      const [projects, tasks] = await Promise.all([
        api.getProjects(),
        api.getTasks()
      ]);
      setState(prev => ({
        ...prev,
        user,
        projects,
        tasks,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const user = await api.register(name, email, password);
      setState(prev => ({
        ...prev,
        user,
        projects: [],
        tasks: [],
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setState({
      user: null,
      projects: [],
      tasks: [],
      tags: state.tags,
      isLoading: false
    });
    setCurrentView('dashboard');
  }, [state.tags]);

  const createProject = useCallback(async (projectData: Omit<Project, 'id' | 'owner'>) => {
    setState(prev => ({ ...prev, isLoading: true }));
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      owner: state.user!
    };
    setState(prev => ({
      ...prev,
      projects: [...prev.projects, newProject],
      isLoading: false
    }));
  }, [state.user]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id),
      tasks: prev.tasks.filter(t => t.project.id !== id)
    }));
  }, []);

  const createTask = useCallback(async (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString()
    };
    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  }, []);

  const contextValue = {
    state,
    login,
    register,
    logout,
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    deleteTask
  };

  if (!state.user) {
    return (
      <AppContext.Provider value={contextValue}>
        <AuthForm
          isLogin={isLogin}
          onToggle={() => setIsLogin(!isLogin)}
        />
      </AppContext.Provider>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background">
        <Header onNavigate={setCurrentView} currentView={currentView} />
        
        <main className="container mx-auto px-4 py-8">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'projects' && <ProjectsView />}
          {currentView === 'tasks' && <TasksView />}
        </main>
      </div>
    </AppContext.Provider>
  );
};

export default App;