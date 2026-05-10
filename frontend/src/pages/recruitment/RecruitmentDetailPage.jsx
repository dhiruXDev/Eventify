import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recruitmentService } from '../../services';
import { useAuth } from '../../context';
import bgimg from "../../assets/recruitmt.png"
const RecruitmentDetailPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [recruitment, setRecruitment] = useState(null);
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [examData, setExamData] = useState(null);
    const [mobile, setMobile] = useState('');
    const [branch, setBranch] = useState('');
    const [year, setYear] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [recRes, appRes, examRes] = await Promise.all([
                    recruitmentService.getRecruitmentById(id).catch((e) => { console.error('rec error', e); return { data: null }; }),
                    user ? recruitmentService.getMyApplication(id).catch((e) => { console.error('app error', e); return { data: null }; }) : Promise.resolve({ data: null }),
                    recruitmentService.getExam(id).catch((e) => { console.error('exam error', e); return { data: null }; })
                ]);
                console.log('fetchData appRes:', appRes);
                if (recRes?.data) setRecruitment(recRes.data);
                if (appRes !== undefined) setApplication(appRes?.data || null);
                if (examRes?.data) setExamData(examRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, user]);
    
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

    // return (
    //     <div className="max-w-4xl mx-auto p-6">
    //         <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
    //             {/* Header Section */}
    //             <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-10 text-white relative">
    //                 <div className="absolute top-0 right-0 p-8 opacity-10">
    //                     <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /><path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" /></svg>
    //                 </div>

    //                 <div className="relative z-10">
    //                     <Link to="/" className="text-indigo-200 text-sm font-bold hover:text-white mb-6 inline-block transition">← Back to Home</Link>
    //                     <div className="flex justify-between items-start">
    //                         <div>
    //                             <span className="bg-white/20 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/30 backdrop-blur-sm">Driven by {recruitment.clubName}</span>
    //                             <h1 className="text-4xl font-black mt-4 mb-2">{recruitment.title}</h1>
    //                             <p className="text-indigo-100 text-lg">Looking for talented <span className="text-white font-bold">{recruitment.role}s</span></p>
    //                         </div>
    //                         <div className="bg-white text-indigo-600 p-4 rounded-2xl shadow-lg text-center min-w-[100px]">
    //                             <div className="text-3xl font-black">{new Date(recruitment.date).getDate()}</div>
    //                             <div className="text-xs font-bold uppercase">{new Date(recruitment.date).toLocaleString('default', { month: 'short' })}</div>
    //                         </div>
    //                     </div>
    //                 </div>
    //             </div>

    //             {/* Content Section */}
    //             <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
    //                 <div className="md:col-span-2 space-y-8">
    //                     <div>
    //                         <h3 className="text-xl font-bold text-gray-900 border-b-2 border-indigo-100 pb-2 mb-4">About the Role</h3>
    //                         <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{recruitment.description}</p>
    //                     </div>

    //                     <div className="grid grid-cols-2 gap-6">
    //                         <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
    //                             <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Mode</span>
    //                             <span className="text-lg font-bold text-gray-800">{recruitment.mode === 'Online' ? '🖥 Online Exam' : '🏛 Offline Interview'}</span>
    //                         </div>
    //                         <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
    //                             <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Venue</span>
    //                             <span className="text-lg font-bold text-gray-800">{recruitment.mode === 'Online' ? 'Portal' : (recruitment.venue || 'TBA')}</span>
    //                         </div>
    //                     </div>
    //                 </div>

    //                 <div className="space-y-6">
    //                     <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
    //                         <h4 className="font-bold text-indigo-900 mb-4">Deadlines</h4>
    //                         <div className="space-y-4">
    //                             <div className="flex items-center gap-3">
    //                                 <div className="w-8 h-8 rounded-full bg-white border border-indigo-200 flex items-center justify-center text-indigo-600">
    //                                     ⏱
    //                                 </div>
    //                                 <div>
    //                                     <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter leading-none">Registration Ends</p>
    //                                     <p className="text-sm font-bold text-indigo-900">{new Date(recruitment.deadline).toLocaleString()}</p>
    //                                 </div>
    //                             </div>
    //                             <div className="flex items-center gap-3">
    //                                 <div className="w-8 h-8 rounded-full bg-white border border-indigo-200 flex items-center justify-center text-indigo-600">
    //                                     📅
    //                                 </div>
    //                                 <div>
    //                                     <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter leading-none">Drive Date</p>
    //                                     <p className="text-sm font-bold text-indigo-900">{new Date(recruitment.date).toLocaleDateString()} at {recruitment.time}</p>
    //                                 </div>
    //                             </div>
    //                         </div>

    //                         <div className="mt-8">
    //                             {application ? (
    //                                 <div className="text-center space-y-4">
    //                                     <div className="bg-green-500 text-white p-4 rounded-2xl font-bold shadow-md">
    //                                         ✓ Applied Successfully
    //                                     </div>
    //                                     <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">Status: {application.status}</p>
    //                                     {application.status === 'Shortlisted' && (
    //                                         <p className="text-xs text-indigo-500">Wait for final selection email!</p>
    //                                     )}
    //                                     {console.log('Debug UI -> mode:', recruitment.mode, 'status:', application.status, 'responses:', application.examResponses, 'examData:', examData)}
    //                                     {recruitment.mode === 'Online' && ['Applied', 'Shortlisted'].includes(application.status) && (
    //                                         <>
    //                                             {examData && !examData.isReleased && examData.scheduled && (
    //                                                 <div className="p-4 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 mt-4 text-sm font-bold">
    //                                                     ⏳ Upcoming Exam Soon
    //                                                 </div>
    //                                             )}
    //                                             {(!examData || examData.isReleased) && (
    //                                                 <Link to={`/recruitment/attempt-exam/${id}`} className="block w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg mt-4 text-center">
    //                                                     📝 Launch Exam
    //                                                 </Link>
    //                                             )}
    //                                         </>
    //                                     )}

    //                                     {['Exam Attempted', 'Shortlisted', 'Selected', 'Rejected'].includes(application.status) && (application.examResponses && application.examResponses.length > 0) && (
    //                                         <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl mt-4 text-center">
    //                                             <p className="text-gray-500 font-bold mb-1 uppercase tracking-widest text-xs">Exam Score</p>
    //                                             <p className="text-2xl font-black text-indigo-700 mb-4">{application.totalMarks} Marks</p>
    //                                             <Link to={`/recruitment/exam-review/${id}`} className="block w-full py-2 bg-white text-indigo-600 border-2 border-indigo-100 rounded-lg font-bold hover:border-indigo-600 transition text-sm text-center">
    //                                                 📄 Review Paper
    //                                             </Link>
    //                                         </div>
    //                                     )}
    //                                 </div>
    //                             ) : (isDeadlinePassed || isClosed) ? (
    //                                 <div className="bg-gray-200 text-gray-500 p-4 rounded-2xl font-bold text-center">
    //                                     Registrations Closed
    //                                 </div>
    //                             ) : (
    //                                 <div className="space-y-4">
    //                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //                                         <div className="space-y-2">
    //                                             <label className="text-xs font-bold text-indigo-900 uppercase">Branch</label>
    //                                             <input
    //                                                 type="text"
    //                                                 placeholder="e.g. CSE, ECE"
    //                                                 value={branch}
    //                                                 onChange={(e) => setBranch(e.target.value)}
    //                                                 className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 outline-none focus:border-indigo-500 transition-colors"
    //                                                 required
    //                                             />
    //                                         </div>
    //                                         <div className="space-y-2">
    //                                             <label className="text-xs font-bold text-indigo-900 uppercase">Year</label>
    //                                             <select
    //                                                 value={year}
    //                                                 onChange={(e) => setYear(e.target.value)}
    //                                                 className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 outline-none focus:border-indigo-500 transition-colors bg-white"
    //                                                 required
    //                                             >
    //                                                 <option value="">Select Year</option>
    //                                                 <option value="1st Year">1st Year</option>
    //                                                 <option value="2nd Year">2nd Year</option>
    //                                                 <option value="3rd Year">3rd Year</option>
    //                                                 <option value="4th Year">4th Year</option>
    //                                             </select>
    //                                         </div>
    //                                     </div>
    //                                     <div className="space-y-2">
    //                                         <label className="text-xs font-bold text-indigo-900 uppercase">Your Mobile Number</label>
    //                                         <input
    //                                             type="tel"
    //                                             placeholder="e.g. +91 9876543210"
    //                                             value={mobile}
    //                                             onChange={(e) => setMobile(e.target.value)}
    //                                             className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 outline-none focus:border-indigo-500 transition-colors"
    //                                             required
    //                                         />
    //                                     </div>
    //                                     <button
    //                                         onClick={handleApply}
    //                                         disabled={applying}
    //                                         className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:bg-gray-400"
    //                                     >
    //                                         {applying ? 'Applying...' : 'Apply Now ✨'}
    //                                     </button>
    //                                 </div>
    //                             )}
    //                         </div>
    //                     </div>

    //                     <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl text-center">
    //                         <p className="text-xs text-gray-400 font-bold uppercase mb-2">Need Help?</p>
    //                         <p className="text-sm text-gray-600">Contact the club organizer for any queries regarding this recruitment.</p>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     </div>
    // );
