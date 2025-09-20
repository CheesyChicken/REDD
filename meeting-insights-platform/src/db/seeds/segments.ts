import { db } from '@/db';
import { segments } from '@/db/schema';

async function main() {
    const sampleSegments = [
        // Meeting 1 - Product Planning (8 segments, 45 minutes total)
        {
            meetingId: 1,
            startMs: 0,
            endMs: 180000, // 3 minutes
            speaker: 'Sarah Chen (PM)',
            text: 'Good morning everyone. Let\'s kick off our Q4 product planning session. I\'ve reviewed the customer feedback from the past quarter, and there are three key areas we need to address: performance improvements, mobile app enhancements, and integration capabilities. Let\'s start with performance - our average response time has increased by 15%.',
            sentiment: -0.2,
        },
        {
            meetingId: 1,
            startMs: 180001,
            endMs: 360000, // 3 minutes
            speaker: 'Mike Rodriguez (Engineering)',
            text: 'I\'ve been analyzing the performance bottlenecks. The main issue is with our database queries, particularly in the reporting module. We can optimize by implementing proper indexing and caching strategies. I estimate we can reduce response times by 20% within three weeks if we prioritize this.',
            sentiment: 0.3,
        },
        {
            meetingId: 1,
            startMs: 360001,
            endMs: 570000, // 3.5 minutes
            speaker: 'Lisa Park (Design)',
            text: 'From a user experience perspective, we\'ve received numerous complaints about the mobile app navigation. Users find it confusing to switch between modules. I propose we simplify the navigation structure and introduce a bottom tab bar for quick access to key features. This would significantly improve user engagement.',
            sentiment: -0.1,
        },
        {
            meetingId: 1,
            startMs: 570001,
            endMs: 780000, // 3.5 minutes
            speaker: 'David Kumar (Product)',
            text: 'Great feedback from both of you. Regarding integrations, we\'re seeing increased demand for Salesforce and HubSpot connectors. Our competitors already offer these, and we\'re losing potential enterprise clients because of this gap. We need to include this in our Q4 roadmap or risk losing market share.',
            sentiment: -0.4,
        },
        {
            meetingId: 1,
            startMs: 780001,
            endMs: 1020000, // 4 minutes
            speaker: 'Sarah Chen (PM)',
            text: 'Thanks David, that\'s a critical point. Looking at our resources, we can tackle performance optimization and the mobile navigation redesign simultaneously. For integrations, we might need to bring in additional contractors. Jennifer, what\'s the budget situation for external resources this quarter?',
            sentiment: 0.1,
        },
        {
            meetingId: 1,
            startMs: 1020001,
            endMs: 1200000, // 3 minutes
            speaker: 'Jennifer Wu (Support Lead)',
            text: 'We have about $75,000 allocated for Q4 contractor expenses. However, I\'d recommend we also consider the support implications. New integrations mean support training and documentation. We should allocate at least $15,000 of that budget to ensuring our support team can handle integration-related queries effectively.',
            sentiment: 0.2,
        },
        {
            meetingId: 1,
            startMs: 1200001,
            endMs: 1440000, // 4 minutes
            speaker: 'Alex Thompson (Manager)',
            text: 'Excellent points everyone. Based on this discussion, I see three priorities emerging: 1) Performance optimization as our immediate technical debt, 2) Mobile UX improvements to boost user retention, and 3) Integration capabilities for enterprise clients. Let\'s assign owners and set deadlines. Sarah and Mike, can you work together on the performance roadmap by next Friday?',
            sentiment: 0.4,
        },
        {
            meetingId: 1,
            startMs: 1440001,
            endMs: 2700000, // 21 minutes
            speaker: 'Rachel Green (Analyst)',
            text: 'I\'ll take on the market analysis for integration priorities. Based on customer surveys and competitor analysis, Salesforce integration is most requested, followed by HubSpot and Microsoft Teams. I\'ll have the market research report ready by next Tuesday. Also, I suggest we implement A/B testing for the mobile navigation changes to measure impact before full rollout.',
            sentiment: 0.5,
        },
        // Meeting 2 - Support Review (6 segments, 30 minutes total)
        {
            meetingId: 2,
            startMs: 0,
            endMs: 240000, // 4 minutes
            speaker: 'Jennifer Wu (Support Lead)',
            text: 'Let\'s review our Q4 support metrics. Total ticket volume increased by 18% compared to Q3, with an average resolution time of 4.2 hours. The positive news is that our customer satisfaction score improved to 4.6 out of 5. The main complaints are still about the account setup process and report generation timeouts.',
            sentiment: 0.2,
        },
        {
            meetingId: 2,
            startMs: 240001,
            endMs: 480000, // 4 minutes
            speaker: 'Sarah Chen (PM)',
            text: 'Those account setup complaints align with what I\'m hearing from sales. Many prospects abandon during the trial setup because the process is too complex. I suggest we create a guided setup wizard and perhaps offer assisted onboarding for enterprise accounts. This could reduce our trial abandonment rate significantly.',
            sentiment: -0.3,
        },
        {
            meetingId: 2,
            startMs: 480001,
            endMs: 780000, // 5 minutes
            speaker: 'Mike Rodriguez (Engineering)',
            text: 'The report generation timeouts are related to the performance issues we discussed in our planning meeting. The timeout issue is specifically affecting customers with large datasets. We can implement async report generation with email notifications. Users would receive a link to download the report once it\'s ready, rather than waiting for real-time processing.',
            sentiment: 0.1,
        },
        {
            meetingId: 2,
            startMs: 780001,
            endMs: 1080000, // 5 minutes
            speaker: 'Lisa Park (Design)',
            text: 'I\'ve been working on improving the support ticket submission process. Currently, users struggle to categorize their issues correctly, leading to longer resolution times. If we implement smart categorization with predictive text and past issue suggestions, we could reduce misclassification by 30%. I\'ll prepare mockups for review by the end of the week.',
            sentiment: 0.3,
        },
        {
            meetingId: 2,
            startMs: 1080001,
            endMs: 1320000, // 4 minutes
            speaker: 'David Kumar (Product)',
            text: 'I\'d like to add that we should analyze the account types with the most support tickets. My hypothesis is that our enterprise clients have significantly different needs than individual users. By creating tiered support portals with customized features, we could improve both customer experience and our support efficiency. Jennifer, can you pull that analytics data?',
            sentiment: 0.2,
        },
        {
            meetingId: 2,
            startMs: 1320001,
            endMs: 1800000, // 8 minutes
            speaker: 'Alex Thompson (Manager)',
            text: 'Great suggestions all around. Jennifer, work with your team to implement the guided setup wizard for trial accounts. Mike, prioritize the async report generation - that\'s affecting too many customers. Lisa, continue with the support ticket redesign. David, let\'s discuss tiered support at our next strategy meeting. Our goal is to reduce ticket volume by 25% while maintaining our satisfaction scores. Quarterly review scheduled for four weeks from today.',
            sentiment: 0.6,
        },
    ];

    await db.insert(segments).values(sampleSegments);
    
    console.log('✅ Segments seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});