import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recruitmentService } from '../../services';

const ExamAttemptPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const response = await recruitmentService.getExam(id);
                setExam(response.data);
                setTimeLeft(response.data.duration * 60);
                // Initialize responses
                setResponses(response.data.questions.map((_, i) => ({ questionIndex: i, answer: '' })));
            } catch (err) {
                alert('Failed to load exam. Check if you are authorized.');
                navigate(`/recruitment/${id}`);
            } finally {
                setLoading(false);
            }
        };
        fetchExam();
    }, [id, navigate]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (exam && timeLeft === 0 && !submitting) {
            handleSubmit();
        }
    }, [timeLeft, exam]);

    const handleAnswer = (qIndex, answer) => {
        const newResponses = [...responses];
        newResponses[qIndex].answer = answer;
        setResponses(newResponses);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSubmitting(true);
        try {
            await recruitmentService.submitExam(id, { responses });
            alert('Exam submitted successfully!');
            navigate(`/recruitment/${id}`);
        } catch (err) {
            alert('Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center p-20 font-bold text-indigo-600">Preparing your exam...</div>;

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gray-900 p-6 text-white flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold">{exam.title}</h2>
                        <p className="text-xs text-gray-400">Answer all questions before the timer ends</p>
                    </div>
                    <div className={`px-6 py-2 rounded-xl border-2 font-black text-2xl ${timeLeft < 60 ? 'border-red-500 text-red-500 animate-pulse' : 'border-indigo-500 text-indigo-400'}`}>
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="p-8 space-y-12">
                    {exam.questions.map((q, qIndex) => (
                        <div key={qIndex} className="space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <div className="flex gap-4">
                                <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold flex-shrink-0">{qIndex + 1}</span>
                                <h3 className="text-lg font-bold text-gray-800 leading-tight">{q.text}</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-12">
                                {q.options.map((opt, oIndex) => (
                                    <label
                                        key={oIndex}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 ${responses[qIndex]?.answer === opt
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                                                : 'border-white bg-white hover:border-gray-200 text-gray-600'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name={`q-${qIndex}`}
                                            value={opt}
                                            checked={responses[qIndex]?.answer === opt}
                                            onChange={() => handleAnswer(qIndex, opt)}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${responses[qIndex]?.answer === opt ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
                                            {responses[qIndex]?.answer === opt && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                        </div>
                                        <span className="font-semibold">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-8 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-xl hover:bg-indigo-700 shadow-xl transition-all disabled:bg-gray-400"
                    >
                        {submitting ? 'Submitting Responses...' : 'Finish and Submit Exam'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExamAttemptPage;
