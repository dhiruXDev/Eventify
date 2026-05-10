import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recruitmentService } from '../../services';

const ManageExam = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [exam, setExam] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: 30,
        totalMarks: 0,
        cutoffMarks: 0,
        targetAudience: ['Applied'],
        questions: []
    });

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const response = await recruitmentService.getExam(id);
                if (response.success && response.data) {
                    const examData = response.data;
                    // Format date to YYYY-MM-DD for input
                    if (examData.date) {
                        examData.date = new Date(examData.date).toISOString().split('T')[0];
                    }
                    setExam(examData);
                }
            } catch (err) {
                console.log('No existing exam found or error fetching' ,err);
            } finally {
                setLoading(false);
            }
        };
        fetchExam();
    }, [id]);

    const addQuestion = () => {
        setExam({
            ...exam,
            questions: [...exam.questions, { text: '', type: 'MCQ', options: ['', '', '', ''], correctAnswer: '', marks: 1, wordLimit: 500 }]
        });
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...exam.questions];
        newQuestions[index][field] = value;
        setExam({ ...exam, questions: newQuestions });
    };

    const updateOption = (qIndex, oIndex, value) => {
        const newQuestions = [...exam.questions];
        newQuestions[qIndex].options[oIndex] = value;
        setExam({ ...exam, questions: newQuestions });
    };

    const handleRelease = async () => {
        try {
            const res = await recruitmentService.releaseExam(id, { targetAudience: exam.targetAudience });
            setExam({ ...exam, isReleased: res.data.isReleased, targetAudience: res.data.targetAudience || exam.targetAudience });
            alert(res.message);
        } catch (err) {
            alert('Failed to release exam');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const totalMarks = exam.questions.reduce((sum, q) => sum + parseInt(q.marks), 0);
            await recruitmentService.setupExam(id, { ...exam, totalMarks });
            alert('Exam setup successfully!');
            navigate('/recruitment/manage');
        } catch (err) {
            alert('Failed to save exam');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
            return;
        }
        try {
            await recruitmentService.deleteExam(id);
            alert('Exam deleted successfully!');
            navigate('/recruitment/manage');
        } catch (err) {
            alert('Failed to delete exam');
        }
    };

    if (loading) return <div className="text-center p-10">Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Set Up Online Exam</h2>
                    {exam._id && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-100 transition flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            Delete Exam
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input
                            type="text"
                            placeholder="Exam Title"
                            value={exam.title}
                            onChange={(e) => setExam({ ...exam, title: e.target.value })}
                            className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Duration (minutes)"
                            value={exam.duration}
                            onChange={(e) => setExam({ ...exam, duration: e.target.value })}
                            className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                        <div className="flex flex-col">
                            <label htmlFor="exam-date">Exam Date</label>
                        <input
                            type="date"
                            value={exam.date}
                            onChange={(e) => setExam({ ...exam, date: e.target.value })}
                            className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="exam-time">Exam Time</label>
                            <input
                            type="time"
                            value={exam.time}
                            onChange={(e) => setExam({ ...exam, time: e.target.value })}
                            className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />

                        </div>
                        

                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">Questions ({exam.questions.length})</h3>
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-bold hover:bg-indigo-100 transition"
                            >
                                + Add Question
                            </button>
                        </div>

                        {exam.questions.map((q, qIndex) => (
                            <div key={qIndex} className="p-6 bg-gray-50 rounded-2xl space-y-4 relative border border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setExam({ ...exam, questions: exam.questions.filter((_, i) => i !== qIndex) })}
                                    className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>

                                <div className="flex gap-4">
                                    <select
                                        value={q.type}
                                        onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                                        className="w-1/3 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="MCQ">MCQ</option>
                                        <option value="Objective">Objective</option>
                                        <option value="Paragraph">Paragraph (Subjective)</option>
                                    </select>
                                    <textarea
                                        placeholder="Question text"
                                        value={q.text}
                                        onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    ></textarea>
                                </div>

                                {q.type !== 'Paragraph' ? (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.options.map((opt, oIndex) => (
                                                <div key={oIndex} className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder={`Option ${oIndex + 1}`}
                                                        value={opt}
                                                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                        required
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <select
                                                value={q.correctAnswer}
                                                onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                                                className="px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                required
                                            >
                                                <option value="">Select Correct Answer</option>
                                                {q.options.map((opt, oIndex) => opt && (
                                                    <option key={oIndex} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                placeholder="Marks"
                                                value={q.marks}
                                                onChange={(e) => updateQuestion(qIndex, 'marks', e.target.value)}
                                                className="px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Word Limit</label>
                                            <input
                                                type="number"
                                                placeholder="Max words (e.g. 500)"
                                                value={q.wordLimit || 500}
                                                onChange={(e) => updateQuestion(qIndex, 'wordLimit', e.target.value)}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Max Marks</label>
                                            <input
                                                type="number"
                                                placeholder="Marks"
                                                value={q.marks}
                                                onChange={(e) => updateQuestion(qIndex, 'marks', e.target.value)}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-indigo-900">Release Target Group</h4>
                            <p className="text-sm text-indigo-700">Select which applicants can access this exam when released. Hold Ctrl/Cmd to select multiple.</p>
                        </div>
                        <select
                            multiple
                            value={exam.targetAudience || ['Applied']}
                            onChange={(e) => {
                                const options = Array.from(e.target.selectedOptions, option => option.value);
                                setExam({ ...exam, targetAudience: options });
                            }}
                            className="px-4 py-2 rounded-xl border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500 h-24 bg-white min-w-[250px]"
                        >
                            <option value="Applied">All Applied (Round 1)</option>
                            <option value="Shortlisted">Shortlisted Candidates (Round 2+)</option>
                            <option value="Exam Attempted">Already Attempted (Retake)</option>
                        </select>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                const link = `${window.location.origin}/recruitment/attempt-exam/${id}`;
                                navigator.clipboard.writeText(link);
                                alert('Exam link copied to clipboard!');
                            }}
                            className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-200"
                        >
                            🔗 Copy Exam Link
                        </button>
                        <button
                            type="button"
                            onClick={handleRelease}
                            className={`flex-1 py-4 rounded-xl font-bold text-lg transition-colors ${exam.isReleased
                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                }`}
                        >
                            {exam.isReleased ? '🚫 Retract Paper' : '🚀 Release Paper'}
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg disabled:bg-gray-400"
                        >
                            {saving ? 'Saving...' : 'Save Exam Structure'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManageExam;
