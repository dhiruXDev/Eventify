import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const PublicLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      
      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-4 md:px-6 md:py-6">
          {children || <Outlet />}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicLayout;

