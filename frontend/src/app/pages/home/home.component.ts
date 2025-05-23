// home.component.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, takeUntil, map, combineLatest } from 'rxjs';
import { TodoService } from '../../services/todo.service';
import { Auth } from '@angular/fire/auth';
import { Todo } from '../../services/todo.model';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, FormsModule],
})
export default class HomeComponent implements OnInit, OnDestroy {
  private todoService = inject(TodoService);
  private auth = inject(Auth);
  private destroy$ = new Subject<void>();
  
  todos$: Observable<Todo[]> | undefined;
  filteredTodos$: Observable<Todo[]> | undefined;
  
  // Form fields
  title = '';
  description = '';
  status: 'Active' | 'Completed' | 'Pending' = 'Active';
  priority: 'Low' | 'Medium' | 'High' = 'Medium';
  
  // Filtering and sorting
  filterStatus: 'All' | 'Active' | 'Completed' | 'Pending' = 'All';
  sortBy: 'priority' | 'status' | 'created' | 'updated' = 'created';
  searchQuery = '';
  
  // Edit mode tracking
  editingTodoId: string | null = null;
  editForm = {
    title: '',
    description: '',
    status: 'Active' as 'Active' | 'Completed' | 'Pending',
    priority: 'Low' as 'Low' | 'Medium' | 'High'
  };

  // Loading and error states
  isLoading = false;
  error: string | null = null;

  // Statistics
  stats = {
    total: 0,
    active: 0,
    completed: 0,
    pending: 0
  };

  async ngOnInit(): Promise<void> {
    try {
      this.isLoading = true;
      this.todos$ = await this.todoService.getTodos();
      
      if (this.todos$) {
        this.setupFilteredTodos();
        this.setupStats();
      }
    } catch (error) {
      this.error = 'Failed to load todos. Please try again.';
      console.error('Error loading todos:', error);
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilteredTodos(): void {
    if (!this.todos$) return;

    this.filteredTodos$ = combineLatest([
      this.todos$,
      // You'd need to create observables for these filter values in a real app
      // For now, this will work with the current values
    ]).pipe(
      map(([todos]) => {
        let filtered = todos;

        // Apply status filter
        if (this.filterStatus !== 'All') {
          filtered = filtered.filter(todo => todo.status === this.filterStatus);
        }

        // Apply search filter
        if (this.searchQuery.trim()) {
          const query = this.searchQuery.toLowerCase();
          filtered = filtered.filter(todo => 
            todo.title.toLowerCase().includes(query) || 
            todo.description.toLowerCase().includes(query)
          );
        }

        // Apply sorting
        return this.sortTodos(filtered);
      }),
      takeUntil(this.destroy$)
    );
  }

  private setupStats(): void {
    if (!this.todos$) return;

    this.todos$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(todos => {
      this.stats = {
        total: todos.length,
        active: todos.filter(t => t.status === 'Active').length,
        completed: todos.filter(t => t.status === 'Completed').length,
        pending: todos.filter(t => t.status === 'Pending').length
      };
    });
  }

  private sortTodos(todos: Todo[]): Todo[] {
    return [...todos].sort((a, b) => {
      switch (this.sortBy) {
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'status':
          return a.status.localeCompare(b.status);
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'created':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }

  async addTodo(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      this.showError('You must be logged in to add todos.');
      return;
    }
    
    if (!this.title.trim()) {
      this.showError('Title is required.');
      return;
    }

    try {
      this.isLoading = true;
      const todo: Todo = {
        title: this.title.trim(),
        description: this.description.trim(),
        status: this.status,
        priority: this.priority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        uid: user.uid,
        email: user.email || "",
      };

      await this.todoService.addTodo(todo);
      this.resetForm();
      this.clearError();
    } catch (error) {
      this.showError('Failed to add todo. Please try again.');
      console.error('Error adding todo:', error);
    } finally {
      this.isLoading = false;
    }
  }

  startEdit(todo: Todo): void {
    this.editingTodoId = todo.id || null;
    this.editForm = {
      title: todo.title,
      description: todo.description,
      status: todo.status,
      priority: todo.priority
    };
  }

  async saveEdit(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      this.showError('You must be logged in to edit todos.');
      return;
    }
    
    if (!this.editingTodoId || !this.editForm.title.trim()) {
      this.showError('Title is required.');
      return;
    }

    try {
      this.isLoading = true;
      const updatedTodo: Partial<Todo> = {
        title: this.editForm.title.trim(),
        description: this.editForm.description.trim(),
        status: this.editForm.status,
        priority: this.editForm.priority,
        updatedAt: new Date().toISOString(),
      };

      await this.todoService.updateTodo(this.editingTodoId, updatedTodo);
      this.cancelEdit();
      this.clearError();
    } catch (error) {
      this.showError('Failed to update todo. Please try again.');
      console.error('Error updating todo:', error);
    } finally {
      this.isLoading = false;
    }
  }

  cancelEdit(): void {
    this.editingTodoId = null;
    this.editForm = {
      title: '',
      description: '',
      status: 'Active',
      priority: 'Low'
    };
  }

  async deleteTodo(id: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    try {
      this.isLoading = true;
      await this.todoService.deleteTodo(id);
      this.clearError();
    } catch (error) {
      this.showError('Failed to delete todo. Please try again.');
      console.error('Error deleting todo:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async toggleStatus(todo: Todo): Promise<void> {
    if (!todo.id) return;

    const newStatus = todo.status === 'Completed' ? 'Active' : 'Completed';
    
    try {
      await this.todoService.updateTodo(todo.id, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      this.showError('Failed to update todo status.');
      console.error('Error updating status:', error);
    }
  }

  onFilterChange(): void {
    this.setupFilteredTodos();
  }

  onSortChange(): void {
    this.setupFilteredTodos();
  }

  onSearchChange(): void {
    this.setupFilteredTodos();
  }

  private resetForm(): void {
    this.title = '';
    this.description = '';
    this.status = 'Active';
    this.priority = 'Medium';
  }

  private showError(message: string): void {
    this.error = message;
    setTimeout(() => this.clearError(), 5000);
  }

  clearError(): void {
    this.error = null;
  }

  // Utility methods for template
  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'High': return '🔴';
      case 'Medium': return '🟡';
      case 'Low': return '🟢';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Completed': return '✅';
      case 'Pending': return '⏳';
      case 'Active': return '🔵';
      default: return '';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  trackByTodoId(index: number, todo: Todo): string {
    return todo.id || index.toString();
  }
}