import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
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
export class HomeComponent implements OnInit {
  private todoService = inject(TodoService);
  private auth = inject(Auth);

  todos$: Observable<Todo[]> = this.todoService.getTodos();
  // Form fields
  title = '';
  description = '';
  status: 'Active' | 'Completed' | 'Pending' = 'Active';
  priority: 'Low' | 'Medium' | 'High' = 'Low';

  ngOnInit(): void {}

  async addTodo() {
    const user = this.auth.currentUser;
    if (!user) return alert('You must be logged in to add todos.');

    if (!this.title.trim()) return alert('Title is required.');

    const todo: Todo = {
      title: this.title.trim(),
      description: this.description.trim(),
      status: this.status,
      priority: this.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      uid: user.uid,
      email:""
    };

    await this.todoService.addTodo(todo);

    // Clear inputs
    this.title = '';
    this.description = '';
    this.status = 'Active';
    this.priority = 'Low';
  }

  deleteTodo(id: string) {
    this.todoService.deleteTodo(id);
  }
}