// return (
//     <div className="min-h-screen bg-[#f5f9f6] py-6 px-4">

//         <div className="max-w-6xl mx-auto">

//             <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-[#eef4ef]">

//                 {/* HERO SECTION */}
//                 <div className="relative overflow-hidden bg-gradient-to-r from-[#f6fbf7] to-[#edf8f1]">

//                     <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-green-100/40 rounded-full blur-3xl"></div>

//                     <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-6 px-6 lg:px-10 py-8">

//                         {/* LEFT CONTENT */}
//                         <div>

//                             <Link
//                                 to="/"
//                                 className="inline-flex items-center text-green-700  text-sm font-semibold hover:text-green-800 transition mb-5"
//                             >
//                                 ← Back to Home
//                             </Link>

//                             <div className="inline-flex items-center bg-green-600 ml-10 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">
//                                 Driven by {recruitment.clubName}
//                             </div>

//                             <h1 className="text-3xl lg:text-4xl font-black text-[#08142b] mt-5 leading-tight">
//                                 {recruitment.title}
//                             </h1>

//                             <p className="text-lg lg:text-xl text-gray-700 mt-4 leading-relaxed">
//                                 Looking for talented{" "}
//                                 <span className="text-green-600 font-bold">
//                                     {recruitment.role}s
//                                 </span>
//                             </p>
//                         </div>

