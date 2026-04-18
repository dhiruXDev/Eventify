import React from 'react';
import Navbar from '../components/layout/Navbar';
import { Footer } from '../components/layout';
import Aboutpage1 from '../assets/Aboutpage1.jpeg';
import Aboutpage2 from '../assets/Aboutpage2.jpg';
import Aboutpage3 from '../assets/Aboutpage3.jpg';
import Aboutpage4 from '../assets/Aboutpage4.jpg';
import GeneralFooter from './GeneralFooter';

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            {/* Hero Section */}
            <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 b">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        About SLIET Eventify
                    </h1>
                    <p className="text-xl text-gray-800 max-w-3xl mx-auto">
                        Empowering students to discover, participate, and excel in college events and competitions.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
                            <p className="text-lg text-gray-600 mb-4">
                                At Univent, we believe that every student deserves the opportunity to discover their potential through engaging events and competitions. Our platform bridges the gap between students and exciting opportunities, making it easier than ever to participate in college activities.
                            </p>
                            <p className="text-lg text-gray-600 mb-4">
                                We are committed to creating a vibrant community where students can showcase their talents, learn new skills, and build lasting connections with peers who share similar interests.
                            </p>
                            <p className="text-lg text-gray-600">
                                Our mission is to transform how students engage with college events, making participation seamless, rewarding, and accessible to everyone.
                            </p>
                        </div>
                        <div className="rounded-lg overflow-hidden shadow-xl">
                            <img 
                                src={Aboutpage1} 
                                alt="Our Mission" 
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 lg:order-1 rounded-lg overflow-hidden shadow-xl">
                            <img 
                                src={Aboutpage2} 
                                alt="Our Vision " 
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <div className="order-1 lg:order-2">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Vision</h2>
                            <p className="text-lg text-gray-600 mb-4">
                                We envision a future where every college event is easily discoverable, participation is effortless, and achievements are celebrated. Univent aims to be the leading platform that connects students with meaningful opportunities.
                            </p>
                            <p className="text-lg text-gray-600 mb-4">
                                Through innovative technology and a student-centric approach, we're building a platform that not only facilitates event participation but also tracks progress, recognizes achievements, and fosters a sense of community.
                            </p>
                            <p className="text-lg text-gray-600">
                                Our vision extends beyond just event management - we're creating an ecosystem that nurtures talent, encourages growth, and celebrates every milestone in a student's journey.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Our Core Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-50 rounded-lg p-8">
                            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Inclusivity</h3>
                            <p className="text-gray-600">
                                We believe that every student, regardless of their background or experience level, should have equal access to opportunities and resources.
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-8">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovation</h3>
                            <p className="text-gray-600">
                                We continuously strive to improve our platform with cutting-edge technology and user-friendly features that enhance the student experience.
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-8">
                            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Excellence</h3>
                            <p className="text-gray-600">
                                We are committed to maintaining the highest standards in everything we do, from platform reliability to user support.
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-8">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Community</h3>
                            <p className="text-gray-600">
                                We foster a supportive community where students can connect, collaborate, and grow together through shared experiences.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Image Gallery Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Our Journey</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="rounded-lg overflow-hidden shadow-xl">
                            <img 
                                src={Aboutpage3} 
                                alt="Our Journey" 
                                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <div className="rounded-lg overflow-hidden shadow-xl">
                            <img 
                                src={Aboutpage4} 
                                alt="Our Community" 
                                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    </div>
                    <div className="mt-8 text-center">
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Since our inception, Univent has been dedicated to creating a platform that truly serves the student community. 
                            We've grown from a simple idea to a comprehensive event management system that connects thousands of students 
                            with exciting opportunities every day.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {/* <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Join Us on This Journey
                    </h2>
                    <p className="text-xl text-indigo-100 mb-8">
                        Be part of a growing community of students who are discovering their potential through Univent.
                    </p>
                    <a
                        href="/register"
                        className="inline-block px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        Get Started Today
                    </a>
                </div>
            </section> */}

            <GeneralFooter />
        </div>
    );
};

export default AboutPage;

