// Auth.js
import { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Auth({ darkMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('Check your email to confirm sign up!');
  };

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  return (
    <div className={`auth-container ${darkMode ? 'dark' : ''}`}>
      <h2>Login / Sign Up</h2>
      <input
        className="auth-input"
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        className="auth-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <div>
        <button className="auth-button" onClick={signIn}>Sign In</button>
        <button className="auth-button" onClick={signUp}>Sign Up</button>
      </div>
    </div>
  );
}
