import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { recruitmentService, clubService } from '../../services';
import { useAuth } from '../../context';

const CreateRecruitment = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const [loading, setLoading] = useState(false);
    const [clubs, setClubs] = useState([]);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        clubId: '',
        clubName: '',
        title: '',
        role: 'Member',
        description: '',
        mode: 'Online',
        deadline: '',
        date: '',
        time: '',
        venue: ''
    });

    useEffect(() => {
        const fetchUserClub = async () => {
            try {
                // Get the club associated with this organizer
                const response = await clubService.getClubByOrganizer(user.id);

                if (response.data) {
                    const club = response.data;
                    setClubs([club]);
                    setFormData(prev => ({
                        ...prev,
                        clubId: club._id,
                        clubName: club.name
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch club for organizer', err);
                // Fallback: try getting all clubs if specific fetch fails
                try {
                    const data = await clubService.getAllClubs();
                    const userClubs = (data.data || []).filter(c => c.createdBy === user.id);
                    setClubs(userClubs);
                    if (userClubs.length > 0) {
                        setFormData(prev => ({
                            ...prev,
                            clubId: userClubs[0]._id,
                            clubName: userClubs[0].name
                        }));
                    }
                } catch (allErr) {
                    setError('You must be an organizer of a club to create a recruitment.');
                }
            }
        };
        

        const fetchRecruitmentData = async () => {
            try {
                const res = await recruitmentService.getRecruitmentById(id);
                if (res.data) {
                    const recruit = res.data;
                    setFormData({
                        clubId: recruit.clubId,
                        clubName: recruit.clubName,
                        title: recruit.title,
                        role: recruit.role,
                        description: recruit.description,
                        mode: recruit.mode,
                        deadline: recruit.deadline ? new Date(recruit.deadline).toISOString().split('T')[0] : '',
                        date: recruit.date ? new Date(recruit.date).toISOString().split('T')[0] : '',
                        time: recruit.time,
                        venue: recruit.venue || ''
                    });
                }
            } catch (err) {
                console.error('Failed to fetch recruitment data', err);
                setError('Failed to load recruitment details for editing.');
            }
        };

        if (user && user.id) {
            if (isEditMode) {
                fetchRecruitmentData();
            } else {
                fetchUserClub();
            }
        }
    }, [user, id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'clubId') {
            const selectedClub = clubs.find(c => c._id === value);
            setFormData({ ...formData, clubId: value, clubName: selectedClub?.name || '' });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (isEditMode) {
                await recruitmentService.updateRecruitment(id, formData);
            } else {
                await recruitmentService.createRecruitment(formData);
            }
            navigate('/recruitment/manage');
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} recruitment`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                    <h2 className="text-3xl font-bold text-white">{isEditMode ? 'Edit Recruitment Event' : 'Create Recruitment Event'}</h2>
                    <p className="text-indigo-100 mt-2">{isEditMode ? 'Update details for your recruitment drive' : 'Find the best talent for your club'}</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                            {error}
                        </div>
                    )}

                    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Club Name</label>
                            <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-bold flex items-center">
                                <span className="mr-2">🏛</span>
                                {formData.clubName || 'Loading club...'}
                            </div>
                            <input type="hidden" name="clubId" value={formData.clubId} />
                        </div>

                        
                    </div> */}

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Club Name
                        </label>

                        <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white shadow-sm">

                            {/* Club Logo */}
                            <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                                {clubs[0]?.logo ? (
                                    <img
                                        src={clubs[0]?.logo}
                                        alt={clubs[0]?.name}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <span className="text-2xl">🏛</span>
                                )}
                            </div>

                            {/* Club Info */}
                            <div className="flex-1">
                                <h2 className="text-lg font-bold text-gray-800 leading-tight">
                                    {formData.clubName || 'Loading club...'}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Recruitment will be conducted under this club
                                </p>
                            </div>
                        </div>

                        {/* Hidden clubId */}
                        <input type="hidden" name="clubId" value={formData.clubId} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none bg-gray-50"
                        >
                            <option value="Organizer">Organizer</option>
                            <option value="Coordinator">Coordinator</option>
                            <option value="Co-coordinator">Co-coordinator</option>
                            <option value="Member">Member</option>

                        </select>
                    </div>


                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Recruitment Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Annual Core Committee Recruitment 2024"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Mention requirements, process details, etc."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none"
                            required
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Mode</label>
                            <div className="flex gap-4 p-1 bg-gray-100 rounded-xl">
                                {['Online', 'Offline'].map(m => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, mode: m })}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.mode === m
                                            ? 'bg-white text-indigo-600 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {m === 'Online' ? '🖥 Online' : '🏫 Offline'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Registration Deadline</label>
                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Drive Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Drive Time</label>
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Venue / Link</label>
                            <input
                                type="text"
                                name="venue"
                                value={formData.venue}
                                onChange={handleChange}
                                placeholder={formData.mode === 'Online' ? 'Meeting Link (Optional)' : 'Room No., Building'}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                required={formData.mode === 'Offline'}
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all active:scale-95 ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-indigo-200'
                                }`}
                        >
                            {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Recruitment' : 'Launch Recruitment')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRecruitment;
