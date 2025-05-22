// src/app/services/todo.service.ts

import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collectionData,
  addDoc,
  collection,
  deleteDoc,
  doc
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  getTodos() {
    const todosRef = collection(this.firestore, 'todos');
    return collectionData(todosRef, { idField: 'id' });
  }

  addTodo(todo: any) {
    const todosRef = collection(this.firestore, 'todos');
    return addDoc(todosRef, todo);
  }

  deleteTodo(id: string) {
    const todoDocRef = doc(this.firestore, 'todos', id);
    return deleteDoc(todoDocRef);
  }
}


// src/app/services/todo.service.ts

// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';

// export interface Todo {
//   id?: string;
//   title: string;
//   completed?: boolean;
//   // other fields
// }

// @Injectable({ providedIn: 'root' })
// export class TodoService {
//   private apiUrl = 'https://your-backend-api.com/api/todos'; // Replace with your actual API URL

//   constructor(private http: HttpClient) {}

//   getTodos(): Observable<Todo[]> {
//     return this.http.get<Todo[]>(this.apiUrl);
//   }

//   addTodo(todo: Todo): Observable<Todo> {
//     return this.http.post<Todo>(this.apiUrl, todo);
//   }

//   deleteTodo(id: string): Observable<void> {
//     return this.http.delete<void>(`${this.apiUrl}/${id}`);
//   }
// }
