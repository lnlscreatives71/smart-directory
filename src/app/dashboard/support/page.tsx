'use client';

import { useState, useEffect } from 'react';
import { Inbox, MessageSquare, Phone, Mail, Clock, CheckCircle, AlertCircle, Search, Filter, Users } from 'lucide-react';

interface Ticket {
    id: number;
    subject: string;
    status: string;
    priority: string;
    source: string;
    customer_name: string;
    customer_email: string;
    created_at: string;
    messages_count: number;
}

export default function SupportInboxPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, open, pending, resolved
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    useEffect(() => {
        fetchTickets();
    }, [filter]);

    const fetchTickets = async () => {
        try {
            const res = await fetch(`/api/support/tickets?status=${filter}`);
            const data = await res.json();
            if (data.success) {
                setTickets(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            resolved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            closed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        };
        return colors[status] || colors.open;
    };

    const getSourceIcon = (source: string) => {
        const icons: Record<string, any> = {
            chat: MessageSquare,
            email: Mail,
            phone: Phone,
            sms: MessageSquare,
            facebook: Users,
            twitter: Users,
        };
        const Icon = icons[source] || MessageSquare;
        return <Icon size={16} />;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <Inbox size={28} className="text-primary-400" />
                            Support Inbox
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">Manage all customer conversations in one place</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-primary-500 w-64"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700 transition">
                            <Filter size={16} />
                            Filter
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mt-4">
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                            <AlertCircle size={16} />
                            Open
                        </div>
                        <div className="text-2xl font-bold text-white">{tickets.filter(t => t.status === 'open').length}</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                            <Clock size={16} />
                            Pending
                        </div>
                        <div className="text-2xl font-bold text-amber-400">{tickets.filter(t => t.status === 'pending').length}</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                            <CheckCircle size={16} />
                            Resolved
                        </div>
                        <div className="text-2xl font-bold text-emerald-400">{tickets.filter(t => t.status === 'resolved').length}</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                            <MessageSquare size={16} />
                            Total
                        </div>
                        <div className="text-2xl font-bold text-white">{tickets.length}</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex h-[calc(100vh-220px)]">
                {/* Tickets List */}
                <div className={`w-full ${selectedTicket ? 'hidden lg:block' : ''} lg:w-2/3 border-r border-slate-800 overflow-y-auto`}>
                    {/* Filter Tabs */}
                    <div className="flex border-b border-slate-800">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'open', label: 'Open' },
                            { id: 'pending', label: 'Pending' },
                            { id: 'resolved', label: 'Resolved' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id)}
                                className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                                    filter === tab.id
                                        ? 'border-primary-500 text-primary-400'
                                        : 'border-transparent text-slate-400 hover:text-slate-300'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tickets */}
                    {loading ? (
                        <div className="p-8 text-center text-slate-400">Loading...</div>
                    ) : tickets.length === 0 ? (
                        <div className="p-16 text-center text-slate-400">
                            <Inbox size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No conversations found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {tickets.map(ticket => (
                                <div
                                    key={ticket.id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className="p-4 hover:bg-slate-800/50 cursor-pointer transition"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={getStatusColor(ticket.status)}>
                                                    {ticket.status}
                                                </span>
                                                <span className="text-slate-500 flex items-center gap-1 text-xs">
                                                    {getSourceIcon(ticket.source)}
                                                    {ticket.source}
                                                </span>
                                                {ticket.priority === 'high' || ticket.priority === 'urgent' && (
                                                    <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-xs font-bold">
                                                        {ticket.priority}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-white truncate mb-1">{ticket.subject}</h3>
                                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                                <span>{ticket.customer_name}</span>
                                                <span>•</span>
                                                <span>{ticket.customer_email}</span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="text-sm text-slate-400 mb-2">
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                <MessageSquare size={12} />
                                                {ticket.messages_count} messages
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Ticket Detail */}
                {selectedTicket && (
                    <div className="hidden lg:flex lg:flex-1 flex-col bg-slate-900">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-white">{selectedTicket.subject}</h2>
                                <p className="text-sm text-slate-400">{selectedTicket.customer_name}</p>
                            </div>
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                ×
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div className="text-center text-slate-400 py-8">
                                <MessageSquare size={48} className="mx-auto mb-3 opacity-50" />
                                <p>Conversation history will appear here</p>
                                <p className="text-sm mt-2">Connect Chatwoot to see full conversation</p>
                            </div>
                        </div>

                        {/* Reply Box */}
                        <div className="p-4 border-t border-slate-800">
                            <textarea
                                placeholder="Type your reply..."
                                rows={3}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primary-500 resize-none"
                            />
                            <div className="flex items-center justify-between mt-3">
                                <button className="text-sm text-slate-400 hover:text-white transition">
                                    📎 Attach file
                                </button>
                                <button className="bg-primary-600 hover:bg-primary-500 text-white font-semibold px-6 py-2 rounded-lg transition">
                                    Send Reply
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
