import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recruitmentService } from '../../services';
import { useAuth } from '../../context';

const ManageRecruitment = () => {
    const { user } = useAuth();
    const [recruitments, setRecruitments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRecruitments = async () => {
        setLoading(true);
        try {
            const data = await recruitmentService.getAllRecruitments();
            // Filter by organizer
            const filtered = (data.data || []).filter(r => r.createdBy === user.id);
            setRecruitments(filtered);
        } catch (err) {
            console.error('Failed to fetch recruitments', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecruitments();
    }, [user]);

    const handleCloseDeadline = async (id) => {
        if (window.confirm('Are you sure you want to end registrations for this recruitment?')) {
            try {
                await recruitmentService.closeRecruitment(id);
                fetchRecruitments();
            } catch (err) {
                alert('Failed to close recruitment');
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manage Recruitments</h1>
                    <p className="text-gray-500">Track and manage your club hiring process</p>
                </div>
                <Link
                    to="/recruitment/create"
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition"
                >
                    + New Recruitment
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
            ) : recruitments.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">No recruitment events yet</h3>
                    <p className="text-gray-500 mt-2 mb-6">Start your first recruitment drive today!</p>
                    <Link to="/recruitment/create" className="text-indigo-600 font-bold hover:underline">Create Now</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {recruitments.map(rec => (
                        <div key={rec._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-center hover:shadow-md transition">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-gray-800">{rec.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${rec.status === 'Ongoing' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {rec.status}
                                    </span>
                                </div>
                                <p className="text-indigo-600 font-semibold mb-2">{rec.clubName} • {rec.role}</p>
                                <div className="flex gap-4 text-sm text-gray-500">
                                    <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>{new Date(rec.date).toLocaleDateString()}</span>
                                    <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>{rec.time}</span>
                                    <span className="flex items-center font-bold text-gray-700">{rec.mode === 'Online' ? '🖥 Online' : `🏫 ${rec.venue}`}</span>
                                </div>
                            </div>

                            <div className="mt-4 md:mt-0 flex gap-3 flex-wrap">
                                <Link to={`/recruitment/edit/${rec._id}`} className="px-4 py-2 bg-amber-50 text-amber-600 rounded-lg font-bold hover:bg-amber-100 transition whitespace-nowrap">
                                    ✏️ Edit Details
                                </Link>
                                {rec.mode === 'Online' && (
                                    <>
                                        <Link to={`/recruitment/exam/${rec._id}`} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-bold hover:bg-indigo-100 transition whitespace-nowrap">
                                            📝 Manage Exam
                                        </Link>
                                        <Link to={`/recruitment/responses/${rec._id}`} className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg font-bold hover:bg-purple-100 transition whitespace-nowrap">
                                            📊 Exam Responses
                                        </Link>
                                    </>
                                )}
                                <Link to={`/recruitment/registrations/${rec._id}`} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition whitespace-nowrap">
                                    👥 Registered Students
                                </Link>
                                <Link to={`/recruitment/finalize/${rec._id}`} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg font-bold hover:bg-emerald-100 transition whitespace-nowrap">
                                    ✅ Finalize
                                </Link>
                                {rec.status === 'Ongoing' && (
                                    <button
                                        onClick={() => handleCloseDeadline(rec._id)}
                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 transition whitespace-nowrap"
                                    >
                                        🚫 End Registration
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageRecruitment;
