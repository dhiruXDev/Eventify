import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recruitmentService } from '../../services';

const RecruitmentResponses = () => {
    const { id } = useParams();
    const [applications, setApplications] = useState([]);
    const [recruitment, setRecruitment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [recRes, appRes] = await Promise.all([
                    recruitmentService.getRecruitmentById(id),
                    recruitmentService.getRecruitmentApplications(id)
                ]);
                setRecruitment(recRes.data);
                setApplications(appRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="text-center p-12">Loading responses...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Exam Responses: {recruitment?.title}</h1>
                    <p className="text-gray-500">{applications.length} Students Attempted/Participated</p>
                </div>
                <div className="flex gap-4">
                    <Link to={`/recruitment/registrations/${id}`} className="text-blue-600 font-bold hover:underline flex items-center">
                        👥 View Registrations
                    </Link>
                    <Link to="/recruitment/manage" className="text-indigo-600 font-bold hover:underline flex items-center">
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to Manage
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Exam Score</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Date Applied</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {applications.map(app => (
                            <tr key={app._id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3 uppercase">
                                            {app.userName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{app.userName}</div>
                                            <div className="text-[10px] text-gray-500 flex flex-col">
                                                <span>{app.userEmail}</span>
                                                {app.userMobile && <span className="text-indigo-600 font-medium">📱 {app.userMobile}</span>}
                                                <span className="text-gray-400 italic">
                                                    {app.branch || 'N/A'} • {app.year || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${app.status === 'Selected' ? 'bg-green-100 text-green-700' :
                                        app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                            app.status === 'Shortlisted' ? 'bg-indigo-100 text-indigo-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {app.totalMarks !== undefined ? (
                                        <div className="font-bold text-gray-900">{app.totalMarks} <span className="text-xs text-gray-400 font-normal">pts</span></div>
                                    ) : (
                                        <span className="text-gray-400 text-sm">Not Attempted</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {new Date(app.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    {app.status === 'Exam Attempted' && (
                                        <Link 
                                            to={`/recruitment/${id}/evaluate/${app._id}`}
                                            className="text-indigo-600 font-bold text-sm hover:underline"
                                        >
                                            Review Paper
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecruitmentResponses;
