import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth';
import SignUpImage from '../assets/lonInPg.png';
import GeneralFooter from './GeneralFooter';
import Navbar from '../components/layout/Navbar';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    // Redirect to dashboard after successful login
    navigate('/dashboard');
  };

  return (
    <div 
      className="min-h-screen relative flex flex-col pt-10 overflow-x-hidden overflow-y-hidden"
      style={{
        background: 'linear-gradient(to right, #ffffff, #f3f4f6, #e5e7eb)'
      }}
    >
      <Navbar />
      <div className='flex h-full flex-col w-full '>
        {/* Decorative Circles */}
        <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-300 opacity-20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-[100px] right-[-100px] w-[400px] h-[400px] z-5 bg-green-300 opacity-20 rounded-full animate-pulse"></div>

        <div className="max-w-7xl mx-auto w-full py-40 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
             {/* Right Side - SignUp Image */}
             <div className="hidden lg:flex items-center justify-center">
              <div className="w-full max-w-lg">
                <img 
                  src={SignUpImage} 
                  alt="Sign In Illustration" 
                  className="w-full h-auto object-contain -mt-40"
                />
              </div>
            </div>

            {/* Left Side - Login Form */}
            <div className="w-full">
              <div className="p-8 rounded-2xl">
                <h1 className="text-center text-4xl font-bold text-blue-800 mb-6">Sign In</h1>
                <div>
          <LoginForm onSuccess={handleLoginSuccess} />
                </div>
              </div>
            </div>

           

          </div>
        </div>
        <div className='w-full relative z-10 mt-20'>
          <GeneralFooter />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;