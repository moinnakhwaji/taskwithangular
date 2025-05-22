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
