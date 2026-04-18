import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context';
import Layout from './Layout';
import PublicLayout from './PublicLayout';

const ConditionalLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // If user is logged in, use Layout (with sidebar)
  // If user is not logged in, use PublicLayout (without sidebar)
  if (isAuthenticated) {
    return <Layout>{children}</Layout>;
  }

  return <PublicLayout>{children}</PublicLayout>;
};

export default ConditionalLayout;

