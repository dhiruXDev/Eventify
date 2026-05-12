import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
 
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine user role
  const isAdmin = user && user.role === 'admin';
  const isOrganizer = user && user.role === 'organizer';

  
  // Check if a route is active
  const isActive = (path) => {
    if (Array.isArray(path)) {
      return path.some(p => {
        if (p === '/dashboard' || p === '/admindashboard' || p === '/organizerdashboard') {
          return location.pathname === p;
        }
        return location.pathname.startsWith(p);
      });
    }
    
    if (path === '/dashboard' || path === '/admindashboard' || path === '/organizerdashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 w-64 bg-white text-white z-30 transform transition-transform duration-300 ease-in-out shadow-lg overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ top: '64px', height: 'calc(100vh - 64px)' }}
      >
        <div className="flex justify-end pt-4">
          <button
            className="text-gray-300 hover:text-white md:hidden focus:outline-none p-2"
            onClick={toggleSidebar}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <nav className="mt-4 pb-4">
          <div className="px-4 py-2 text-xs text-gray-400 uppercase font-semibold tracking-wider">Main</div>
          <ul className=' flex flex-col gap-2'>
            {/* Home/Dashboard - Visible to all users, active by default */}
            <li>
              <Link
                to={isAdmin ? '/admindashboard' : isOrganizer ? '/organizerdashboard' : '/dashboard'}
                className={`flex items-center px-4 py-3 rounded-md mx-2 transition-all duration-200 ${isActive(['/admindashboard', '/dashboard', '/organizerdashboard'])
                    ? 'bg-green-600 text-white'
                    : 'text-gray-900 hover:bg-green-600 hover:text-white'
                  }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                Home
              </Link>
            </li>

{user?.role === 'organizer' && (
  <li>
    <Link
      to="/club-info"
      className={`flex items-center px-4 py-3 rounded-md mx-2 transition-all duration-200 ${isActive('/club-info')
        ? 'bg-green-600 text-white'
        : 'text-gray-900 hover:bg-green-600 hover:text-white'
        }`}
    >
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
      </svg>
      Club Info
    </Link>
  </li>
)}

            {/* Admin Dashboard - Only visible to admins */}
            {/* {isAdmin && (
              <li>
                <Link
                  to="/admindashboard"
                  className={`flex items-center px-4 py-3 rounded-md mx-2 transition-all duration-200 ${isActive('/admindashboard')
                      ? 'bg-green-600 text-white'
                      : 'text-gray-900 hover:bg-green-600 hover:text-white'
                    }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                  Admin Dashboard
                </Link>
              </li>
            )} */}

            {/* Organizer Dashboard - Only visible to organizers */}
            {/* {isOrganizer && (
              <li>
                <Link
                  to="/organizerdashboard"
                  className={`flex items-center px-4 py-3 rounded-md mx-2 transition-all duration-200 ${isActive('/organizerdashboard')
                      ? 'bg-green-600 text-white'
                      : 'text-gray-900 hover:bg-green-600 hover:text-white'
                    }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                  Organizer Dashboard
                </Link>
              </li>
            )} */}

            {/* Events - Visible to all users */}
            <li>
              <Link
                to="/events"
                className={`flex items-center px-4 py-3 rounded-md mx-2 transition-all duration-200 ${isActive('/events')
                    ? 'bg-green-600 text-white'
                    : 'text-gray-900 hover:bg-green-600 hover:text-white'
                  }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Events
              </Link>
            </li>

            {/* Leaderboard - Visible to all users */}
            <li>
              <Link
                to="/leaderboard"
                className={`flex items-center px-4 py-3 rounded-md mx-2 transition-all duration-200 ${isActive('/leaderboard')
                    ? 'bg-green-600 text-white'
                    : 'text-gray-900 hover:bg-green-600 hover:text-white'
                  }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                Leaderboard
              </Link>
            </li>

            {/* Announcements - Visible to all users */}
            <li>
              <Link
                to="/announcements"
                className={`flex items-center px-4 py-3 rounded-md mx-2 transition-all duration-200 ${isActive('/announcements')
                    ? 'bg-green-600 text-white'
                    : 'text-gray-900 hover:bg-green-600 hover:text-white'
                  }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
                </svg>
                Announcements
              </Link>
            </li>
            
            {/* Participant Event Features */}
            {(!isAdmin && !isOrganizer) && (
              <>
                <li>
                  <Link
                    to="/attendance-history"
                    className={`flex items-center px-4 py-3 rounded-md mx-2 transition-all duration-200 ${isActive('/attendance-history')
                        ? 'bg-green-600 text-white'
                        : 'text-gray-900 hover:bg-green-600 hover:text-white'
                      }`}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                    </svg>
                    Attendance History
                  </Link>
                </li>
                <li>
                  <Link
                    to="/my-certificates"
                    className={`flex items-center px-4 py-3 rounded-md mx-2 transition-all duration-200 ${isActive('/my-certificates')
                        ? 'bg-green-600 text-white'
                        : 'text-gray-900 hover:bg-green-600 hover:text-white'
                      }`}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                    </svg>
                    Certificates
                  </Link>
                </li>
              </>
            )}

            {/* Attendance Management - Visible to Organizers, Admins, Volunteers, and Club Members */}
            {(isOrganizer || isAdmin || user?.role === 'volunteer' || user?.role === 'member') && (
              <li>
                <Link
                  to="/attendance"
                  className={`flex items-center px-4 py-3 rounded-md mx-2 transition-all duration-200 ${isActive('/attendance')
                      ? 'bg-green-600 text-white'
                      : 'text-gray-900 hover:bg-green-600 hover:text-white'
                    }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
                  </svg>
                  Attendance
                </Link>
              </li>
            )}
            
            {/* Club Conflict - Visible to Organizers and Admins */}
            {(isOrganizer || isAdmin) && (
              <li>
                <Link
                  to="/club-conflict"
                  className={`flex items-center px-4 py-3 rounded-md mx-2 transition-all duration-200 ${isActive('/club-conflict')
                      ? 'bg-green-600 text-white'
                      : 'text-gray-900 hover:bg-green-600 hover:text-white'
                    }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Club Conflict
                </Link>
              </li>
            )}
          </ul>

          {/* Recruitment Section - Only visible to organizers and admins */}
          {(isOrganizer || isAdmin) && (
            <>
              <div className="px-4 py-2 mt-4 text-xs text-gray-400 uppercase font-semibold tracking-wider">Recruitment</div>
              <ul className=' flex flex-col gap-2'>
                <li>
                  <Link
                    to="/recruitment/create"
                    className={`flex items-center px-4 py-3 rounded-md mx-2 transition-all duration-200 ${isActive('/recruitment/create')
                        ? 'bg-green-600 text-white'
                        : 'text-gray-900 hover:bg-green-600 hover:text-white'
                      }`}
                  >

                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen-icon lucide-square-pen mr-3 font-bold"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
                    Create Recruitment
                  </Link>
                </li>
                <li>
                  <Link
                    to="/recruitment/manage"
                    className={`flex items-center px-4 py-3 rounded-md mx-2 transition-all duration-200 ${isActive('/recruitment/manage')
                        ? 'bg-green-600 text-white'
                        : 'text-gray-900 hover:bg-green-600 hover:text-white'
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-kanban-icon lucide-folder-kanban mr-3 font-bold"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><path d="M8 10v4"/><path d="M12 10v2"/><path d="M16 10v6"/></svg>
                    Manage Exams
                  </Link>
                </li>
                <li>
                  <Link
                    to="/recruitment/selected"
                    className={`flex items-center px-4 py-3 rounded-md mx-2 transition-all duration-200 ${isActive('/recruitment/selected')
                        ? 'bg-green-600 text-white'
                        : 'text-gray-900 hover:bg-green-600 hover:text-white'
                      }`}
                  >          
                       <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-check-icon lucide-user-check mr-3 font-bold"><path d="m16 11 2 2 4-4"/><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>                    Selected List
                  </Link>
                </li>
              </ul>
            </>
          )}

          <div className="px-4 py-2 mt-4 text-xs text-gray-400 uppercase font-semibold tracking-wider">Account</div>
          <ul className=' flex flex-col gap-2'>
            <li>
              <Link
                to="/profile"
                className={`flex items-center px-4 py-3 rounded-md mx-2 transition-all duration-200 ${isActive('/profile')
                    ? 'bg-green-600 text-white'
                    : 'text-gray-900 hover:bg-green-600 hover:text-white'
                  }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Profile
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className={`flex items-center px-4 py-3 rounded-md mx-2 transition-all duration-200 ${isActive('/settings')
                    ? 'bg-green-600 text-white'
                    : 'text-gray-900 hover:bg-green-600 hover:text-white'
                  }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Settings
              </Link>
            </li>
            {/* System Settings - Only visible to admins */}
            {isAdmin && (
              <li>
                <Link
                  to="/system-settings"
                  className={`flex items-center px-4 py-3 rounded-md mx-2 transition-all duration-200 ${isActive('/system-settings')
                      ? 'bg-green-600 text-white'
                      : 'text-gray-900 hover:bg-green-600 hover:text-white'
                    }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
                  </svg>
                  System Settings
                </Link>
              </li>
            )}
            <li>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="flex items-center w-[90%] px-4 py-3 text-left text-red-500 hover:bg-red-600 hover:text-white rounded-md mx-2 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;