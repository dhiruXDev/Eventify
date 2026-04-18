import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context';
//import logo from '../assets/logo3.jpg';
import logo from '../assets/FooterIcon-re.png';
const GeneralFooter = () => {
    const { isAuthenticated } = useAuth();
    const currentYear = new Date().getFullYear();
    const footerText = `&copy; ${currentYear} Univent. All rights reserved.`;
    const quickLinks = [
        { label: 'Events', to: '/events' },
        { label: 'Leaderboard', to: '/leaderboard' },
        { label: 'Announcements', to: '/announcements' },
    ];
    const accountLinks = [
        { label: 'Profile', to: '/profile' },
        { label: 'Settings', to: '/settings' },
    ];
    const supportLinks = [
        { label: 'Help Center', to: '/help-center' },
        { label: 'Contact Us', to: '/contact-us' },
        { label: 'Privacy Policy', to: '/privacy-policy' },
    ];
    
    return ( 
        <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden overflow-y-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <Link to="/">
                            <img  src={logo} alt="Univent Logo" className="h-15  rounded-full" />
                            </Link>
                            {/* <span className="text-xl font-bold">Eventify</span> */}
                        </div>
                        <p className="text-gray-400">
                            Our platform for college events, competitions, and activities.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link to="/events" className="hover:text-white transition-colors">Events</Link></li>
                            <li><Link to="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link></li>
                            <li><Link to="/announcements" className="hover:text-white transition-colors">Announcements</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Account</h3>
                        <ul className="space-y-2 text-gray-400">
                            {!isAuthenticated ? (
                                <>
                                    <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                                    <li><Link to="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
                                </>
                            ) : (
                                <>
                                    <li><Link to="/profile" className="hover:text-white transition-colors">Profile</Link></li>
                                    <li><Link to="/settings" className="hover:text-white transition-colors">Settings</Link></li>
                                </>
                            )}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Support</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Univent. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
export default GeneralFooter;