//                         {/* RIGHT IMAGE */}
//                         <div className="relative flex justify-center">

//                             <img
//                                 src={bgimg}
//                                 alt="Recruitment Illustration"
//                                 className="w-full max-w-[500px] object-contain"
//                             />

//                             {/* DATE CARD */}
//                             <div className="absolute right-0 top-8 bg-white shadow-lg rounded-2xl px-5 py-5 text-center border border-green-100">

//                                 <div className="text-3xl lg:text-4xl font-black text-green-600 leading-none">
//                                     {new Date(recruitment.date).getDate()}
//                                 </div>

//                                 <div className="text-sm uppercase font-bold text-green-700 mt-2">
//                                     {new Date(recruitment.date).toLocaleString(
//                                         "default",
//                                         { month: "short" }
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* MAIN CONTENT */}
//                 <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 p-6 lg:p-10">

//                     {/* LEFT SECTION */}
//                     <div>

//                         {/* ABOUT */}
//                         <div className="mb-8">

//                             <div className="flex items-center gap-3 mb-5">

//                                 <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-xl">
//                                     🪪
//                                 </div>

//                                 <h2 className="text-xl lg:text-2xl font-black text-[#08142b]">
//                                     About the Role
//                                 </h2>
//                             </div>

//                             <div className="h-[2px] w-full bg-green-100 mb-6"></div>

//                             <p className="text-base lg:text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
//                                 {recruitment.description}
//                             </p>
//                         </div>

//                         {/* FEATURE CARDS */}
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

//                             {/* MODE */}
//                             <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">

//                                 <p className="text-xs uppercase font-bold tracking-widest text-green-600 mb-4">
//                                     Mode
//                                 </p>

//                                 <div className="flex items-center gap-3">

//                                     <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-xl">
//                                         {recruitment.mode === "Online" ? "💻" : "🏫"}
//                                     </div>

