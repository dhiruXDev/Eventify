import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

const RegisterForm = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { register, googleLogin } = useAuth();
  const [showCollegePrompt, setShowCollegePrompt] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState(null);
  const [collegeInput, setCollegeInput] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [googleProfile, setGoogleProfile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const registerSchema = Yup.object().shape({
    firstName: Yup.string()
      .required('First name is required')
      .min(2, 'First name must be at least 2 characters'),
    lastName: Yup.string()
      .required('Last name is required')
      .min(2, 'Last name must be at least 2 characters'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: Yup.string()
      .required('Please confirm your password')
      .oneOf([Yup.ref('password')], 'Passwords must match'),
    college: Yup.string()
      .required('College name is required'),
    role: Yup.string()
      .oneOf(['participant', 'organizer', 'admin'], 'Please select a valid role')
      .required('Role is required'),
    acceptTerms: Yup.boolean()
      .oneOf([true], 'You must accept the terms and conditions')
  });

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      college: '',
      role: 'participant',
      acceptTerms: false
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Remove confirmPassword and acceptTerms from the data sent to the API
        const { confirmPassword: _confirmPassword, acceptTerms: _acceptTerms, ...registrationData } = values;
        
        // Call the register function from AuthContext
        await register(registrationData);
        
        // Call the success callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        setError(err.message || 'Failed to register. Please try again.');
        console.error('Registration error:', err);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Google signup handler
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError(null);
    try {
      const idToken = credentialResponse.credential;
      const response = await googleLogin(idToken);
      if (response.needCollege) {
        setShowCollegePrompt(true);
        setGoogleIdToken(idToken);
        setGoogleProfile(response.googleProfile);
      } else if (response.success) {
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Google signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCollegeSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await googleLogin(googleIdToken, collegeInput);
      if (response.success) {
        setShowCollegePrompt(false);
        setGoogleIdToken(null);
        setGoogleProfile(null);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Google signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-2 rounded-xl shadow-xs">
      {/* Title moved to parent component */}

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* First Name */}
          <div>
            <label
              htmlFor="firstName"
            className="block text-gray-600 text-sm font-medium mb-2"
            >
              First Name
            </label>
          <div className={`relative flex items-center bg-gray-50 rounded-lg border-2 ${
            formik.touched.firstName && formik.errors.firstName
              ? "border-red-500"
              : "border-gray-200 focus-within:border-green-500"
          } transition-colors`}>
            <div className="pl-4 pr-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              id="firstName"
              type="text"
              name="firstName"
              placeholder="Enter your first name"
              className="flex-1 py-3 px-2 bg-transparent border-none focus:outline-none text-gray-900 font-medium"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.firstName}
              disabled={isLoading}
            />
          </div>
            {formik.touched.firstName && formik.errors.firstName && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.firstName}
              </p>
            )}
          </div>

        {/* Last Name */}
          <div>
            <label
              htmlFor="lastName"
            className="block text-gray-600 text-sm font-medium mb-2"
            >
              Last Name
            </label>
          <div className={`relative flex items-center bg-gray-50 rounded-lg border-2 ${
            formik.touched.lastName && formik.errors.lastName
              ? "border-red-500"
              : "border-gray-200 focus-within:border-green-500"
          } transition-colors`}>
            <div className="pl-4 pr-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              id="lastName"
              type="text"
              name="lastName"
              placeholder="Enter your last name"
              className="flex-1 py-3 px-2 bg-transparent border-none focus:outline-none text-gray-900 font-medium"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.lastName}
              disabled={isLoading}
            />
          </div>
            {formik.touched.lastName && formik.errors.lastName && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.lastName}
              </p>
            )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-gray-600 text-sm font-medium mb-2"
          >
            Email
          </label>
          <div className={`relative flex items-center bg-gray-50 rounded-lg border-2 ${
            formik.touched.email && formik.errors.email
              ? "border-red-500"
              : "border-gray-200 focus-within:border-green-500"
          } transition-colors`}>
            <div className="pl-4 pr-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          <input
            id="email"
            type="email"
            name="email"
              placeholder="example@gmail.com"
              className="flex-1 py-3 px-2 bg-transparent border-none focus:outline-none text-gray-900 font-medium"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            disabled={isLoading}
          />
          </div>
          {formik.touched.email && formik.errors.email && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
          )}
        </div>

        {/* College */}
        <div>
          <label
            htmlFor="college"
            className="block text-gray-600 text-sm font-medium mb-2"
          >
            College/University
          </label>
          <div className={`relative flex items-center bg-gray-50 rounded-lg border-2 ${
            formik.touched.college && formik.errors.college
              ? "border-red-500"
              : "border-gray-200 focus-within:border-green-500"
          } transition-colors`}>
            <div className="pl-4 pr-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          <input
            id="college"
            type="text"
            name="college"
            placeholder="Enter your college or university"
              className="flex-1 py-3 px-2 bg-transparent border-none focus:outline-none text-gray-900 font-medium"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.college}
            disabled={isLoading}
          />
          </div>
          {formik.touched.college && formik.errors.college && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.college}</p>
          )}
        </div>

        {/* Role Selection */}
        <div>
          <label
            htmlFor="role"
            className="block text-gray-600 text-sm font-medium mb-2"
          >
            Role
          </label>
          <div className={`relative flex items-center bg-gray-50 rounded-lg border-2 ${
            formik.touched.role && formik.errors.role
              ? "border-red-500"
              : "border-gray-200 focus-within:border-green-500"
          } transition-colors`}>
            <div className="pl-4 pr-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <select
              id="role"
              name="role"
              className="flex-1 py-3 px-2 bg-transparent border-none focus:outline-none text-gray-900 font-medium appearance-none cursor-pointer"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.role}
              disabled={isLoading}
            >
              <option value="participant">Participant</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
            <div className="pr-4 pl-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {formik.touched.role && formik.errors.role && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.role}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-gray-600 text-sm font-medium mb-2"
          >
            Password
          </label>
          <div className={`relative flex items-center bg-gray-50 rounded-lg border-2 ${
            formik.touched.password && formik.errors.password
              ? "border-red-500"
              : "border-gray-200 focus-within:border-green-500"
          } transition-colors`}>
            <div className="pl-4 pr-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          <input
            id="password"
              type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Create a password"
              className="flex-1 py-3 px-2 bg-transparent border-none focus:outline-none text-gray-900 font-medium"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            disabled={isLoading}
          />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="pr-4 pl-2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {formik.errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-gray-600 text-sm font-medium mb-2"
          >
            Confirm Password
          </label>
          <div className={`relative flex items-center bg-gray-50 rounded-lg border-2 ${
            formik.touched.confirmPassword && formik.errors.confirmPassword
              ? "border-red-500"
              : "border-gray-200 focus-within:border-green-500"
          } transition-colors`}>
            <div className="pl-4 pr-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          <input
            id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm your password"
              className="flex-1 py-3 px-2 bg-transparent border-none focus:outline-none text-gray-900 font-medium"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.confirmPassword}
            disabled={isLoading}
          />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="pr-4 pl-2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showConfirmPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {formik.errors.confirmPassword}
            </p>
          )}
        </div>

        <div className="mb-6">
          <div className="flex items-center">
            <input
              id="acceptTerms"
              type="checkbox"
              name="acceptTerms"
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              checked={formik.values.acceptTerms}
              disabled={isLoading}
            />
            <label
              htmlFor="acceptTerms"
              className="ml-2 block text-sm text-gray-700"
            >
              I accept the{" "}
              <a href="#" className="text-green-600 hover:text-green-800">
                Terms and Conditions
              </a>{" "}
              and{" "}
              <a href="#" className="text-green-600 hover:text-green-700">
                Privacy Policy
              </a>
            </label>
          </div>
          {formik.touched.acceptTerms && formik.errors.acceptTerms && (
            <p className="text-red-500 text-xs mt-1">
              {formik.errors.acceptTerms}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200 ease-in-out"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex justify-center items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Registering...
            </span>
          ) : (
            "Register"
          )}
        </button>
      </form>

      <div className="flex justify-center mt-6">
        <GoogleOAuthProvider clientId={clientId}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google login failed")}
            useOneTap // Optional
          />
        </GoogleOAuthProvider>
      </div>

      {showCollegePrompt && (
        <form onSubmit={handleCollegeSubmit} className="mt-4">
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              College/University Name
            </label>
            <input
              type="text"
              value={collegeInput}
              onChange={(e) => setCollegeInput(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300 focus:ring-green-200"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 mt-2"
          >
            Submit
          </button>
        </form>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-green-600 hover:text-green-800 font-medium"
          >
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;