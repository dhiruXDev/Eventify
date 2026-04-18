import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { eventService, announcementService, leaderboardService, recruitmentService } from '../services';
import { useAuth } from '../context';
import HomePage1 from '../assets/HomePage1.svg';
import HomePage2 from '../assets/HomePage2.svg';
import bgImage from '../assets/bgImage.png';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import ClubsCarousel from '../components/clubs/ClubsCarousel';
import logo from "../assets/Logo2Img.png"
import defaultUserImage from '../assets/user-default-icon.png';
import User1 from '../assets/User1.avif'
import User2 from '../assets/User2.jpeg'
import User3 from '../assets/User3.jpg'
import User4 from '../assets/User4.jpeg'
import User5 from '../assets/User5.jpeg'
import defaultEventImage from '../assets/Enents.jpg'
import GeneralFooter from './GeneralFooter';

const UIHomePage = () => {
    const { isAuthenticated } = useAuth();

    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [recruitments, setRecruitments] = useState([]);
    const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
    const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);

    const [statsVisible, setStatsVisible] = useState(false);
    const [statsAnimated, setStatsAnimated] = useState(false);
    const [animatedValues, setAnimatedValues] = useState({
        users: 0,
        events: 0,
        colleges: 0,
        satisfaction: 0
    });
    const [allFeedbacks, setAllFeedbacks] = useState([]);
    const [platformRatings, setPlatformRatings] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [topStudents, setTopStudents] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    // Carousel images
    const carouselImages = [HomePage1, HomePage2];

    // Fetch all ratings and feedbacks
    useEffect(() => {
        const fetchAllRatings = async () => {
            try {
                // Fetch platform ratings
                const platformData = await eventService.getPlatformRatings();
                const platformRatingsList = platformData.data || [];
                setPlatformRatings(platformRatingsList);
                setAverageRating(platformData.averageRating || 0);

                // Fetch all events to get their reviews
                const allEventsData = await eventService.getAllEvents();
                const eventsList = Array.isArray(allEventsData) ? allEventsData : allEventsData.data || [];

                // Fetch reviews for all events
                const allReviews = [];
                for (const event of eventsList) {
                    try {
                        const reviewsData = await eventService.getEventReviews(event._id);
                        const reviews = reviewsData.data || [];
                        // Add event context to reviews
                        reviews.forEach(review => {
                            allReviews.push({
                                ...review,
                                type: 'event',
                                eventTitle: event.title
                            });
                        });
                    } catch (err) {
                        console.error(`Failed to fetch reviews for event ${event._id}:`, err);
                    }
                }

                // Combine platform ratings and event reviews
                const combinedFeedbacks = [
                    ...platformRatingsList.map(rating => ({
                        ...rating,
                        type: 'platform',
                        name: rating.userName || 'User',
                        title: rating.userRole ? rating.userRole.charAt(0).toUpperCase() + rating.userRole.slice(1) : 'User',
                        image: (rating.userPhoto && rating.userPhoto !== '/user-default-icon.png' && rating.userPhoto.trim() !== '') ? rating.userPhoto : defaultUserImage,
                        feedbackBy: rating.userName || 'User',
                        message: 'Platform Rating'
                    })),
                    ...allReviews.map(review => ({
                        ...review,
                        type: 'event',
                        name: review.userName || 'User',
                        title: review.userRole ? review.userRole.charAt(0).toUpperCase() + review.userRole.slice(1) : 'User',
                        image: (review.userPhoto && review.userPhoto !== '/user-default-icon.png' && review.userPhoto.trim() !== '') ? review.userPhoto : defaultUserImage,
                        feedbackBy: review.userName || 'User',
                        message: review.eventTitle || 'Event Review'
                    }))
                ];

                // Sort by date (newest first) and limit to recent ones
                combinedFeedbacks.sort((a, b) => {
                    const dateA = new Date(a.createdAt || a.created_at || 0);
                    const dateB = new Date(b.createdAt || b.created_at || 0);
                    return dateB - dateA;
                });

                setAllFeedbacks(combinedFeedbacks.slice(0, 20)); // Show latest 20
            } catch (err) {
                console.error('Failed to fetch ratings:', err);
                // Fallback to empty array
                setAllFeedbacks([]);
            }
        };

        fetchAllRatings();
    }, []);

    // Auto-rotate carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentCarouselIndex((prev) => (prev + 1) % carouselImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [carouselImages.length]);

    // Fetch top performers from server
    useEffect(() => {
        const fetchTopPerformers = async () => {
            try {
                const performers = await leaderboardService.getTopPerformers();
                // Map the data to match the expected structure
                const mappedPerformers = performers.slice(0, 5).map((performer, index) => ({
                    id: performer.userId || index + 1,
                    name: performer.userName || 'Unknown User',
                    college: performer.college || 'Unknown College',
                    club: performer.club || performer.college || 'Unknown Club',
                    score: performer.totalScore || 0,
                    events: performer.eventCount || 0,
                    image: (performer.userPhoto && performer.userPhoto.trim() !== '') ? performer.userPhoto : defaultUserImage,
                    achievements: performer.achievements || [],
                    trophy: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏆'
                }));
                setTopStudents(mappedPerformers);
            } catch (err) {
                console.error('Failed to fetch top performers:', err);
                // Fallback to demo data if API fails
                setTopStudents([
                    {
                        id: 1,
                        name: 'Rajesh Kumar',
                        college: 'SLIET',
                        score: 9850,
                        events: 12,
                        image: User1,
                        trophy: '🥇'
                    },
                    {
                        id: 2,
                        name: 'Priya Sharma',
                        college: 'SLIET',
                        score: 9720,
                        events: 11,
                        image: User2,
                        trophy: '🥈'
                    },
                    {
                        id: 3,
                        name: 'Amit Singh',
                        college: 'SLIET',
                        score: 9650,
                        events: 10,
                        image: User3,
                        trophy: '🥉'
                    },
                    {
                        id: 4,
                        name: 'Sneha Patel',
                        college: 'SLIET',
                        score: 9580,
                        events: 9,
                        image: User4,
                        trophy: '🏆'
                    },
                    {
                        id: 5,
                        name: 'Vikram Mehta',
                        college: 'SLIET',
                        score: 9520,
                        events: 9,
                        image: User5,
                        trophy: '🏆'
                    }
                ]);
            }
        };
        fetchTopPerformers();
    }, []);

    // Auto-rotate students carousel (showing 3 at a time with infinite loop)
    useEffect(() => {
        if (topStudents.length > 0) {
            const interval = setInterval(() => {
                setCurrentStudentIndex((prev) => {
                    const nextIndex = (prev + 1) % topStudents.length;
                    // If we're going from last to first, disable transition temporarily
                    if (nextIndex === 0 && prev === topStudents.length - 1) {
                        setIsTransitioning(false);
                        // Use setTimeout to instantly jump to duplicate start position
                        setTimeout(() => {
                            setIsTransitioning(true);
                        }, 50);
                    } else {
                        setIsTransitioning(true);
                    }
                    return nextIndex;
                });
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [topStudents.length]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch events
                const eventsData = await eventService.getAllEvents();
                let eventsArray = Array.isArray(eventsData) ? eventsData : eventsData.data || [];

                // Filter out sample events
                eventsArray = eventsArray.filter(event => {
                    const title = event.title.toLowerCase();
                    return !title.includes('sample') && !title.includes('test');
                });

                // Sort events by date (upcoming first)
                eventsArray.sort((a, b) => new Date(a.date) - new Date(b.date));

                // Take only the first 6 upcoming events
                const upcomingEventsData = eventsArray
                    .filter(event => new Date(event.date) >= new Date())
                    .slice(0, 6);

                setEvents(upcomingEventsData);

                // Fetch announcements
                try {
                    const announcementsData = await announcementService.getAllAnnouncements({
                        isPublished: true
                    });
                    const announcementsArray = Array.isArray(announcementsData)
                        ? announcementsData
                        : announcementsData.data || [];

                    announcementsArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setAnnouncements(announcementsArray.slice(0, 3));
                } catch (err) {
                    console.error('Failed to fetch announcements:', err);
                }

                // Fetch recruitments
                try {
                    const recruitmentsData = await recruitmentService.getAllRecruitments();
                    const recruitmentList = Array.isArray(recruitmentsData.data) ? recruitmentsData.data : [];
                    setRecruitments(recruitmentList.filter(r => r.status === 'Ongoing').slice(0, 4));
                } catch (err) {
                    console.error('Failed to fetch recruitments:', err);
                }

            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Statistics section scroll detection and animation
    useEffect(() => {
        const statsSection = document.getElementById('stats-section');
        if (!statsSection) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !statsAnimated) {
                        setStatsVisible(true);
                        setStatsAnimated(true);

                        // Animate numbers
                        const targets = { users: 10000, events: 500, colleges: 50, satisfaction: 95 };
                        const duration = 2000; // 2 seconds
                        const steps = 60;
                        const stepDuration = duration / steps;

                        let currentStep = 0;
                        const interval = setInterval(() => {
                            currentStep++;
                            const progress = currentStep / steps;

                            setAnimatedValues({
                                users: Math.floor(targets.users * progress),
                                events: Math.floor(targets.events * progress),
                                colleges: Math.floor(targets.colleges * progress),
                                satisfaction: Math.floor(targets.satisfaction * progress)
                            });

                            if (currentStep >= steps) {
                                clearInterval(interval);
                                setAnimatedValues(targets);
                            }
                        }, stepDuration);
                    }
                });
            },
            { threshold: 0.3 }
        );

        observer.observe(statsSection);
        return () => observer.disconnect();
    }, [statsAnimated]);

    // if (loading) {
    //     return (
    //         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    //             <div className="text-center">
    //                 <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mx-auto mb-4"></div>
    //                 <p className="text-gray-600 text-lg">Loading...</p>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="min-h-screen bg-gray-50">
            <style>{`
                .testimonial-swiper .swiper-pagination-bullet {
                    width: 12px;
                    height: 12px;
                    background: #cbd5e1;
                    opacity: 1;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .testimonial-swiper .swiper-pagination-bullet-active {
                    background: #4f46e5;
                    width: 32px;
                    border-radius: 6px;
                }
                .testimonial-swiper .swiper-pagination {
                    position: relative;
                    margin-top: 2rem;
                }
                
                /* Image Animations */
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                
                @keyframes floatSlow {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    33% { transform: translateY(-15px) translateX(5px); }
                    66% { transform: translateY(-10px) translateX(-5px); }
                }
                
                @keyframes sway {
                    0%, 100% { transform: rotate(-2deg); }
                    50% { transform: rotate(2deg); }
                }
                
                @keyframes drift {
                    0% { transform: translateX(0px); }
                    100% { transform: translateX(100px); }
                }
                
                @keyframes rocketLaunch {
                    0% { transform: translateY(0px); }
                    100% { transform: translateY(-30px); }
                }
                
                @keyframes rotateGear {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @keyframes glow {
                    0%, 100% { opacity: 1; filter: brightness(1); }
                    50% { opacity: 0.8; filter: brightness(1.3); }
                }
                
                @keyframes bounce {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                
                @keyframes wave {
                    0%, 100% { transform: scaleY(1); }
                    50% { transform: scaleY(1.2); }
                }
                
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0px); opacity: 1; }
                }
                
                .animate-rocket-launch {
                    animation: rocketLaunch 3s ease-in-out infinite;
                }
                
                .animate-rotate-gear {
                    animation: rotateGear 10s linear infinite;
                }
                
                .animate-rotate-gear-reverse {
                    animation: rotateGear 15s linear infinite reverse;
                }
                
                .animate-glow {
                    animation: glow 2s ease-in-out infinite;
                }
                
                .animate-bounce {
                    animation: bounce 2s ease-in-out infinite;
                }
                
                .animate-wave {
                    animation: wave 1.5s ease-in-out infinite;
                }
                
                .animate-slide-up {
                    animation: slideUp 1s ease-out;
                }
                
                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @keyframes drawCircle {
                    0%, 100% { 
                        stroke-dashoffset: 0;
                        opacity: 0.6;
                    }
                    50% { 
                        stroke-dashoffset: 20;
                        opacity: 1;
                    }
                }
                
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                
                .animate-slide-in-left {
                    animation: slideInLeft 1s ease-out;
                }
                
                .animate-slide-in-right {
                    animation: slideInRight 1s ease-out;
                }
                
                .animate-fade-in-up {
                    animation: fadeInUp 1s ease-out;
                }
                
                .animate-pulse-slow {
                    animation: pulse 3s ease-in-out infinite;
                }
                
                .animate-rotate-slow {
                    animation: rotate 20s linear infinite;
                }
                
                .hover-lift {
                    transition: transform 0.3s ease;
                }
                
                .hover-lift:hover {
                    transform: translateY(-10px);
                }
            `}</style>
            <Navbar />

            {/* Hero Section with Animated Illustration */}
            <section
                className="pt-20 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-[700px] flex items-center w-full"
                style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: '80% auto',
                    backgroundPosition: 'right center',
                    backgroundRepeat: 'no-repeat',
                    width: '100%'
                }}
            >

                <div className="max-w-7xl mx-auto relative z-10 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 items-center">
                        {/* Left Side - Text Content - Overlay on bg image */}
                        <div className="space-y-6 animate-slide-in-left lg:max-w-[650px]">
                            <div className="inline-block  lg:mt-5">
                                <span className="text-sm font-semibold text-green-600 bg-green-100 px-4 py-1  mt-5 rounded-full">
                                    FAST & EFFICIENT EVENT MANAGEMENT
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight relative">
                                Simplifying{' '}
                                <span className="relative inline-block">
                                    <span className="relative z-10">College Events</span>
                                    <span className="absolute bottom-2 left-0 right-0 h-3 bg-green-200 rounded-full opacity-80 animate-pulse-slow"></span>
                                </span>
                                {', '}Amplifying{' '}
                                <span className="relative inline-block px-2">
                                    <span className="relative z-10">Experiences</span>

                                </span>
                            </h1>
                            <div className="space-y-2">
                                <h2 className="text-3xl md:text-4xl font-bold text-green-600">
                                    PARTICIPATION
                                </h2>
                                <div className="w-32 h-1 bg-green-400 rounded-full"></div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center animate-pulse-slow">
                                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>

                            <p className="text-gray-600 text-lg leading-relaxed max-w-xl">
                                Different times of the year can determine the best events for your growth. For example,
                                participating during tech seasons or cultural festivals can provide unique opportunities
                                due to the diverse range of activities and networking possibilities available.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link
                                    to={!isAuthenticated ? "/register" : "/dashboard"}
                                    className="px-8 py-4 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
                                >
                                    Get Started
                                </Link>
                                <Link
                                    to="/events"
                                    className="px-8 py-4 bg-white text-green-600 border-2 border-green-600 rounded-full font-semibold hover:bg-green-50 transition-all text-center"
                                >
                                    Learn More
                                </Link>
                            </div>

                            <div className="flex items-center space-x-2 text-green-600 pt-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span className="text-sm font-medium">Trusted by 1000+ Students</span>
                            </div>
                        </div>

                    </div>
                </div>
            </section>



            {/* Features Section with Enhanced Content */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 animate-fade-in-up">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Why Choose Eventify?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Experience the future of college event management. Our platform combines cutting-edge technology
                            with user-friendly design to create an unparalleled experience for students, organizers, and administrators.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover-lift animate-slide-in-left">
                            <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
                                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Discover Events</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Explore a comprehensive catalog of college events, competitions, workshops, and activities all in one centralized platform.
                                Filter by category, date, or location to find exactly what interests you. Never miss an opportunity to grow and learn.
                            </p>
                        </div>
                        <div className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover-lift animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow" style={{ animationDelay: '0.5s' }}>
                                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Track Progress</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Monitor your performance with real-time leaderboards, detailed analytics, and personalized insights.
                                See how you rank among peers, track your achievements, and set new goals. Our comprehensive tracking system
                                helps you understand your strengths and areas for improvement.
                            </p>
                        </div>
                        <div className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover-lift animate-slide-in-right">
                            <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow" style={{ animationDelay: '1s' }}>
                                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Connect & Compete</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Join a vibrant, diverse community of students passionate about learning and competing. Network with like-minded individuals,
                                form teams, and participate in collaborative events. Build lasting connections while showcasing your talents and
                                achieving recognition for your accomplishments.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Clubs Carousel Section */}
            <ClubsCarousel />

            {/* Statistics Section */}
            <section
                id="stats-section"
                className={`py-16 px-4 sm:px-6 lg:px-8 text-white transition-all duration-1000 ${statsVisible
                    ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600'
                    : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'
                    }`}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 animate-fade-in-up">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Thousands of Active Users</h2>
                        <p className="text-xl text-white/90">Univent is transforming how students engage with college events</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center animate-slide-in-left">
                            <div className="text-4xl md:text-5xl font-bold mb-2 transition-all duration-300">
                                {animatedValues.users >= 1000 ? `${(animatedValues.users / 1000).toFixed(0)}K+` : `${animatedValues.users}+`}
                            </div>
                            <div className="text-white/80 text-lg">Active Users</div>
                        </div>
                        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <div className="text-4xl md:text-5xl font-bold mb-2 transition-all duration-300">
                                {animatedValues.events}+
                            </div>
                            <div className="text-white/80 text-lg">Events Hosted</div>
                        </div>
                        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <div className="text-4xl md:text-5xl font-bold mb-2 transition-all duration-300">
                                {animatedValues.colleges}+
                            </div>
                            <div className="text-white/80 text-lg">Colleges</div>
                        </div>
                        <div className="text-center animate-slide-in-right">
                            <div className="text-4xl md:text-5xl font-bold mb-2 transition-all duration-300">
                                {animatedValues.satisfaction}%
                            </div>
                            <div className="text-white/80 text-lg">Satisfaction</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Top 5 Students Showcase */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
                        Top Performers
                    </h2>
                    <div className="relative overflow-hidden">
                        <div
                            className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
                            style={{ transform: `translateX(-${(currentStudentIndex + 2) * (100 / 3)}%)` }}
                        >
                            {/* Duplicate students at the beginning for seamless loop */}
                            {topStudents.slice(-2).map((student, idx) => (
                                <div
                                    key={`duplicate-start-${student.id}-${idx}`}
                                    className="min-w-[33.333%] px-4 flex justify-center"
                                >
                                    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full transform hover:scale-105 transition-transform duration-300">
                                        <div className="text-center">
                                            <div className="text-5xl mb-3">{student.trophy}</div>
                                            <div className="mb-3 flex justify-center">
                                                {student.image && student.image !== defaultUserImage && (student.image.startsWith('data:') || student.image.startsWith('http') || student.image.startsWith('/')) ? (
                                                    <img
                                                        src={student.image}
                                                        alt={student.name}
                                                        className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-green-400 shadow-lg"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            const initials = (student.name?.charAt(0) || 'U').toUpperCase();
                                                            e.target.parentElement.innerHTML = `<div class="w-30 h-30 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-green-400 shadow-lg">${initials}</div>`;
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-green-400 shadow-lg">
                                                        {(student.name?.charAt(0) || 'U').toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{student.name}</h3>
                                            <p className="text-gray-600 mb-1 text-sm">{student.college}</p>
                                            {student.club && (
                                                <p className="text-green-600 mb-3 text-sm font-semibold">🏛️ {student.club}</p>
                                            )}
                                            {/* Achievements Tags */}
                                            {student.achievements && student.achievements.length > 0 && (
                                                <div className="flex flex-wrap justify-center gap-2 mb-3">
                                                    {student.achievements.slice(0, 3).map((achievement, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium"
                                                        >
                                                            {achievement}
                                                        </span>
                                                    ))}
                                                    {student.achievements.length > 3 && (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                                            +{student.achievements.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-gray-700 font-medium text-sm">Total Score</span>
                                                    <span className="text-xl font-bold text-green-700">{student.score.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-700 font-medium text-sm">Events</span>
                                                    <span className="text-base font-semibold text-emerald-700">{student.events}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {/* Original students */}
                            {topStudents.map((student) => (
                                <div
                                    key={student.id}
                                    className="min-w-[33.333%] px-4 flex justify-center"
                                >
                                    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full transform hover:scale-105 transition-transform duration-300">
                                        <div className="text-center">
                                            <div className="text-5xl mb-3">{student.trophy}</div>
                                            <div className="mb-3 flex justify-center">
                                                {student.image && student.image !== defaultUserImage && (student.image.startsWith('data:') || student.image.startsWith('http') || student.image.startsWith('/')) ? (
                                                    <img
                                                        src={student.image}
                                                        alt={student.name}
                                                        className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-green-400 shadow-lg"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            const initials = (student.name?.charAt(0) || 'U').toUpperCase();
                                                            e.target.parentElement.innerHTML = `<div class="w-30 h-30 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-green-400 shadow-lg">${initials}</div>`;
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-green-400 shadow-lg">
                                                        {(student.name?.charAt(0) || 'U').toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{student.name}</h3>
                                            <p className="text-gray-600 mb-1 text-sm">{student.college}</p>
                                            {student.club && (
                                                <p className="text-green-600 mb-3 text-sm font-semibold">🏛️ {student.club}</p>
                                            )}
                                            {/* Achievements Tags */}
                                            {student.achievements && student.achievements.length > 0 && (
                                                <div className="flex flex-wrap justify-center gap-2 mb-3">
                                                    {student.achievements.slice(0, 3).map((achievement, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium"
                                                        >
                                                            {achievement}
                                                        </span>
                                                    ))}
                                                    {student.achievements.length > 3 && (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                                            +{student.achievements.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-gray-700 font-medium text-sm">Total Score</span>
                                                    <span className="text-xl font-bold text-green-700">{student.score.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-700 font-medium text-sm">Events</span>
                                                    <span className="text-base font-semibold text-emerald-700">{student.events}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {/* Duplicate students at the end for seamless loop */}
                            {topStudents.slice(0, 2).map((student, idx) => (
                                <div
                                    key={`duplicate-end-${student.id}-${idx}`}
                                    className="min-w-[33.333%] px-4 flex justify-center"
                                >
                                    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full transform hover:scale-105 transition-transform duration-300">
                                        <div className="text-center">
                                            <div className="text-5xl mb-3">{student.trophy}</div>
                                            <div className="mb-3 flex justify-center">
                                                {student.image && student.image !== defaultUserImage && (student.image.startsWith('data:') || student.image.startsWith('http') || student.image.startsWith('/')) ? (
                                                    <img
                                                        src={student.image}
                                                        alt={student.name}
                                                        className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-green-400 shadow-lg"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            const initials = (student.name?.charAt(0) || 'U').toUpperCase();
                                                            e.target.parentElement.innerHTML = `<div class="w-30 h-30 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-green-400 shadow-lg">${initials}</div>`;
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-green-400 shadow-lg">
                                                        {(student.name?.charAt(0) || 'U').toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{student.name}</h3>
                                            <p className="text-gray-600 mb-1 text-sm">{student.college}</p>
                                            {student.club && (
                                                <p className="text-green-600 mb-3 text-sm font-semibold">🏛️ {student.club}</p>
                                            )}
                                            {/* Achievements Tags */}
                                            {student.achievements && student.achievements.length > 0 && (
                                                <div className="flex flex-wrap justify-center gap-2 mb-3">
                                                    {student.achievements.slice(0, 3).map((achievement, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium"
                                                        >
                                                            {achievement}
                                                        </span>
                                                    ))}
                                                    {student.achievements.length > 3 && (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                                            +{student.achievements.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-gray-700 font-medium text-sm">Total Score</span>
                                                    <span className="text-xl font-bold text-green-700">{student.score.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-700 font-medium text-sm">Events</span>
                                                    <span className="text-base font-semibold text-emerald-700">{student.events}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                setIsTransitioning(true);
                                setCurrentStudentIndex((prev) => (prev - 1 + topStudents.length) % topStudents.length);
                            }}
                            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors z-10"
                        >
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => {
                                const nextIndex = (currentStudentIndex + 1) % topStudents.length;
                                // If going from last to first, handle seamless transition
                                if (nextIndex === 0 && currentStudentIndex === topStudents.length - 1) {
                                    setIsTransitioning(false);
                                    setCurrentStudentIndex(nextIndex);
                                    setTimeout(() => {
                                        setIsTransitioning(true);
                                    }, 50);
                                } else {
                                    setIsTransitioning(true);
                                    setCurrentStudentIndex(nextIndex);
                                }
                            }}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors z-10"
                        >
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                        <div className="flex justify-center mt-6 space-x-2">
                            {topStudents.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setIsTransitioning(true);
                                        setCurrentStudentIndex(index);
                                    }}
                                    className={`w-3 h-3 rounded-full transition-all ${index === currentStudentIndex
                                        ? 'bg-green-600 w-8'
                                        : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Upcoming Events Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Upcoming Events</h2>
                        <Link
                            to="/events"
                            className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center"
                        >
                            View All
                            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : events.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.map(event => (
                                <div key={event._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                    <div className="h-48 overflow-hidden group">
                                        <img
                                            src={event.image || defaultEventImage}
                                            alt={event.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 animate-fade-in-up"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = defaultEventImage;
                                            }}
                                        />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                                        <div className="flex items-center text-gray-600 mb-2">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600 mb-4">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>{event.location}</span>
                                        </div>
                                        <Link
                                            to={`/events/${event._id}`}
                                            className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors font-medium"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No upcoming events at the moment. Check back soon!</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Event Calendar Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left side - Text content */}
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Event Calendar</h2>
                            <p className="text-lg text-gray-600 mb-4">
                                Never miss an important event again! Our comprehensive event calendar helps you stay organized and plan ahead.
                                View all upcoming events at a glance, filter by category, and set reminders for events you're interested in.
                            </p>
                            <p className="text-lg text-gray-600 mb-6">
                                The calendar integrates seamlessly with your schedule, allowing you to see event dates, times, and locations
                                in one convenient place. Whether you're a participant looking to join events or an organizer managing multiple
                                activities, our calendar feature makes event planning effortless.
                            </p>
                            <Link
                                to="/events"
                                className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                            >
                                View Full Calendar
                            </Link>
                        </div>

                        {/* Right side - Calendar Widget */}
                        <div className="bg-blue-50 rounded-2xl p-6 shadow-lg">
                            {/* Calendar Icon */}
                            <div className="flex justify-end mb-4">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>

                            {/* Calendar */}
                            <div className="bg-white rounded-lg p-4">
                                {/* Month Navigation */}
                                <div className="flex justify-between items-center mb-4">
                                    <button
                                        onClick={() => {
                                            if (currentMonth === 0) {
                                                setCurrentMonth(11);
                                                setCurrentYear(currentYear - 1);
                                            } else {
                                                setCurrentMonth(currentMonth - 1);
                                            }
                                        }}
                                        className="text-gray-700 hover:text-purple-600"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </h3>
                                    <button
                                        onClick={() => {
                                            if (currentMonth === 11) {
                                                setCurrentMonth(0);
                                                setCurrentYear(currentYear + 1);
                                            } else {
                                                setCurrentMonth(currentMonth + 1);
                                            }
                                        }}
                                        className="text-gray-700 hover:text-purple-600"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="text-center text-sm font-bold text-gray-700 py-1">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-1">
                                    {(() => {
                                        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
                                        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                                        const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
                                        const calendarDays = [];

                                        // Previous month's trailing days
                                        for (let i = firstDay - 1; i >= 0; i--) {
                                            calendarDays.push({
                                                day: daysInPrevMonth - i,
                                                isCurrentMonth: false,
                                                isToday: false,
                                                hasEvent: false
                                            });
                                        }

                                        // Current month's days
                                        const today = new Date();
                                        for (let day = 1; day <= daysInMonth; day++) {
                                            const date = new Date(currentYear, currentMonth, day);
                                            const isToday = date.toDateString() === today.toDateString();
                                            // Check if any event is on this date
                                            const eventOnDate = events.find(event => {
                                                const eventDate = new Date(event.date);
                                                return eventDate.getDate() === day &&
                                                    eventDate.getMonth() === currentMonth &&
                                                    eventDate.getFullYear() === currentYear;
                                            });

                                            calendarDays.push({
                                                day,
                                                isCurrentMonth: true,
                                                isToday,
                                                hasEvent: !!eventOnDate,
                                                event: eventOnDate
                                            });
                                        }

                                        // Next month's leading days
                                        const totalCells = 42; // 6 rows * 7 days
                                        const remainingCells = totalCells - calendarDays.length;
                                        for (let day = 1; day <= remainingCells; day++) {
                                            calendarDays.push({
                                                day,
                                                isCurrentMonth: false,
                                                isToday: false,
                                                hasEvent: false
                                            });
                                        }

                                        return calendarDays.map((item, index) => (
                                            <div
                                                key={index}
                                                className={`relative text-center py-2 rounded ${!item.isCurrentMonth
                                                    ? 'text-gray-300'
                                                    : item.isToday
                                                        ? 'bg-purple-100 font-bold'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                    } ${item.hasEvent ? 'cursor-pointer' : ''}`}
                                            >
                                                {item.hasEvent ? (
                                                    <>
                                                        <div className="w-8 h-8 mx-auto rounded-full border-2 border-purple-600 flex items-center justify-center font-semibold text-purple-600">
                                                            {item.day}
                                                        </div>
                                                        {item.event && (
                                                            <div className="mt-1 text-xs text-gray-600 text-left px-1">
                                                                <div className="truncate font-semibold">{item.event.title}</div>
                                                                <div className="text-gray-500 truncate">{item.event.location}</div>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span>{item.day}</span>
                                                )}
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Announcements Section */}
            {announcements.length > 0 && (
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Latest Announcements</h2>
                            <Link
                                to="/announcements"
                                className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center"
                            >
                                View All
                                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {announcements.map(announcement => (
                                <div key={announcement._id} className="bg-gray-50 rounded-lg p-6 border-l-4 border-indigo-500">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{announcement.title}</h3>
                                    <p className="text-gray-600 mb-3 line-clamp-3">{announcement.content}</p>
                                    <span className="text-sm text-gray-500">
                                        {new Date(announcement.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Rating and Feedback Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                            What Our Users Say
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Hear from our satisfied users who have experienced the convenience and excellence of our platform.
                        </p>
                        <div className="flex justify-center items-center space-x-2">
                            <span className="text-3xl font-bold text-gray-900">
                                {averageRating > 0 ? averageRating.toFixed(1) : '5.0'}
                            </span>
                            <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className={`w-6 h-6 ${i < Math.round(averageRating || 5) ? 'text-yellow-400' : 'text-gray-300'}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="text-gray-500 text-sm">
                                ({allFeedbacks.length} {allFeedbacks.length === 1 ? 'review' : 'reviews'})
                            </span>
                        </div>
                    </div>

                    {/* Swiper Carousel */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative">
                        <Swiper
                            modules={[Pagination, Autoplay]}
                            spaceBetween={50}
                            slidesPerView={1}
                            pagination={{
                                clickable: true,
                            }}
                            autoplay={{
                                delay: 5000,
                                disableOnInteraction: false,
                            }}
                            loop={true}
                            className="testimonial-swiper"
                        >
                            {allFeedbacks.length > 0 ? (
                                allFeedbacks.map((feedback) => (
                                    <SwiperSlide key={feedback._id || feedback.id || Math.random()}>
                                        <div className="text-center">
                                            {/* Avatar */}
                                            <div className="mb-6 flex justify-center">
                                                <div className="w-40 h-40 rounded-full   overflow-hidden border-4 border-gray-100   flex items-center justify-center">
                                                    {feedback.image && (feedback.image.startsWith('data:') || feedback.image.startsWith('http') || feedback.image.startsWith('/')) ? (
                                                        <img
                                                            src={feedback.image}
                                                            alt={feedback.name || feedback.userName || 'User'}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                // If image fails to load, try default image, then show initials
                                                                if (e.target.src !== defaultUserImage) {
                                                                    e.target.src = defaultUserImage;
                                                                    e.target.onerror = () => {
                                                                        e.target.style.display = 'none';
                                                                        const userName = feedback.name || feedback.userName || 'User';
                                                                        e.target.parentElement.innerHTML = `<span class="text-white text-2xl font-bold">${userName.charAt(0).toUpperCase()}</span>`;
                                                                    };
                                                                } else {
                                                                    e.target.style.display = 'none';
                                                                    const userName = feedback.name || feedback.userName || 'User';
                                                                    e.target.parentElement.innerHTML = `<span class="text-white text-2xl font-bold">${userName.charAt(0).toUpperCase()}</span>`;
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <img
                                                            src={defaultUserImage}
                                                            alt={feedback.name || feedback.userName || 'User'}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                // If default image fails, show initials
                                                                e.target.style.display = 'none';
                                                                const userName = feedback.name || feedback.userName || 'User';
                                                                e.target.parentElement.innerHTML = `<span class="text-white text-2xl font-bold">${userName.charAt(0).toUpperCase()}</span>`;
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Rating Stars */}
                                            <div className="flex justify-center items-center space-x-1 mb-4">
                                                {[...Array(5)].map((_, i) => (
                                                    <svg
                                                        key={i}
                                                        className={`w-5 h-5 ${i < (feedback.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>

                                            {/* Quote */}
                                            <p className="text-gray-700 italic text-lg md:text-xl mb-6 leading-relaxed">
                                                "{feedback.comment || feedback.feedback || 'No comment provided'}"
                                            </p>

                                            {/* User Details */}
                                            <div className="space-y-2">
                                                <h3 className="font-bold text-gray-900 text-xl">
                                                    {feedback.name || feedback.userName || 'User'}
                                                </h3>
                                                <p className="text-gray-600 capitalize">
                                                    {feedback.title || (feedback.userRole ? feedback.userRole.charAt(0).toUpperCase() + feedback.userRole.slice(1) : 'User')}
                                                    {feedback.type === 'event' && feedback.eventTitle && (
                                                        <span className="text-sm text-gray-500"> • {feedback.eventTitle}</span>
                                                    )}
                                                </p>
                                                {feedback.type === 'platform' && (
                                                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                        Platform Rating
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))
                            ) : (
                                <SwiperSlide>
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 text-lg">No ratings and reviews yet. Be the first to share your feedback!</p>
                                    </div>
                                </SwiperSlide>
                            )}
                        </Swiper>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {/* {!isAuthenticated && (
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Ready to Get Started?
                        </h2>
                        <p className="text-xl text-indigo-100 mb-8">
                            Join thousands of students participating in exciting events and competitions.
                        </p>
                        <Link
                            to="/register"
                            className="inline-block px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            Create Your Account
                        </Link>
                    </div>
                </section>
            )} */}

            {/* Recruitment Drives Section */}
            {recruitments.length > 0 && (
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-50 -ml-48 -mb-48"></div>

                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                            <div className="max-w-2xl">
                                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                    Join Our <span className="text-green-600">Team</span>
                                </h2>
                                <p className="text-xl text-gray-600">
                                    Exciting opportunities await! Apply to your favorite clubs and take your skills to the next level.
                                </p>
                            </div>
                            <Link
                                to="/recruitment/all"
                                className="px-6 py-3 bg-green-50 text-green-700 rounded-xl font-bold hover:bg-green-100 transition-all flex items-center group"
                            >
                                View All Drives
                                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {recruitments.map((drive) => (
                                <Link
                                    to={`/recruitment/${drive._id}`}
                                    key={drive._id}
                                    className="group bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-2xl hover:border-green-200 transition-all duration-500 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4">
                                        <span className="flex h-3 w-3 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                        </span>
                                    </div>

                                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-green-600 transition-all duration-500">
                                        <svg className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                        </svg>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-green-600 transition-colors">
                                        {drive.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                                        {drive.description || `Join ${drive.clubName} as a ${drive.role}!`}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{drive.role}</span>
                                        <span className="text-sm font-bold text-green-600 group-hover:underline">Apply Now →</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <GeneralFooter />

        </div>
    );
};

export default UIHomePage;  