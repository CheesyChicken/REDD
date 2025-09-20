import { db } from '@/db';
import { meetings } from '@/db/schema';

async function main() {
    const now = Date.now();
    const lastWeek = now - (7 * 24 * 60 * 60 * 1000);
    
    const sampleMeetings = [
        {
            title: 'Q4 Product Planning',
            date: lastWeek + (2 * 24 * 60 * 60 * 1000),
            durationSeconds: 2700,
            summary: 'Discussed Q4 roadmap prioritization focusing on mobile app performance improvements and new AI-powered features. Decided to allocate 60% of engineering resources to infrastructure upgrades and 40% to new feature development. Key outcomes include approval for hiring two additional senior developers and moving payment processing optimization to Q1 next year.',
            sentiment: 0.72,
            createdAt: lastWeek + (2 * 24 * 60 * 60 * 1000),
        },
        {
            title: 'Customer Support Review',
            date: lastWeek + (5 * 24 * 60 * 60 * 1000),
            durationSeconds: 3600,
            summary: 'Analyzed Q3 customer support metrics showing 23% increase in ticket volume but 15% improvement in resolution time. Discussed implementing proactive chatbot support for common issues and expanding help documentation. Decided to hire two additional support specialists and integrate new analytics dashboard for better issue tracking. Customer satisfaction score improved from 7.2 to 8.1 out of 10.',
            sentiment: 0.15,
            createdAt: lastWeek + (5 * 24 * 60 * 60 * 1000),
        }
    ];

    await db.insert(meetings).values(sampleMeetings);
    
    console.log('✅ Meetings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});