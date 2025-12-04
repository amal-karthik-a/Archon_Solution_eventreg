import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient'; // ← ADD THIS

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'participant',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // 1. Register with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            role: formData.role,
          },
        },
      });

      if (error) throw error;

      // 2. Auto-login after registration
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (loginError) throw loginError;

      // 3. Fetch role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', loginData.user.id)
        .single();

      if (profileError) throw profileError;

      // 4. Redirect based on role
      if (profile.role === 'participant') {
        navigate('/events');
      } else {
        navigate('/add_event');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <br />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <br />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <br />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="participant">Participant</option>
          <option value="coordinator">Coordinator</option>
        </select>
        <br />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;