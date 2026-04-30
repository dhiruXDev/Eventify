import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { recruitmentService } from '../../services';

const EvaluateExam = () => {
    const { id, appId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [evaluations, setEvaluations] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [examRes, appsRes] = await Promise.all([
                    recruitmentService.getExam(id),
                    recruitmentService.getRecruitmentApplications(id)
                ]);
                setExam(examRes.data);
                const app = appsRes.data.find(a => a._id === appId);
                setApplication(app);
                
                // Initialize default marks for Paragraph questions
                const initialEvals = {};
                if (app && app.examResponses) {
                    (app.examResponses || []).forEach(res => {
                        if (res.marksObtained !== undefined && res.marksObtained !== null) {
                            initialEvals[res.questionIndex] = res.marksObtained;
                        } else {
                            initialEvals[res.questionIndex] = 0;
                        }
                    });
                }
                setEvaluations(initialEvals);
            } catch (err) {
                console.error(err);
                alert('Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, appId]);

    const handleEvaluationChange = (qIndex, marks) => {
        setEvaluations({ ...evaluations, [qIndex]: parseFloat(marks) || 0 });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const manualMarks = Object.entries(evaluations).map(([qIndex, marksObtained]) => ({
                questionIndex: parseInt(qIndex),
                marksObtained
            }));
            
            await recruitmentService.evaluatePaper(id, appId, { manualMarks });
            alert('Evaluation saved successfully!');
            navigate(`/recruitment/registrations/${id}`);
        } catch (err) {
            alert('Failed to save evaluation');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-indigo-600 font-bold">Loading paper...</div>;
    if (!application || !exam) return <div className="p-12 text-center text-red-600">Data not found.</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Evaluate Paper: {application.userName}</h1>
                    <p className="text-gray-500">Current Total Marks: <span className="font-bold text-indigo-600">{application.totalMarks}</span> / {exam.totalMarks}</p>
                </div>
                <Link to={`/recruitment/registrations/${id}`} className="text-gray-500 hover:text-gray-800 font-bold">
                    ← Back to List
                </Link>
            </div>

            <div className="space-y-6">
                {exam.questions.map((q, index) => {
                    const response = (application.examResponses || []).find(r => r.questionIndex === index);
                    const userAns = response ? response.answer : 'No answer provided';
                    const isParagraph = q.type === 'Paragraph';

                    return (
                        <div key={index} className={`p-6 rounded-2xl border-2 ${isParagraph ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-white'}`}>
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 space-y-4">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 leading-tight">{q.text}</h3>
                                            <span className="text-xs uppercase tracking-widest font-bold text-gray-400">{q.type}</span>
                                        </div>
                                    </div>

                                    <div className="pl-11">
                                        <div className="p-4 bg-gray-50 rounded-xl whitespace-pre-wrap text-gray-800">
                                            <strong className="text-xs text-gray-500 uppercase block mb-1">Student's Answer:</strong>
                                            {userAns}
                                        </div>
                                        
                                        {!isParagraph && (
                                            <div className="mt-3 text-sm flex gap-4">
                                                <span className="font-semibold text-green-600">Correct Answer: {q.correctAnswer}</span>
                                                {response?.isCorrect ? (
                                                    <span className="font-bold text-green-500">✓ Correct (+{q.marks})</span>
                                                ) : (
                                                    <span className="font-bold text-red-500">✗ Incorrect (0)</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="w-32 flex-shrink-0 flex flex-col items-end space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Marks Awarded</label>
                                    {isParagraph ? (
                                        <input 
                                            type="number" 
                                            max={q.marks} 
                                            min="0"
                                            value={evaluations[index] !== undefined ? evaluations[index] : 0} 
                                            onChange={(e) => handleEvaluationChange(index, e.target.value)}
                                            className="w-full px-3 py-2 text-center rounded-lg border-2 border-indigo-200 focus:border-indigo-500 outline-none font-bold text-lg text-indigo-700 bg-white"
                                        />
                                    ) : (
                                        <div className="px-4 py-2 bg-gray-100 rounded-lg font-bold text-gray-700">
                                            {response?.marksObtained || 0}
                                        </div>
                                    )}
                                    <span className="text-xs text-gray-400">out of {q.marks}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full py-4 bg-indigo-600 text-white font-bold text-xl rounded-2xl hover:bg-indigo-700 shadow-xl disabled:bg-gray-400"
            >
                {saving ? 'Saving Final Marks...' : 'Save Evaluation'}
            </button>
        </div>
    );
};

export default EvaluateExam;
