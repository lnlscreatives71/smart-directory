'use client';

import { useEffect } from 'react';

interface ChatwootConfig {
    websiteToken: string;
    baseUrl: string;
}

// Chatwoot widget temporarily disabled due to TypeScript issues
// Can be re-enabled later with proper typing
export default function ChatwootWidget(_props: { config?: ChatwootConfig }) {
    useEffect(() => {
        // Disabled - no-op
        return;
    }, []);

    return null;
}
