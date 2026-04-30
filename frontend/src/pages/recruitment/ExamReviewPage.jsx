import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recruitmentService } from '../../services';

const ExamReviewPage = () => {
    const { id } = useParams();
    const [exam, setExam] = useState(null);
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [examRes, appRes] = await Promise.all([
                    recruitmentService.getExam(id),
                    recruitmentService.getMyApplication(id)
                ]);
                setExam(examRes.data);
                setApplication(appRes.data);
            } catch (err) {
                console.error(err);
                alert('Failed to load review data. Make sure you are logged in and eligible.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-12 text-center text-indigo-600 font-bold">Loading paper review...</div>;
    if (!application || !exam) return <div className="p-12 text-center text-red-600">Review not available.</div>;

    const attemptedTotal = application.examResponses?.length || 0;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Your Exam Review</h1>
                    <p className="text-gray-500 mt-1">Total Score: <span className="font-black text-2xl text-indigo-600 ml-2">{application.totalMarks}</span> / {exam.totalMarks}</p>
                    <p className="text-sm font-bold text-gray-400 mt-2">Attempted: {attemptedTotal} out of {exam.questions.length}</p>
                </div>
                <Link to={`/recruitment/${id}`} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition">
                    ← Back to Details
                </Link>
            </div>

            <div className="space-y-6">
                {exam.questions.map((q, index) => {
                    const response = application.examResponses?.find(r => r.questionIndex === index);
                    const userAns = response ? response.answer : '';
                    const isParagraph = q.type === 'Paragraph';

                    let borderColor = 'border-gray-200';
                    let bgColor = 'bg-white';
                    let statusLabel = '';

                    if (!response) {
                        borderColor = 'border-gray-300';
                        bgColor = 'bg-gray-50';
                        statusLabel = <span className="text-gray-500 font-bold px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">Unattempted (0)</span>;
                    } else if (isParagraph) {
                        borderColor = 'border-amber-200';
                        bgColor = 'bg-amber-50';
                        const score = response.marksObtained !== null && response.marksObtained !== undefined ? response.marksObtained : 0;
                        const evaluated = response.isCorrect === true; // we mark it true when evaluated manually
                        statusLabel = evaluated 
                            ? <span className="text-emerald-700 font-bold px-2 py-1 bg-emerald-100 border border-emerald-300 rounded text-xs">Evaluated (+{score})</span>
                            : <span className="text-amber-700 font-bold px-2 py-1 bg-amber-100 border border-amber-300 rounded text-xs">Pending Review</span>;
                    } else if (response.isCorrect) {
                        borderColor = 'border-emerald-300';
                        bgColor = 'bg-emerald-50/30';
                        statusLabel = <span className="text-emerald-700 font-bold px-2 py-1 bg-emerald-100 border border-emerald-300 rounded text-xs">Correct (+{q.marks})</span>;
                    } else {
                        borderColor = 'border-red-300';
                        bgColor = 'bg-red-50/30';
                        statusLabel = <span className="text-red-700 font-bold px-2 py-1 bg-red-100 border border-red-300 rounded text-xs">Incorrect (0)</span>;
                    }

                    return (
                        <div key={index} className={`p-6 rounded-2xl border-2 ${borderColor} ${bgColor} relative overflow-hidden`}>
                            {/* Accent stripe */}
                            <div className={`absolute top-0 left-0 bottom-0 w-2 ${
                                !response ? 'bg-gray-300' : isParagraph ? 'bg-amber-400' : response.isCorrect ? 'bg-emerald-400' : 'bg-red-400'
                            }`}></div>

                            <div className="pl-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg leading-tight w-full max-w-2xl">{q.text}</h3>
                                            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 block mt-1">{q.type} - Max {q.marks} Marks</span>
                                        </div>
                                    </div>
                                    <div>{statusLabel}</div>
                                </div>

                                <div className="pl-11 mt-4">
                                    {!isParagraph ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {q.options.map((opt, i) => {
                                                const isUserChoice = userAns === opt;
                                                const isCorrectChoice = q.correctAnswer === opt;
                                                
                                                let optClass = "p-3 rounded-xl border-2 text-sm font-medium flex items-center gap-3 transition-colors ";
                                                let icon = <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>;

                                                if (isCorrectChoice) {
                                                    optClass += "border-emerald-500 bg-emerald-50 text-emerald-900";
                                                    icon = "✓";
                                                } else if (isUserChoice && !isCorrectChoice) {
                                                    optClass += "border-red-500 bg-red-50 text-red-900";
                                                    icon = "✗";
                                                } else {
                                                    optClass += "border-gray-200 bg-white text-gray-600 opacity-60";
                                                }

                                                return (
                                                    <div key={i} className={optClass}>
                                                        <div className={`flex items-center justify-center font-bold ${isCorrectChoice ? 'text-emerald-500' : isUserChoice ? 'text-red-500' : ''}`}>
                                                            {icon}
                                                        </div>
                                                        {opt}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-white/60 border border-gray-200 rounded-xl whitespace-pre-wrap text-gray-800 text-sm">
                                                <strong className="text-xs text-gray-400 uppercase block mb-2">Your Answer:</strong>
                                                {userAns || <span className="text-gray-400 italic">No answer provided</span>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="text-center pt-8 border-t border-gray-200">
                <p className="text-gray-500 font-medium">Thank you for attempting the exam.</p>
                <p className="text-sm text-gray-400">Scores for Subjective/Paragraph questions may be updated manually by organizers.</p>
            </div>
        </div>
    );
};

export default ExamReviewPage;
