import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
