import Link from 'next/link';
import { sql } from '@/lib/db';
import { Job, Event, News } from '@/lib/types';
import { Calendar, MapPin, Briefcase, DollarSign, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function JobsPage() {
    let jobs: Job[] = [];
    try {
        const res = await sql`
            SELECT j.*, l.name as listing_name 
            FROM jobs j
            LEFT JOIN listings l ON j.listing_id = l.id
            WHERE j.active = true
            ORDER BY j.created_at DESC
        `;
        jobs = res as any as Job[];
    } catch {
        // Handle error gracefully
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#f0f2f5] py-16 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a202c] mb-4">Local Job Board</h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">Find exciting career opportunities from top businesses in your community.</p>
                </div>

                {jobs.length === 0 ? (
                    <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">💼</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">No jobs posted yet</h2>
                        <p className="text-slate-500 mb-8">Businesses haven't posted any job openings at this time. Check back later!</p>
                        <Link href="/pricing" className="btn-primary px-6 py-3 rounded-xl text-sm font-bold">Post a Job</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {jobs.map(job => (
                            <div key={job.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-shadow group flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">{job.employment_type}</span>
                                    <span className="text-xs font-medium text-slate-400">{new Date(job.created_at).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">{job.title}</h3>
                                <p className="text-sm font-semibold text-slate-600 mb-4">{job.listing_name}</p>
                                <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-3">{job.description}</p>
                                
                                <div className="space-y-3 mt-auto text-sm text-slate-600 border-t border-slate-100 pt-5">
                                    {job.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-slate-400" /> {job.location}
                                        </div>
                                    )}
                                    {job.salary_range && (
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={16} className="text-slate-400" /> {job.salary_range}
                                        </div>
                                    )}
                                    {job.application_url && (
                                        <a href={job.application_url} target="_blank" rel="noopener noreferrer" className="mt-4 block w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition-colors">Apply Now</a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
