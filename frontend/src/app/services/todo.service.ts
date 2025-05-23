import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from, Observable, switchMap } from 'rxjs';
import { Todo } from './todo.model';
import { Auth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private http = inject(HttpClient);
  private auth = inject(Auth);

  private baseUrl = 'http://localhost:3000/api/todos';

  private getAuthHeaders(): Promise<HttpHeaders> {
    return this.auth.currentUser?.getIdToken().then((token) => {
      return new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      });
    }) ?? Promise.reject('User not authenticated');
  }

  getTodos(): Observable<Todo[]> {
    return from(this.getAuthHeaders()).pipe(
      switchMap((headers) =>
        this.http.get<Todo[]>(`${this.baseUrl}`, { headers })
      )
    );
  }

  addTodo(todo: Partial<Todo>): Observable<any> {
    return from(this.getAuthHeaders()).pipe(
      switchMap((headers) =>
        this.http.post(`${this.baseUrl}`, todo, { headers })
      )
    );
  }

  updateTodo(id: string, updatedTodo: Partial<Todo>): Observable<any> {
    return from(this.getAuthHeaders()).pipe(
      switchMap((headers) =>
        this.http.patch(`${this.baseUrl}/${id}`, updatedTodo, { headers })
      )
    );
  }

  deleteTodo(id: string): Observable<any> {
    return from(this.getAuthHeaders()).pipe(
      switchMap((headers) =>
        this.http.delete(`${this.baseUrl}/${id}`, { headers })
      )
    );
  }
}
