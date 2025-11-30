import { TimeSlot } from '../types';

export const checkAvailability = async (date: string): Promise<{ slots: TimeSlot[] }> => {
    const webhookUrl = import.meta.env.VITE_N8N_AVAILABILITY_URL;

    if (!webhookUrl) {
        console.error("VITE_N8N_AVAILABILITY_URL is missing in .env");
        throw new Error("Configuration Error");
    }

    try {
        // Call n8n Webhook with GET parameters
        const response = await fetch(`${webhookUrl}?date=${date}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Availability Check Failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data; // Expecting { slots: [...] } from n8n
    } catch (error) {
        console.error("CRITICAL: Availability Fetch Error. Check network tab and n8n status.", error);
        // Return empty slots on error so the UI handles it gracefully
        return { slots: [] };
    }
};
