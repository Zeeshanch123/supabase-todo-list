// App.js
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import './App.css';

export default function App() {
  const [session, setSession] = useState(null);
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        setUserEmail(data.session.user.email);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess?.user) {
        setUserEmail(sess.user.email);
        fetchTodos();
      } else {
        setUserEmail('');
        setTodos([]);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('inserted_at', { ascending: false });

    if (error) console.error(error);
    else setTodos(data);
  };

  const addTodo = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { error } = await supabase.from('todos').insert([
      { title, description: desc, user_id: user.id }
    ]);

    if (error) {
      console.error(error);
      alert('Failed to add todo: ' + error.message);
    } else {
      setTitle('');
      setDesc('');
      fetchTodos();
    }
  };

  const toggleTodo = async (id, currentStatus) => {
    const { error } = await supabase
      .from('todos')
      .update({ is_complete: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error(error);
    } else {
      fetchTodos();
    }
  };

  if (!session) return <Auth darkMode={darkMode} />;

  return (
    <div className={`container ${darkMode ? 'dark' : ''}`}>
      <h1 className="heading">📝 My Private Todo List</h1>

      <p className="welcome">
        Welcome, <strong>{userEmail}</strong>
        <span className="avatar">{userEmail?.[0]?.toUpperCase()}</span>
      </p>

      <button className="darkToggle" onClick={() => setDarkMode(prev => !prev)}>
        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      <button className="signOut" onClick={signOut}>Sign Out</button>

      <div className="inputGroup">
        <input
          className="input"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          className="input"
          placeholder="Description"
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />
        <div className="buttonGroup">
          <button className="button" onClick={addTodo}>Add Todo</button>
          <button className="button" onClick={fetchTodos}>Refresh Todos</button>
        </div>
      </div>

      <ul className="todoList">
        {todos.map(todo => (
          <li key={todo.id} className="todoItem">
            <input
              type="checkbox"
              checked={todo.is_complete}
              onChange={() => toggleTodo(todo.id, todo.is_complete)}
            />
            <span style={{ textDecoration: todo.is_complete ? 'line-through' : 'none', marginLeft: '10px' }}>
              <b>{todo.title}</b>: {todo.description}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
