import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/auth';
import SignUpImage from '../assets/SignUp2-re.png';
import GeneralFooter from './GeneralFooter';
import Navbar from '../components/layout/Navbar';
const RegisterPage = () => {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    // Redirect to login page after successful registration
    navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
  };

  return (
    <div 
      className="min-h-screen relative flex   flex-col pt-10   overflow-x-hidden overflow-y-hidden "
      style={{
        background: 'linear-gradient(to right, #ffffff, #f3f4f6, #e5e7eb)'
      }}
    >
      <Navbar />
      <div className='flex flex-col    w-full '>

            {/* Decorative Circles */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-300 opacity-20 rounded-full animate-pulse"></div>
      <div className="absolute bottom-[100px] right-[-100px] w-[400px] h-[400px] z-5 bg-green-300 opacity-20 rounded-full animate-pulse"></div>

      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
          {/* Left Side - Registration Form */}
          <div className="w-full">
            <div className=" p-8 rounded-2xl ">
              <h1 className="text-center text-4xl font-bold text-blue-800 mb-6">Sign Up</h1>
              <div>
                <RegisterForm onSuccess={handleRegisterSuccess} />
              </div>
            </div>
          </div>

          {/* Right Side - SignUp Image */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-full max-w-lg">
              <img 
                src={SignUpImage} 
                alt="Sign Up Illustration" 
                className="w-full h-auto object-contain  -mt-40 "
              />
            </div>
          </div>
        </div>
      </div>
      <div className='w-full relative z-10 '>

        <GeneralFooter />
      </div>
     
      </div>
    </div>
  );
};

export default RegisterPage;