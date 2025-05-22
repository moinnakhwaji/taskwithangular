import {
  Firestore,
  collection,
  query,
  where,
  collectionData,
  addDoc,
  deleteDoc,
  doc,
  CollectionReference,
  DocumentData,
} from '@angular/fire/firestore';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Todo } from './todo.model';
import { Auth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private converter = {
    toFirestore: (todo: Todo): DocumentData => ({ ...todo }),
    fromFirestore: (snapshot: any): Todo => {
      const data = snapshot.data();
      return {
        //@ts-ignore
        id: snapshot.id,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        uid: data.uid,
        email: data.email,
      };
    },
  };

  private todosCollection: CollectionReference<Todo> = collection(
    this.firestore,
    'todos'
  ).withConverter(this.converter);

  getTodos(): Observable<Todo[]> {
    const user = this.auth.currentUser;
    if (!user || !user.email) throw new Error('User not authenticated');

    const userQuery = query(
      this.todosCollection,
      where('email', '==', user.email)
    );

    return collectionData(userQuery, { idField: 'id' }) as Observable<Todo[]>;
  }

  addTodo(todo: Todo) {
    const user = this.auth.currentUser;
    if (!user || !user.email) throw new Error('User not authenticated');

    const todoWithEmail: Todo = {
      ...todo,
      email: user.email,
      uid: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return addDoc(this.todosCollection, todoWithEmail);
  }

  deleteTodo(id: string) {
    const todoDocRef = doc(this.firestore, 'todos', id).withConverter(
      this.converter
    );
    return deleteDoc(todoDocRef);
  }
}
