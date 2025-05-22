import { Component, inject, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common'; // ⬅️ Import this!
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule] // ⬅️ Include it here
})
export class HomeComponent implements OnInit {
  private todoService = inject(TodoService);
  todos$ = this.todoService.getTodos();

  ngOnInit(): void {}

  addTodo(text: string) {
    const todo = { text, createdAt: new Date() };
    this.todoService.addTodo(todo);
  }

  deleteTodo(id: string) {
    this.todoService.deleteTodo(id);
  }
}
