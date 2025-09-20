import { db } from '@/db';
import { actionItems } from '@/db/schema';

async function main() {
    const sampleActionItems = [
        {
            meetingId: 1,
            title: 'Finalize Q4 roadmap document',
            owner: 'Sarah Chen',
            status: 'done',
            dueDate: new Date('2024-01-20').getTime(),
            createdAt: new Date('2024-01-15').getTime(),
        },
        {
            meetingId: 1,
            title: 'Review technical feasibility of microservices architecture',
            owner: 'Mike Rodriguez',
            status: 'in_progress',
            dueDate: new Date('2024-01-25').getTime(),
            createdAt: new Date('2024-01-15').getTime(),
        },
        {
            meetingId: 1,
            title: 'Update design mockups for mobile app v2.0',
            owner: 'Lisa Park',
            status: 'todo',
            dueDate: new Date('2024-01-30').getTime(),
            createdAt: new Date('2024-01-15').getTime(),
        },
        {
            meetingId: 1,
            title: 'Schedule stakeholder review meeting for budget approval',
            owner: 'David Kumar',
            status: 'in_progress',
            dueDate: new Date('2024-01-18').getTime(),
            createdAt: new Date('2024-01-15').getTime(),
        },
        {
            meetingId: 2,
            title: 'Implement new ticket triage system in Zendesk',
            owner: 'Jennifer Wu',
            status: 'todo',
            dueDate: new Date('2024-02-05').getTime(),
            createdAt: new Date('2024-01-22').getTime(),
        },
        {
            meetingId: 2,
            title: 'Create customer support training materials for Q1',
            owner: 'Alex Thompson',
            status: 'in_progress',
            dueDate: new Date('2024-01-28').getTime(),
            createdAt: new Date('2024-01-22').getTime(),
        },
        {
            meetingId: 2,
            title: 'Analyze customer satisfaction trends and compile report',
            owner: 'Rachel Green',
            status: 'done',
            dueDate: new Date('2024-01-24').getTime(),
            createdAt: new Date('2024-01-22').getTime(),
        },
        {
            meetingId: 1,
            title: 'Prepare competitive analysis for Q4 product launch',
            owner: 'Sarah Chen',
            status: 'todo',
            dueDate: new Date('2024-02-01').getTime(),
            createdAt: new Date('2024-01-15').getTime(),
        },
        {
            meetingId: 2,
            title: 'Update customer feedback survey questions',
            owner: 'Lisa Park',
            status: 'todo',
            dueDate: new Date('2024-02-10').getTime(),
            createdAt: new Date('2024-01-22').getTime(),
        },
    ];

    await db.insert(actionItems).values(sampleActionItems);
    
    console.log('✅ Action items seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});