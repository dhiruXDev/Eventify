import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recruitmentService } from '../../services';
import { useAuth } from '../../context';

const RecruitmentDetailPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [recruitment, setRecruitment] = useState(null);
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [mobile, setMobile] = useState('');
    const [branch, setBranch] = useState('');
    const [year, setYear] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [recRes, appRes] = await Promise.all([
                    recruitmentService.getRecruitmentById(id),
                    recruitmentService.getMyApplication(id)
                ]);
                setRecruitment(recRes.data);
                setApplication(appRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);
    
console.log("User",user);

    const handleApply = async () => {
        if (!user) return alert('Please login to apply');
        console.log("User",user);
        if (!mobile || !branch || !year) return alert('Please provide all details (Mobile, Branch, and Year)');
        setApplying(true);
        try {
            const res = await recruitmentService.apply(id, {
                status: 'Applied',
                name: user.name,
                email: user.email,
                college: user.college,
                mobile,
                branch,
                year
            });
            setApplication(res.data);
            alert('Applied successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to apply');
        } finally {
            setApplying(false);
        }
    };

    if (loading) return <div className="text-center p-12 text-indigo-600 font-bold">Loading recruitment details...</div>;
    if (!recruitment) return <div className="text-center p-12 text-red-500 font-bold">Recruitment not found</div>;

    const isDeadlinePassed = new Date(recruitment.deadline) < new Date();
    const isClosed = recruitment.status === 'Completed';

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-10 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /><path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" /></svg>
                    </div>

                    <div className="relative z-10">
                        <Link to="/" className="text-indigo-200 text-sm font-bold hover:text-white mb-6 inline-block transition">← Back to Home</Link>
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="bg-white/20 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/30 backdrop-blur-sm">Driven by {recruitment.clubName}</span>
                                <h1 className="text-4xl font-black mt-4 mb-2">{recruitment.title}</h1>
                                <p className="text-indigo-100 text-lg">Looking for talented <span className="text-white font-bold">{recruitment.role}s</span></p>
                            </div>
                            <div className="bg-white text-indigo-600 p-4 rounded-2xl shadow-lg text-center min-w-[100px]">
                                <div className="text-3xl font-black">{new Date(recruitment.date).getDate()}</div>
                                <div className="text-xs font-bold uppercase">{new Date(recruitment.date).toLocaleString('default', { month: 'short' })}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 border-b-2 border-indigo-100 pb-2 mb-4">About the Role</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{recruitment.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Mode</span>
                                <span className="text-lg font-bold text-gray-800">{recruitment.mode === 'Online' ? '🖥 Online Exam' : '🏛 Offline Interview'}</span>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Venue</span>
                                <span className="text-lg font-bold text-gray-800">{recruitment.mode === 'Online' ? 'Portal' : (recruitment.venue || 'TBA')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                            <h4 className="font-bold text-indigo-900 mb-4">Deadlines</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white border border-indigo-200 flex items-center justify-center text-indigo-600">
                                        ⏱
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter leading-none">Registration Ends</p>
                                        <p className="text-sm font-bold text-indigo-900">{new Date(recruitment.deadline).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white border border-indigo-200 flex items-center justify-center text-indigo-600">
                                        📅
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter leading-none">Drive Date</p>
                                        <p className="text-sm font-bold text-indigo-900">{new Date(recruitment.date).toLocaleDateString()} at {recruitment.time}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                {application ? (
                                    <div className="text-center space-y-4">
                                        <div className="bg-green-500 text-white p-4 rounded-2xl font-bold shadow-md">
                                            ✓ Applied Successfully
                                        </div>
                                        <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">Status: {application.status}</p>
                                        {application.status === 'Shortlisted' && (
                                            <p className="text-xs text-indigo-500">Wait for final selection email!</p>
                                        )}
                                        {recruitment.mode === 'Online' && application.status === 'Applied' && (
                                            <Link to={`/recruitment/attempt-exam/${id}`} className="block w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg">
                                                📝 Launch Exam
                                            </Link>
                                        )}
                                    </div>
                                ) : (isDeadlinePassed || isClosed) ? (
                                    <div className="bg-gray-200 text-gray-500 p-4 rounded-2xl font-bold text-center">
                                        Registrations Closed
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-indigo-900 uppercase">Branch</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. CSE, ECE"
                                                    value={branch}
                                                    onChange={(e) => setBranch(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 outline-none focus:border-indigo-500 transition-colors"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-indigo-900 uppercase">Year</label>
                                                <select
                                                    value={year}
                                                    onChange={(e) => setYear(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 outline-none focus:border-indigo-500 transition-colors bg-white"
                                                    required
                                                >
                                                    <option value="">Select Year</option>
                                                    <option value="1st Year">1st Year</option>
                                                    <option value="2nd Year">2nd Year</option>
                                                    <option value="3rd Year">3rd Year</option>
                                                    <option value="4th Year">4th Year</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-indigo-900 uppercase">Your Mobile Number</label>
                                            <input
                                                type="tel"
                                                placeholder="e.g. +91 9876543210"
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 outline-none focus:border-indigo-500 transition-colors"
                                                required
                                            />
                                        </div>
                                        <button
                                            onClick={handleApply}
                                            disabled={applying}
                                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:bg-gray-400"
                                        >
                                            {applying ? 'Applying...' : 'Apply Now ✨'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl text-center">
                            <p className="text-xs text-gray-400 font-bold uppercase mb-2">Need Help?</p>
                            <p className="text-sm text-gray-600">Contact the club organizer for any queries regarding this recruitment.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruitmentDetailPage;
