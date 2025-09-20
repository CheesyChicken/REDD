import { db } from '@/db';
import { topics } from '@/db/schema';

async function main() {
    const sampleTopics = [
        // Meeting 1 - Product Planning
        {
            meetingId: 1,
            name: 'product roadmap',
            score: 0.88,
        },
        {
            meetingId: 1,
            name: 'feature prioritization',
            score: 0.92,
        },
        {
            meetingId: 1,
            name: 'resource allocation',
            score: 0.75,
        },
        {
            meetingId: 1,
            name: 'timeline planning',
            score: 0.85,
        },
        {
            meetingId: 1,
            name: 'user feedback',
            score: 0.78,
        },
        {
            meetingId: 1,
            name: 'competitive analysis',
            score: 0.82,
        },
        // Meeting 2 - Support Review
        {
            meetingId: 2,
            name: 'support metrics',
            score: 0.94,
        },
        {
            meetingId: 2,
            name: 'customer satisfaction',
            score: 0.89,
        },
        {
            meetingId: 2,
            name: 'response times',
            score: 0.87,
        },
        {
            meetingId: 2,
            name: 'ticket volume',
            score: 0.72,
        },
        {
            meetingId: 2,
            name: 'training needs',
            score: 0.68,
        }
    ];

    await db.insert(topics).values(sampleTopics);
    
    console.log('✅ Topics seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});