//                                     <div>
//                                         <h3 className="text-lg lg:text-xl font-black text-[#08142b]">
//                                             {recruitment.mode === "Online"
//                                                 ? "Online Exam"
//                                                 : "Offline Interview"}
//                                         </h3>

//                                         <p className="text-sm text-gray-500 mt-1">
//                                             {recruitment.mode === "Online"
//                                                 ? "Virtual assessment"
//                                                 : "Physical interview"}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* VENUE */}
//                             <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">

//                                 <p className="text-xs uppercase font-bold tracking-widest text-green-600 mb-4">
//                                     Venue
//                                 </p>

//                                 <div className="flex items-center gap-3">

//                                     <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-xl">
//                                         🏢
//                                     </div>

//                                     <div>
//                                         <h3 className="text-lg lg:text-xl font-black text-[#08142b]">
//                                             {recruitment.mode === "Online"
//                                                 ? "Portal"
//                                                 : recruitment.venue || "TBA"}
//                                         </h3>

//                                         <p className="text-sm text-gray-500 mt-1">
//                                             {recruitment.mode === "Online"
//                                                 ? "Online platform"
//                                                 : "Venue location"}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* RIGHT SIDEBAR */}
//                     <div className="space-y-6">

//                         {/* APPLICATION CARD */}
//                         <div className="bg-white rounded-[28px] border border-[#ebf3ec] shadow-sm p-6">

//                             <div className="flex items-center gap-3 mb-6">

//                                 <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">
//                                     ⏰
//                                 </div>

//                                 <h3 className="text-2xl lg:text-3xl font-black text-[#08142b]">
//                                     Deadlines
//                                 </h3>
//                             </div>

//                             <div className="space-y-5">

//                                 <div className="flex gap-3">

//                                     <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-xl">
//                                         📅
//                                     </div>

//                                     <div>
//                                         <p className="text-xs font-bold uppercase tracking-widest text-green-600 mb-1">
//                                             Registration Ends
//                                         </p>

//                                         <p className="text-base lg:text-lg font-black text-[#08142b]">
//                                             {new Date(
//                                                 recruitment.deadline
//                                             ).toLocaleString()}
//                                         </p>
//                                     </div>
//                                 </div>

//                                 <div className="border-t border-gray-100"></div>

//                                 <div className="flex gap-3">

//                                     <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-xl">
//                                         🗓
//                                     </div>

//                                     <div>
//                                         <p className="text-xs font-bold uppercase tracking-widest text-green-600 mb-1">
//                                             Drive Date
//                                         </p>

//                                         <p className="text-base lg:text-lg font-black text-[#08142b]">
//                                             {new Date(
//                                                 recruitment.date
//                                             ).toLocaleDateString()}{" "}
//                                             at {recruitment.time}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* APPLY SECTION */}
//                             <div className="mt-8">

//                                 {application ? (
//                                     <div className="space-y-4">

//                                         <div className="bg-green-500 text-white rounded-2xl p-4 text-center font-bold text-base shadow-lg">
//                                             ✓ Applied Successfully
//                                         </div>

//                                         <div className="text-center">
//                                             <p className="text-[11px] uppercase tracking-widest text-green-600 font-bold">
//                                                 Status
//                                             </p>

//                                             <p className="text-xl font-black text-[#08142b] mt-1">
//                                                 {application.status}
//                                             </p>
//                                         </div>

//                                     </div>
//                                 ) : isDeadlinePassed || isClosed ? (

//                                     <div className="bg-gray-100 text-gray-500 rounded-2xl p-4 text-center font-bold text-base">
//                                         Registrations Closed
//                                     </div>

//                                 ) : (

//                                     <div className="space-y-4">

//                                         <div className="grid grid-cols-2 gap-3">

//                                             <div>
//                                                 <label className="text-xs uppercase tracking-widest font-bold text-green-700 block mb-2">
//                                                     Branch
//                                                 </label>

//                                                 <input
//                                                     type="text"
//                                                     placeholder="e.g. CS"
//                                                     value={branch}
//                                                     onChange={(e) =>
//                                                         setBranch(e.target.value)
//                                                     }
//                                                     className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-green-500 text-base"
//                                                 />
//                                             </div>

