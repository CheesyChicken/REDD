import { db } from '@/db';
import { highlights } from '@/db/schema';

async function main() {
    const sampleHighlights = [
        {
            meetingId: 1,
            startMs: 45000,
            endMs: 130000,
            label: 'Key decision on feature prioritization',
            importance: 0.92,
        },
        {
            meetingId: 1,
            startMs: 220000,
            endMs: 370000,
            label: 'Resource constraint discussion',
            importance: 0.85,
        },
        {
            meetingId: 1,
            startMs: 480000,
            endMs: 590000,
            label: 'Timeline agreement reached',
            importance: 0.88,
        },
        {
            meetingId: 1,
            startMs: 680000,
            endMs: 800000,
            label: 'Critical performance metric identified',
            importance: 0.90,
        },
        {
            meetingId: 2,
            startMs: 35000,
            endMs: 140000,
            label: 'Training gap analysis',
            importance: 0.78,
        },
        {
            meetingId: 2,
            startMs: 180000,
            endMs: 290000,
            label: 'Customer escalation response plan',
            importance: 0.94,
        },
        {
            meetingId: 2,
            startMs: 410000,
            endMs: 520000,
            label: 'Budget approval for Q2 initiatives',
            importance: 0.91,
        },
        {
            meetingId: 2,
            startMs: 650000,
            endMs: 740000,
            label: 'Team restructuring proposal',
            importance: 0.73,
        },
    ];

    await db.insert(highlights).values(sampleHighlights);
    
    console.log('✅ Highlights seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});