import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { Todo } from './todo.model';
import { Auth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private http = inject(HttpClient);
  private auth = inject(Auth);
  private baseUrl = 'http://localhost:3000/api/todos';
  
  // Use BehaviorSubject to manage todos state
  private todosSubject = new BehaviorSubject<Todo[]>([]);
  public todos$ = this.todosSubject.asObservable();

  private async getAuthHeaders(): Promise<HttpHeaders> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      const token = await user.getIdToken();
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      });
    } catch (error) {
      console.error('Error getting auth token:', error);
      throw error;
    }
  }

  async getTodos(): Promise<Observable<Todo[]>> {
    try {
      console.log('Getting todos...');
      const headers = await this.getAuthHeaders();
      
      const todos = await firstValueFrom(
        this.http.get<Todo[]>(this.baseUrl, { headers })
      );
      
      console.log('Received todos:', todos);
      this.todosSubject.next(todos);
      return this.todos$;
    } catch (error) {
      console.error('Error getting todos:', error);
      this.handleError(error);
      throw error;
    }
  }

  async addTodo(todo: Partial<Todo>): Promise<void> {
    try {
      console.log('Adding todo:', todo);
      const headers = await this.getAuthHeaders();
      
      const response = await firstValueFrom(
        this.http.post<Todo>(this.baseUrl, todo, { headers })
      );
      
      console.log('Todo added successfully:', response);
      
      // Refresh the todos list
      await this.refreshTodos();
    } catch (error) {
      console.error('Error adding todo:', error);
      this.handleError(error);
      throw error;
    }
  }

  async updateTodo(id: string, updatedTodo: Partial<Todo>): Promise<void> {
    try {
      console.log('Updating todo:', id, updatedTodo);
      const headers = await this.getAuthHeaders();
      
      const response = await firstValueFrom(
        this.http.patch(`${this.baseUrl}/${id}`, updatedTodo, { headers })
      );
      
      console.log('Todo updated successfully:', response);
      
      // Refresh the todos list
      await this.refreshTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
      this.handleError(error);
      throw error;
    }
  }

  async deleteTodo(id: string): Promise<void> {
    try {
      console.log('Deleting todo:', id);
      const headers = await this.getAuthHeaders();
      
      const response = await firstValueFrom(
        this.http.delete(`${this.baseUrl}/${id}`, { headers })
      );
      
      console.log('Todo deleted successfully:', response);
      
      // Refresh the todos list
      await this.refreshTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
      this.handleError(error);
      throw error;
    }
  }

  private async refreshTodos(): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const todos = await firstValueFrom(
        this.http.get<Todo[]>(this.baseUrl, { headers })
      );
      this.todosSubject.next(todos);
    } catch (error) {
      console.error('Error refreshing todos:', error);
    }
  }

  private handleError(error: any): void {
    if (error instanceof HttpErrorResponse) {
      console.error('HTTP Error Status:', error.status);
      console.error('HTTP Error Message:', error.message);
      console.error('HTTP Error Details:', error.error);
      
      switch (error.status) {
        case 401:
          alert('You are not authorized. Please log in again.');
          break;
        case 403:
          alert('You do not have permission to perform this action.');
          break;
        case 404:
          alert('The requested item was not found.');
          break;
        case 500:
          alert('Server error. Please try again later.');
          break;
        default:
          alert(`An error occurred: ${error.message}`);
      }
    } else {
      console.error('Non-HTTP Error:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  }
}