//                                             <div>
//                                                 <label className="text-xs uppercase tracking-widest font-bold text-green-700 block mb-2">
//                                                     Year
//                                                 </label>

//                                                 <select
//                                                     value={year}
//                                                     onChange={(e) =>
//                                                         setYear(e.target.value)
//                                                     }
//                                                     className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-green-500 bg-white text-base"
//                                                 >
//                                                     <option value="">
//                                                         Select
//                                                     </option>

//                                                     <option value="1st Year">
//                                                         1st Year
//                                                     </option>

//                                                     <option value="2nd Year">
//                                                         2nd Year
//                                                     </option>

//                                                     <option value="3rd Year">
//                                                         3rd Year
//                                                     </option>

//                                                     <option value="4th Year">
//                                                         4th Year
//                                                     </option>
//                                                 </select>
//                                             </div>
//                                         </div>

//                                         <div>
//                                             <label className="text-xs uppercase tracking-widest font-bold text-green-700 block mb-2">
//                                                 Your Mobile Number
//                                             </label>

//                                             <input
//                                                 type="tel"
//                                                 placeholder="e.g. +91 9876543210"
//                                                 value={mobile}
//                                                 onChange={(e) =>
//                                                     setMobile(e.target.value)
//                                                 }
//                                                 className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-green-500 text-base"
//                                             />
//                                         </div>

//                                         <button
//                                             onClick={handleApply}
//                                             disabled={applying}
//                                             className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-700 text-white text-lg lg:text-xl font-black transition shadow-lg active:scale-[0.98]"
//                                         >
//                                             {applying
//                                                 ? "Applying..."
//                                                 : "Apply Now ✨"}
//                                         </button>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         {/* HELP CARD */}
//                         <div className="bg-white rounded-[28px] border border-[#ebf3ec] shadow-sm p-6">

//                             <div className="flex items-start gap-4">

//                                 <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">
//                                     🎧
//                                 </div>

//                                 <div>

//                                     <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">
//                                         Need Help?
//                                     </p>

