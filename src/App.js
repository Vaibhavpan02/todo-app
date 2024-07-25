import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
};

const App = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);


  const fetchTodos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/todos');
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]); 

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) {
      return; // if the input is empty or whitespace. do nothing
    }
    const id = Date.now().toString();
    const newTodoItem = { id, text: newTodo };

    setTodos((prevTodos) => [...prevTodos, newTodoItem]);
    setNewTodo('');

    try {
      await axios.post('http://localhost:3000/todos', newTodoItem);
    } catch (error) {
      console.error('Error adding todo:', error);
      // Rollback if error occurs
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    }
  };

  const deleteTodo = async (id) => {

    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));

    try {
      await axios.delete(`http://localhost:3000/todos/${id}`);
    } catch (error) {
      console.error('Error deleting todo:', error);

      fetchTodos(); 
    }
  };

  return (
    <div className="App">
      <h1>Todo List</h1>
      <form onSubmit={addTodo}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button type="submit" disabled={loading}>Add Todo</button>
      </form>
      {loading ? <p>Loading...</p> : (
        <ul>
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onDelete={() => deleteTodo(todo.id)} />
          ))}
        </ul>
      )}
    </div>
  );
};

const TodoItem = React.memo(({ todo, onDelete }) => (
  <li>
    {todo.text}
    <button onClick={onDelete}>Delete</button>
  </li>
));

export default App;
