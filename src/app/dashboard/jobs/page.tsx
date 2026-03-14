'use client';
import { useEffect, useState } from 'react';
import { Plus, Loader2, Briefcase } from 'lucide-react';
import Link from 'next/link';

interface Job {
    id: number;
    listing_id: number;
    listing_name?: string;
    title: string;
    employment_type: string;
    active: boolean;
    created_at: string;
}

export default function JobsAdminPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/jobs')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setJobs(data.data);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Job Postings</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage recruiting & hiring posts for businesses.</p>
                </div>
                <Link href="/dashboard/jobs/new" className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold shadow-sm transition hover:bg-slate-800">
                    <Plus size={15} /> Add Job Post
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-gray-100 dark:border-slate-800">
                            <tr className="text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                                <th className="px-6 py-3.5 font-semibold">Job Title</th>
                                <th className="px-6 py-3.5 font-semibold">Company (Listing)</th>
                                <th className="px-6 py-3.5 font-semibold">Type</th>
                                <th className="px-6 py-3.5 font-semibold text-center">Status</th>
                                <th className="px-6 py-3.5 font-semibold text-right">Added On</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center">
                                        <Loader2 size={20} className="animate-spin text-blue-400 mx-auto" />
                                    </td>
                                </tr>
                            ) : jobs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center text-gray-400">
                                        <Briefcase className="mx-auto w-10 h-10 mb-3 opacity-20" />
                                        No active job postings.
                                    </td>
                                </tr>
                            ) : jobs.map(job => (
                                <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{job.title}</td>
                                    <td className="px-6 py-4 text-blue-600 dark:text-blue-400 font-medium">{job.listing_name}</td>
                                    <td className="px-6 py-4 font-medium">{job.employment_type}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase ${job.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-500'}`}>
                                            {job.active ? 'Active' : 'Closed'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-500 text-xs">{new Date(job.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