//                                     <p className="text-base text-gray-700 leading-relaxed">
//                                         Contact the club organizer for any
//                                         queries regarding this recruitment.
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     </div>
// );
return (
    <div className="min-h-screen bg-[#f7faf8] py-6 px-4">

        <div className="max-w-7xl mx-auto">

            <div className="bg-white rounded-[28px] overflow-hidden border border-[#edf3ee] shadow-sm">

                {/* HERO */}
                <div className="relative overflow-hidden bg-gradient-to-r from-[#f8fcf9] to-[#eef8f2]">

                    {/* Background Blur */}
                    <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-green-100/40 rounded-full blur-3xl"></div>

                    <div className="relative z-10 grid grid-cols-1  lg:grid-cols-2 items-center gap-6 px-8 lg:px-10 py-8">

                        {/* LEFT CONTENT */}
                        <div>

                            <Link
                                to="/"
                                className="inline-flex items-center text-[#16a34a] text-[14px] font-semibold hover:text-green-700 transition mb-5"
                            >
                                ← Back to Home
                            </Link>

                            <div className="inline-flex items-center px-4 py-2 ml-10 rounded-full bg-green-600 text-white text-[11px] font-bold uppercase tracking-wide shadow-sm">
                                Driven by {recruitment.clubName}
                            </div>

                            <h1 className="text-[44px] leading-[1.1]   font-bold text-[#0f172a] mt-5">
                                {recruitment.title}
                            </h1>

                            <p className="text-[20px] text-gray-700 mt-4 font-medium">
                                Looking for talented{" "}
                                <span className="text-green-600 font-bold">
                                    {recruitment.role}s
                                </span>
                            </p>
                        </div>

                        {/* RIGHT IMAGE */}
                        <div className="relative flex justify-end">

                            <img
                                src={bgimg}
                                alt="Recruitment"
                                className="w-full max-w-[500px]   object-contain"
                            />

                            {/* DATE CARD */}
                            <div className="absolute right-2 top-6 bg-white rounded-[24px] px-6 py-5 shadow-lg border border-green-100 text-center">

                                <div className="text-[38px] leading-none font-black text-green-600">
                                    {new Date(recruitment.date).getDate()}
                                </div>

                                <div className="text-[14px] font-bold uppercase text-green-700 mt-2">
                                    {new Date(recruitment.date).toLocaleString(
                                        "default",
                                        { month: "short" }
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 p-8">

                    {/* LEFT */}
                    <div>

                        {/* ABOUT */}
                        <div>

                            <div className="flex items-center gap-3 mb-5">

                                 

                                <h2 className="text-[32px] font-bold text-[#0f172a]">
                                    About the Role
                                </h2>
                            </div>

                            <div className="h-[2px] bg-green-100 mb-6"></div>

                            <p className="text-[17px] leading-[1.9] text-gray-700 whitespace-pre-wrap max-w-[720px]">
                                {recruitment.description}
                            </p>

                            {/* SKILL */}
                            <div className="flex items-center gap-3 mt-6">

                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-[12px] text-green-700">
                                    ✓
                                </div>

                                <span className="text-[15px] text-gray-700 font-medium">
                                    Public speaking
                                </span>
                            </div>
                        </div>

                        {/* CARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">

                            {/* MODE */}
                            <div className="bg-white border border-gray-100 rounded-[22px] p-6 shadow-sm">

                                <p className="text-[11px] uppercase tracking-widest font-bold text-green-600 mb-5">
                                    Mode
                                </p>

                                <div className="flex items-center gap-4">

                                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-[20px]">
                                        💻
                                    </div>

                                    <div>
                                        <h3 className="text-[28px] leading-none font-bold text-[#0f172a]">
                                            {recruitment.mode === "Online"
                                                ? "Online Exam"
                                                : "Offline Interview"}
                                        </h3>

                                        <p className="text-[14px] text-gray-500 mt-2">
                                            {recruitment.mode === "Online"
                                                ? "Virtual assessment"
                                                : "Physical interview"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* VENUE */}
                            <div className="bg-white border border-gray-100 rounded-[22px] p-6 shadow-sm">

                                <p className="text-[11px] uppercase tracking-widest font-bold text-green-600 mb-5">
                                    Venue
                                </p>

                                <div className="flex items-center gap-4">

                                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-[20px]">
                                        🏢
                                    </div>

                                    <div>
                                        <h3 className="text-[28px] leading-none font-bold text-[#0f172a]">
                                            {recruitment.mode === "Online"
                                                ? "Portal"
                                                : recruitment.venue || "TBA"}
                                        </h3>

                                        <p className="text-[14px] text-gray-500 mt-2">
                                            {recruitment.mode === "Online"
                                                ? "Online platform"
                                                : "Venue location"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="space-y-5">

                        {/* APPLY CARD */}
                        <div className="bg-white border border-[#edf3ee] rounded-[28px] p-6 shadow-sm">

                            <div className="flex items-center gap-3 mb-6">

                                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-[18px]">
                                    ⏰
                                </div>

                                <h3 className="text-[30px] font-bold text-[#0f172a]">
                                    Deadlines
                                </h3>
                            </div>

                            {/* DEADLINE */}
                            <div className="space-y-5">

                                <div className="flex gap-3">

                                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-[16px]">
                                        📅
                                    </div>

                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest font-bold text-green-600 mb-1">
                                            Registration Ends
                                        </p>

                                        <p className="text-[18px] font-black text-[#0f172a] leading-snug">
                                            {new Date(
                                                recruitment.deadline
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100"></div>

                                <div className="flex gap-3">

                                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-[16px]">
                                        🗓
                                    </div>

                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest font-bold text-green-600 mb-1">
                                            Drive Date
                                        </p>

                                        <p className="text-[18px] font-black text-[#0f172a] leading-snug">
                                            {new Date(
                                                recruitment.date
                                            ).toLocaleDateString()}{" "}
                                            at {recruitment.time}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* APPLY */}
                            <div className="mt-8">

                                {application ? (
                                    <div className="space-y-4">

                                        <div className="bg-green-500 text-white rounded-2xl p-4 text-center text-[15px] font-bold">
                                            ✓ Applied Successfully
                                        </div>

                                        <div className="text-center">

                                            <p className="text-[10px] uppercase tracking-widest text-green-600 font-bold">
                                                Status
                                            </p>

                                            <p className="text-[22px] font-black text-[#0f172a] mt-1">
                                                {application.status}
                                            </p>
                                        </div>

                                        {/* Online Exam Launch Section */}
                                        {recruitment.mode === 'Online' && ['Applied', 'Shortlisted'].includes(application.status) && (
                                            <div className="mt-4">
                                                {examData && !examData.isReleased && examData.scheduled && (
                                                    <div className="p-4 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-sm font-bold text-center">
                                                        ⏳ Online Exam Scheduled
                                                        <p className="text-[10px] opacity-75 mt-1 font-medium italic">Wait for the organizer to release the paper!</p>
                                                    </div>
                                                )}
                                                {examData && examData.isReleased && (
                                                    <Link 
                                                        to={`/recruitment/attempt-exam/${id}`} 
                                                        className="block w-full py-3 bg-[#16a34a] text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg text-center"
                                                    >
                                                        📝 Launch Exam
                                                    </Link>
                                                )}
                                            </div>
                                        )}

                                        {/* Exam Review Link */}
                                        {['Exam Attempted', 'Shortlisted', 'Selected', 'Rejected'].includes(application.status) && application.examResponses?.length > 0 && (
                                            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl mt-4 text-center">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Exam Result</p>
                                                <p className="text-[22px] font-black text-indigo-600 mt-1">{application.totalMarks} Marks</p>
                                                <Link 
                                                    to={`/recruitment/exam-review/${id}`} 
                                                    className="mt-3 block w-full py-2 bg-white text-indigo-600 border border-indigo-100 rounded-lg text-xs font-bold hover:border-indigo-600 transition"
                                                >
                                                    📄 Review Paper
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                ) : isDeadlinePassed || isClosed ? (

                                    <div className="bg-gray-100 text-gray-500 rounded-2xl p-4 text-center font-bold text-[15px]">
                                        Registrations Closed
                                    </div>

                                ) : (

                                    <div className="space-y-5">

                                        {/* BRANCH YEAR */}
                                        <div className="grid grid-cols-2 gap-4">

                                            <div>
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-green-700 block mb-2">
                                                    Branch
                                                </label>

                                                <input
                                                    type="text"
                                                    placeholder="e.g. CS"
                                                    value={branch}
                                                    onChange={(e) =>
                                                        setBranch(e.target.value)
                                                    }
                                                    className="w-full h-11 px-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-green-500 text-[14px]"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-green-700 block mb-2">
                                                    Year
                                                </label>

                                                <select
                                                    value={year}
                                                    onChange={(e) =>
                                                        setYear(e.target.value)
                                                    }
                                                    className="w-full h-11 px-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-green-500 bg-white text-[14px]"
                                                >
                                                    <option value="">
                                                        Select
                                                    </option>

                                                    <option value="1st Year">
                                                        1st Year
                                                    </option>

                                                    <option value="2nd Year">
                                                        2nd Year
                                                    </option>

                                                    <option value="3rd Year">
                                                        3rd Year
                                                    </option>

                                                    <option value="4th Year">
                                                        4th Year
                                                    </option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* MOBILE */}
                                        <div>
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-green-700 block mb-2">
                                                Your Mobile Number
                                            </label>

                                            <input
                                                type="tel"
                                                placeholder="e.g. +91 9876543210"
                                                value={mobile}
                                                onChange={(e) =>
                                                    setMobile(e.target.value)
                                                }
                                                className="w-full h-11 px-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-green-500 text-[14px]"
                                            />
                                        </div>

                                        {/* BUTTON */}
                                        <button
                                            onClick={handleApply}
                                            disabled={applying}
                                            className="w-full h-12 rounded-2xl bg-green-600 hover:bg-green-700 text-white text-[18px] font-black transition shadow-md active:scale-[0.98]"
                                        >
                                            {applying
                                                ? "Applying..."
                                                : "Apply Now ✨"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* HELP */}
                        <div className="bg-white border border-[#edf3ee] rounded-[28px] p-6 shadow-sm">

                            <div className="flex items-start gap-4">

                                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-[18px]">
                                    🎧
                                </div>

                                <div>

                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">
                                        Need Help?
                                    </p>

                                    <p className="text-[15px] leading-[1.7] text-gray-700">
                                        Contact the club organizer for any
                                        queries regarding this recruitment.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
};

export default RecruitmentDetailPage;
