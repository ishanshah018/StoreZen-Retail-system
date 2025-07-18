import { render, screen } from '@testing-library/react';
import App from './App';


// Basic App component test - ensures the app renders without crashing
test('renders app without crashing', () => {
  render(<App />);
  // Test passes if no errors are thrown during rendering
});
