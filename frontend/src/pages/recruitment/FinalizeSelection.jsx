import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recruitmentService } from '../../services';

const FinalizeSelection = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cutoff, setCutoff] = useState(0);
    const [selectionData, setSelectionData] = useState({
        selectedUserIds: [],
        venue: '',
        date: '',
        time: '',
        offlineNote: ''
    });

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await recruitmentService.getRecruitmentApplications(id);
                setApplications(res.data);
                
                // Pre-load currently selected users for re-finalization
                const previouslySelected = res.data.filter(a => a.status === 'Selected').map(a => a.userId);
                
                // Load dummy venue dates if a selection exists
                const existingSelection = res.data.find(a => a.status === 'Selected' && a.selectionDetails);
                if (existingSelection && existingSelection.selectionDetails) {
                    setSelectionData(prev => ({
                        ...prev,
                        selectedUserIds: previouslySelected,
                        venue: existingSelection.selectionDetails.venue || '',
                        date: existingSelection.selectionDetails.date ? new Date(existingSelection.selectionDetails.date).toISOString().split('T')[0] : '',
                        time: existingSelection.selectionDetails.time || '',
                    }));
                } else if (previouslySelected.length > 0) {
                     setSelectionData(prev => ({ ...prev, selectedUserIds: previouslySelected }));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, [id]);

    const handleScreening = async () => {
        try {
            await recruitmentService.screenUsers(id, { cutoff });
            alert('Screening successful! Eligible students shortlisted.');
            // Refresh
            const res = await recruitmentService.getRecruitmentApplications(id);
            setApplications(res.data);
        } catch (err) {
            alert('Screening failed');
        }
    };

    const toggleUserSelection = (userId) => {
        const selected = [...selectionData.selectedUserIds];
        const index = selected.indexOf(userId);
        if (index > -1) {
            selected.splice(index, 1);
        } else {
            selected.push(userId);
        }
        setSelectionData({ ...selectionData, selectedUserIds: selected });
    };

    const handleFinalize = async (e) => {
        e.preventDefault();
        if (selectionData.selectedUserIds.length === 0) return alert('Select at least one student');
        try {
            await recruitmentService.finalizeSelection(id, selectionData);
            alert('Selection finalized and emails sent!');
            navigate('/recruitment/manage');
        } catch (err) {
            alert('Finalization failed');
        }
    };

    if (loading) return <div className="text-center p-12">Loading...</div>;

    // Show both Shortlisted AND previously Selected candidates so organizers can modify the final list
    const candidateUsers = applications.filter(a => a.status === 'Shortlisted' || a.status === 'Selected');
    const isReFinalizing = applications.some(a => a.status === 'Selected');

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Finalize Recruitment</h1>
                <p className="text-gray-500">Screen by cutoff and select final candidates</p>
            </div>

            {/* Screening Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Step 1: Automated Screening</h3>
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="text-sm font-semibold text-gray-600 block mb-2">Set Minimum Cutoff Marks</label>
                        <input
                            type="number"
                            value={cutoff}
                            onChange={(e) => setCutoff(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        onClick={handleScreening}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
                    >
                        Run Screening
                    </button>
                </div>
                <p className="mt-4 text-sm text-gray-500 italic">Students scoring above {cutoff} will be automatically moved to "Shortlisted" status and notified.</p>
            </div>

            {/* Final Selection Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-800">Step 2: Final Selection</h3>
                    <p className="text-sm text-gray-500">Choose selected candidates from the shortlisted list</p>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-bold text-gray-700 mb-4">Eligible Candidates ({candidateUsers.length})</h4>
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {candidateUsers.map(user => (
                                    <div
                                        key={user.userId}
                                        className={`p-4 rounded-xl border-2 transition cursor-pointer flex justify-between items-center ${selectionData.selectedUserIds.includes(user.userId)
                                                ? 'border-indigo-600 bg-indigo-50'
                                                : 'border-gray-100 hover:border-indigo-200'
                                            }`}
                                        onClick={() => toggleUserSelection(user.userId)}
                                    >
                                        <div>
                                            <div className="font-bold text-gray-900">{user.userName}</div>
                                            <div className="text-xs text-indigo-600 font-bold">Marks: {user.totalMarks}</div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectionData.selectedUserIds.includes(user.userId)
                                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                                : 'border-gray-300'
                                            }`}>
                                            {selectionData.selectedUserIds.includes(user.userId) && '✓'}
                                        </div>
                                    </div>
                                ))}
                                {candidateUsers.length === 0 && <p className="text-gray-400 text-center py-8">No eligible students found. Run screening first, or ensure you have reviewed papers.</p>}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-gray-700 mb-4">Selection Details (Sent to selected students)</h4>
                            <form onSubmit={handleFinalize} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-600">Interview/Joining Venue</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Club Office, Hall 3"
                                        value={selectionData.venue}
                                        onChange={(e) => setSelectionData({ ...selectionData, venue: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-600">Date</label>
                                        <input
                                            type="date"
                                            value={selectionData.date}
                                            onChange={(e) => setSelectionData({ ...selectionData, date: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-600">Time</label>
                                        <input
                                            type="time"
                                            value={selectionData.time}
                                            onChange={(e) => setSelectionData({ ...selectionData, time: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-sm font-semibold text-gray-600">Custom Email Message (Offline note)</label>
                                    <textarea
                                        placeholder="e.g. Please bring your laptop and ID card..."
                                        value={selectionData.offlineNote}
                                        onChange={(e) => setSelectionData({ ...selectionData, offlineNote: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 min-h-[80px]"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 shadow-lg mt-4 disabled:bg-gray-400"
                                    disabled={selectionData.selectedUserIds.length === 0}
                                >
                                    {isReFinalizing ? `Update ${selectionData.selectedUserIds.length} Selections` : `Finalize ${selectionData.selectedUserIds.length} Selections`}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinalizeSelection;
