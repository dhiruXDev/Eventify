import { ResetPasswordForm } from '../components/auth';
import GeneralFooter from './GeneralFooter';
import Navbar from '../components/layout/Navbar';

const ResetPasswordPage = () => {
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
        <div className="absolute bottom-[-200px] right-[-100px] w-[400px] h-[400px] z-5 bg-green-300 opacity-20 rounded-full animate-pulse"></div>

        <div className="max-w-7xl mx-auto w-full py-40 pb-20">
          <div className="grid grid-cols-1 items-center">
            {/* Left Side - Reset Password Form */}
            <div className="w-full">
              <div className="p-8 rounded-2xl">
                <h1 className="text-center text-4xl font-bold text-blue-800 mb-6">Reset Password</h1>
                <div>
                  <ResetPasswordForm />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <div className='w-full relative z-10 mt-20'>
          <GeneralFooter />
        </div> */}
      </div>
    </div>
  );
};

export default ResetPasswordPage;