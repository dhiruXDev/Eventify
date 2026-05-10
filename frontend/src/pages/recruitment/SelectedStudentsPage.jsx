import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recruitmentService } from '../../services';

const SelectedStudentsPage = () => {
    const [recruitmentGroups, setRecruitmentGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSelectedStudents = async () => {
            try {
                const res = await recruitmentService.getAllSelectedStudents();
                setRecruitmentGroups(res.data || []);
            } catch (err) {
                console.error('Failed to fetch selected students:', err);
                setError(err.response?.data?.message || err.message || 'Failed to load selected students list.');
            } finally {
                setLoading(false);
            }
        };
        fetchSelectedStudents();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (error) return (
        <div className="p-8 text-center text-red-600 font-bold bg-red-50 rounded-xl border border-red-100">
            {error}
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <span className="p-2 bg-emerald-100 rounded-lg">
                            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </span>
                        Selected Candidates
                    </h1>
                    <p className="mt-2 text-gray-500">View and manage students selected across all recruitment drives.</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">{recruitmentGroups.reduce((acc, g) => acc + g.selectedCount, 0)}</div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Selected</div>
                </div>
            </div>

            {recruitmentGroups.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No students selected yet</h3>
                    <p className="text-gray-500 mt-2 max-w-md mx-auto">Once you finalize candidates in your recruitment drives, they will appear here grouped by recruitment.</p>
                    <Link to="/recruitment/manage" className="mt-6 inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition">
                        Manage Recruitments
                    </Link>
                </div>
            ) : (
                recruitmentGroups.map((group) => (
                    <div key={group.recruitmentId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition hover:shadow-md">
                        <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{group.recruitmentTitle}</h2>
                                <p className="text-sm text-indigo-600 font-medium">{group.clubName}</p>
                            </div>
                            <div className="px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                                {group.selectedCount} Students Selected
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {group.students.map((student) => (
                                    <div key={student.userId} className="group p-4 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all relative overflow-hidden">
                                        {/* Decorative element */}
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full transform translate-x-4 -translate-y-4 transition group-hover:scale-150"></div>
                                        
                                        <div className="flex items-start gap-4">
                                            <div className="relative">
                                                {student.userPhoto ? (
                                                    <img 
                                                        src={student.userPhoto} 
                                                        alt={student.userName} 
                                                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl border-2 border-white shadow-sm uppercase">
                                                        {student.userFirstName?.charAt(0) || student.userName?.charAt(0) || 'U'}
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                                </div>
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <div className="font-bold text-gray-900 truncate">{student.userFirstName} {student.userLastName}</div>
                                                <div className="text-xs text-gray-400 truncate mb-2">{student.userEmail}</div>
                                                
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                                                            {student.selectionDetails?.assignedPosition || 'Member'}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-medium">
                                                        {student.branch} • {student.year}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
                                            <Link 
                                                to={`/recruitment/${group.recruitmentId}/finalize`}
                                                className="text-[10px] font-bold text-indigo-600 hover:underline"
                                            >
                                                Manage Selection
                                            </Link>
                                            <span className="text-[10px] text-gray-400 font-medium italic">
                                                {new Date(student.appliedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default SelectedStudentsPage;
