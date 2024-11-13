// src/App.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login form with "Iniciar Sesión" title', () => {
  render(<App />);
  const elements = screen.getAllByText(/iniciar sesión/i);
  expect(elements[0]).toBeInTheDocument(); // Verifica el primer elemento encontrado
});
