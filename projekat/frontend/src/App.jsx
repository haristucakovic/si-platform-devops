import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/routes_index';

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
