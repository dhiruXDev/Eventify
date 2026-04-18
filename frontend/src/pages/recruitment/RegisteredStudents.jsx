import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recruitmentService } from '../../services';

const RegisteredStudents = () => {
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
    console.log("Appli", applications, recruitment)
    if (loading) return <div className="text-center p-12">Loading registrations...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Registered Students: {recruitment?.title}</h1>
                    <p className="text-gray-500">{applications.length} Students Registered</p>
                </div>
                <Link to="/recruitment/manage" className="text-indigo-600 font-bold hover:underline flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Manage
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Academic Info</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Contact Details</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Date Applied</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {applications.map(app => (
                            <tr key={app._id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3 uppercase">
                                            {app.userName?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{app.userName}</div>
                                            <div className="text-xs text-blue-500 font-medium tracking-tight whitespace-nowrap overflow-hidden">Candidate ID: {app.userId?.slice(-6)}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900">{app.branch || 'N/A'}</span>
                                        <span className="text-xs text-gray-500">{app.year || 'N/A'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <span className="mr-2">📧</span> {app.userEmail}
                                        </div>
                                        {app.userMobile && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="mr-2">📱</span> {app.userMobile}
                                            </div>
                                        )}
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
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {new Date(app.createdAt || app.appliedAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        {applications.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                    No students registered for this drive yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RegisteredStudents;
