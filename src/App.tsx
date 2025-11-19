import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from './context/ThemeContext';

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
