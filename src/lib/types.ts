export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tab {
  id: string;
  name: string;
  sortOrder: number;
}

export interface TodoList {
  id: string;
  tabId: string;
  name: string;
  sortOrder: number;
}

export interface DayTodosResponse {
  date: string;
  todos: Todo[];
}

export interface ListTodosResponse {
  listId: string;
  tabId: string;
  todos: Todo[];
}
