'use client';

import { useEffect } from 'react';

interface ChatwootConfig {
    websiteToken: string;
    baseUrl: string;
}

export default function ChatwootWidget({ config }: { config?: ChatwootConfig }) {
    useEffect(() => {
        // Temporarily disabled - TypeScript issues
        // Don't load if no config
        if (!config?.websiteToken) return;

        // Chatwoot integration disabled until TypeScript fix
        console.log('Chatwoot disabled - add proper types');
        
        return;
    }, [config]);

    return null;
}

// Helper function to set user info
export function setChatwootUser(user: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    avatarUrl?: string;
}) {
    if (typeof window !== 'undefined' && (window as any).chatwoot) {
        (window as any).chatwoot('setUser', user);
    }
}

// Helper function to set custom attributes
export function setChatwootCustomAttributes(attributes: Record<string, any>) {
    if (typeof window !== 'undefined' && (window as any).chatwoot) {
        (window as any).chatwoot('setCustomAttributes', attributes);
    }
}

// Helper function to track events
export function trackChatwootEvent(eventName: string, eventData?: Record<string, any>) {
    if (typeof window !== 'undefined' && (window as any).chatwoot) {
        (window as any).chatwoot('trackEvent', eventName, eventData);
    }
}
