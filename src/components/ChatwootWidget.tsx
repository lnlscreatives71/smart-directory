'use client';

import { useEffect } from 'react';

interface ChatwootConfig {
    websiteToken: string;
    baseUrl: string;
}

export default function ChatwootWidget({ config }: { config?: ChatwootConfig }) {
    useEffect(() => {
        // Don't load if no config
        if (!config?.websiteToken) return;

        // Load Chatwoot script
        ((w: any, d: any, i: string) => {
            if (!w[i]) {
                w[i] = function() {
                    (w[i].q = w[i].q || []).push(arguments);
                };
            }

            const script = d.createElement('script');
            script.src = `${config.baseUrl}/packs/js/sdk.js`;
            script.defer = true;
            script.async = true;

            script.onload = () => {
                w[i]('init', {
                    websiteToken: config.websiteToken,
                    baseUrl: config.baseUrl
                });
            };

            d.getElementsByTagName('head')[0].appendChild(script);
        })(window, document, 'chatwoot');
    }, [config]);

    // Return null - widget renders in iframe
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
