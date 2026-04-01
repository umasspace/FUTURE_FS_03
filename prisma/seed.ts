import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const MONTHS_BACK = 6;

function monthsAgo(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

export async function seedDatabase() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await db.activity.deleteMany();
  await db.task.deleteMany();
  await db.deal.deleteMany();
  await db.contact.deleteMany();
  await db.company.deleteMany();
  await db.user.deleteMany();
  console.log('🗑️  Cleared existing data');

  // ─── ADMIN USER ───
  await db.user.create({
    data: {
      name: 'Admin',
      email: 'admin@umascrm.com',
      password: 'admin123',
      role: 'admin',
    },
  });
  console.log('👤 Created admin user (admin@umascrm.com / admin123)');

  // ─── COMPANIES ───
  const companies = await db.company.createMany({
    data: [
      {
        name: 'Tata Consultancy Services',
        industry: 'Information Technology',
        website: 'https://tcs.com',
        employees: 616000,
        annualRevenue: 240_000_000_000,
        description: 'Leading global IT services, consulting, and business solutions organization.',
      },
      {
        name: 'Infosys Limited',
        industry: 'Information Technology',
        website: 'https://infosys.com',
        employees: 312000,
        annualRevenue: 180_000_000_000,
        description: 'Global leader in next-generation digital services and consulting.',
      },
      {
        name: 'Wipro Technologies',
        industry: 'Information Technology',
        website: 'https://wipro.com',
        employees: 240000,
        annualRevenue: 90_000_000_000,
        description: 'Leading technology services and consulting company focused on innovation.',
      },
      {
        name: 'Reliance Industries',
        industry: 'Conglomerate',
        website: 'https://ril.com',
        employees: 350000,
        annualRevenue: 950_000_000_000,
        description: 'Diversified conglomerate with interests in energy, petrochemicals, retail, and telecom.',
      },
      {
        name: 'Razorpay Software',
        industry: 'Fintech',
        website: 'https://razorpay.com',
        employees: 1500,
        annualRevenue: 2_500_000_000,
        description: 'Full-stack financial solutions company powering payments for businesses.',
      },
    ],
  });

  const allCompanies = await db.company.findMany();

  // ─── CONTACTS ───
  const contactsData = [
    // Tata Consultancy Services contacts
    { firstName: 'Arjun', lastName: 'Sharma', email: 'arjun.sharma@tcs.com', phone: '+91-98450-12301', jobTitle: 'VP of Engineering', status: 'customer', companyId: allCompanies[0].id },
    { firstName: 'Priya', lastName: 'Iyer', email: 'priya.iyer@tcs.com', phone: '+91-98450-12302', jobTitle: 'CTO', status: 'customer', companyId: allCompanies[0].id },
    { firstName: 'Karthik', lastName: 'Raman', email: 'karthik.raman@tcs.com', phone: '+91-98450-12303', jobTitle: 'Engineering Manager', status: 'prospect', companyId: allCompanies[0].id },

    // Infosys contacts
    { firstName: 'Deepika', lastName: 'Nair', email: 'deepika.nair@infosys.com', phone: '+91-98800-45001', jobTitle: 'Director of IT', status: 'customer', companyId: allCompanies[1].id },
    { firstName: 'Rahul', lastName: 'Mehta', email: 'rahul.mehta@infosys.com', phone: '+91-98800-45002', jobTitle: 'CFO', status: 'prospect', companyId: allCompanies[1].id },
    { firstName: 'Sneha', lastName: 'Gupta', email: 'sneha.gupta@infosys.com', phone: '+91-98800-45003', jobTitle: 'Product Manager', status: 'lead', companyId: allCompanies[1].id },

    // Wipro contacts
    { firstName: 'Vikram', lastName: 'Patel', email: 'vikram.patel@wipro.com', phone: '+91-97400-67001', jobTitle: 'CEO', status: 'customer', companyId: allCompanies[2].id },
    { firstName: 'Ananya', lastName: 'Reddy', email: 'ananya.reddy@wipro.com', phone: '+91-97400-67002', jobTitle: 'Sales Director', status: 'lead', companyId: allCompanies[2].id },
    { firstName: 'Rohan', lastName: 'Desai', email: 'rohan.desai@wipro.com', phone: '+91-97400-67003', jobTitle: 'Developer', status: 'inactive', companyId: allCompanies[2].id },

    // Reliance Industries contacts
    { firstName: 'Amit', lastName: 'Kapoor', email: 'amit.kapoor@ril.com', phone: '+91-98200-89001', jobTitle: 'VP of Sales', status: 'customer', companyId: allCompanies[3].id },
    { firstName: 'Neha', lastName: 'Singh', email: 'neha.singh@ril.com', phone: '+91-98200-89002', jobTitle: 'Head of Procurement', status: 'prospect', companyId: allCompanies[3].id },
    { firstName: 'Sanjay', lastName: 'Verma', email: 'sanjay.verma@ril.com', phone: '+91-98200-89003', jobTitle: 'Solutions Architect', status: 'lead', companyId: allCompanies[3].id },

    // Razorpay contacts
    { firstName: 'Harshil', lastName: 'Mathur', email: 'harshil.mathur@razorpay.com', phone: '+91-99000-23001', jobTitle: 'CEO & Founder', status: 'customer', companyId: allCompanies[4].id },
    { firstName: 'Shashank', lastName: 'Kumar', email: 'shashank.kumar@razorpay.com', phone: '+91-99000-23002', jobTitle: 'Lead Developer', status: 'customer', companyId: allCompanies[4].id },
    { firstName: 'Ravi', lastName: 'Tejwani', email: 'ravi.tejwani@razorpay.com', phone: '+91-99000-23003', jobTitle: 'COO', status: 'prospect', companyId: allCompanies[4].id },
  ];

  await db.contact.createMany({ data: contactsData });
  const allContacts = await db.contact.findMany();
  console.log(`👥 Created ${allContacts.length} contacts`);

  // ─── DEALS (values in INR - lakhs/crores range) ───
  const dealsData = [
    // Tata Consultancy Services deals
    { title: 'Enterprise Platform License', value: 20000000, stage: 'closed_won', probability: 100, expectedCloseDate: monthsAgo(4), description: 'Full enterprise license for TCS platform suite.', contactId: allContacts[0].id, companyId: allCompanies[0].id },
    { title: 'Cloud Migration Phase 2', value: 15000000, stage: 'negotiation', probability: 75, expectedCloseDate: daysFromNow(30), description: 'Second phase of cloud infrastructure migration.', contactId: allContacts[1].id, companyId: allCompanies[0].id },
    { title: 'DevOps Tooling Package', value: 3500000, stage: 'proposal', probability: 50, expectedCloseDate: daysFromNow(60), description: 'DevOps automation and monitoring tooling.', contactId: allContacts[2].id, companyId: allCompanies[0].id },

    // Infosys deals
    { title: 'Payment Gateway Integration', value: 25000000, stage: 'closed_won', probability: 100, expectedCloseDate: monthsAgo(2), description: 'Custom payment gateway solution for digital transactions.', contactId: allContacts[3].id, companyId: allCompanies[1].id },
    { title: 'Risk Assessment Platform', value: 12000000, stage: 'qualified', probability: 40, expectedCloseDate: daysFromNow(90), description: 'AI-powered financial risk assessment system.', contactId: allContacts[4].id, companyId: allCompanies[1].id },

    // Wipro deals
    { title: 'IT Consulting Retainer', value: 7000000, stage: 'closed_won', probability: 100, expectedCloseDate: monthsAgo(1), description: 'Annual IT consulting retainer agreement.', contactId: allContacts[6].id, companyId: allCompanies[2].id },
    { title: 'Staff Augmentation', value: 9000000, stage: 'lead', probability: 15, expectedCloseDate: daysFromNow(120), description: 'Staff augmentation for their engineering team.', contactId: allContacts[7].id, companyId: allCompanies[2].id },

    // Reliance Industries deals
    { title: 'Data Analytics Platform', value: 40000000, stage: 'closed_lost', probability: 0, expectedCloseDate: monthsAgo(3), description: 'Lost to competitor. Data analytics and BI platform.', contactId: allContacts[9].id, companyId: allCompanies[3].id },
    { title: 'Security Audit', value: 6000000, stage: 'proposal', probability: 55, expectedCloseDate: daysFromNow(45), description: 'Comprehensive cybersecurity audit and remediation.', contactId: allContacts[10].id, companyId: allCompanies[3].id },
    { title: 'API Gateway Solution', value: 16000000, stage: 'negotiation', probability: 70, expectedCloseDate: daysFromNow(20), description: 'Enterprise API gateway with rate limiting and analytics.', contactId: allContacts[9].id, companyId: allCompanies[3].id },

    // Razorpay deals
    { title: 'SDK License Agreement', value: 2500000, stage: 'closed_won', probability: 100, expectedCloseDate: monthsAgo(5), description: 'SDK license for payment integration.', contactId: allContacts[12].id, companyId: allCompanies[4].id },
    { title: 'Series C Investment', value: 50000000, stage: 'qualified', probability: 30, expectedCloseDate: daysFromNow(150), description: 'Investment deal for Series C funding round.', contactId: allContacts[12].id, companyId: allCompanies[4].id },
  ];

  await db.deal.createMany({ data: dealsData });
  const allDeals = await db.deal.findMany();
  console.log(`💰 Created ${allDeals.length} deals`);

  // ─── TASKS ───
  const tasksData = [
    // TCS tasks
    { title: 'Prepare proposal for Cloud Migration', description: 'Draft the technical proposal and pricing for Phase 2.', status: 'in_progress', priority: 'high', dueDate: daysFromNow(5), contactId: allContacts[0].id, dealId: allDeals[1].id },
    { title: 'Schedule demo with engineering team', description: 'Set up a product demo for TCS engineering team.', status: 'todo', priority: 'medium', dueDate: daysFromNow(10), contactId: allContacts[2].id, dealId: allDeals[2].id },
    { title: 'Follow up on contract signing', description: 'Ensure final contract is signed and processed.', status: 'completed', priority: 'high', dueDate: daysAgo(2), contactId: allContacts[1].id, dealId: allDeals[0].id },

    // Infosys tasks
    { title: 'Send revised proposal', description: 'Update pricing and send revised proposal to Rahul.', status: 'todo', priority: 'high', dueDate: daysFromNow(3), contactId: allContacts[4].id, dealId: allDeals[4].id },
    { title: 'Gather technical requirements', description: 'Collect detailed requirements for the risk assessment platform.', status: 'in_progress', priority: 'medium', dueDate: daysFromNow(7), contactId: allContacts[3].id, dealId: allDeals[4].id },
    { title: 'Onboarding call setup', description: 'Schedule onboarding call for the payment gateway project.', status: 'completed', priority: 'urgent', dueDate: daysAgo(5), contactId: allContacts[3].id, dealId: allDeals[3].id },

    // Wipro tasks
    { title: 'Monthly check-in call', description: 'Regular monthly status check-in with Vikram.', status: 'todo', priority: 'medium', dueDate: daysFromNow(14), contactId: allContacts[6].id, dealId: allDeals[5].id },
    { title: 'Create case study', description: 'Write a case study based on the consulting engagement.', status: 'in_progress', priority: 'low', dueDate: daysFromNow(21), contactId: allContacts[6].id, dealId: allDeals[5].id },
    { title: 'Follow up on staff augmentation inquiry', description: 'Reach out to Ananya about the staff augmentation opportunity.', status: 'todo', priority: 'high', dueDate: daysFromNow(2), contactId: allContacts[7].id, dealId: allDeals[6].id },

    // Reliance tasks
    { title: 'Prepare security audit scope', description: 'Define the scope and timeline for the security audit.', status: 'in_progress', priority: 'urgent', dueDate: daysFromNow(4), contactId: allContacts[10].id, dealId: allDeals[8].id },
    { title: 'Negotiate API gateway pricing', description: 'Finalize pricing structure for the API gateway deal.', status: 'todo', priority: 'high', dueDate: daysFromNow(8), contactId: allContacts[9].id, dealId: allDeals[9].id },
    { title: 'Post-mortem on lost deal', description: 'Conduct analysis on why the Data Analytics deal was lost.', status: 'completed', priority: 'medium', dueDate: daysAgo(10), contactId: allContacts[9].id, dealId: allDeals[7].id },

    // Razorpay tasks
    { title: 'SDK documentation review', description: 'Review and approve the SDK documentation.', status: 'completed', priority: 'medium', dueDate: daysAgo(15), contactId: allContacts[12].id, dealId: allDeals[10].id },
    { title: 'Prepare investor deck', description: 'Create presentation deck for Series C investors.', status: 'in_progress', priority: 'high', dueDate: daysFromNow(12), contactId: allContacts[12].id, dealId: allDeals[11].id },
    { title: 'Follow up with Ravi on scaling plans', description: 'Check in on progress of operational scaling plans.', status: 'todo', priority: 'low', dueDate: daysFromNow(30), contactId: allContacts[14].id, dealId: allDeals[11].id },

    // General tasks (no deal)
    { title: 'Update CRM contact records', description: 'Review and update outdated contact information across all accounts.', status: 'todo', priority: 'low', dueDate: daysFromNow(7), contactId: null, dealId: null },
    { title: 'Q3 sales report', description: 'Compile Q3 sales performance report.', status: 'completed', priority: 'medium', dueDate: daysAgo(7), contactId: null, dealId: null },
    { title: 'Prepare for tech conference', description: 'Organize booth materials and demo setup for upcoming tech conference.', status: 'in_progress', priority: 'medium', dueDate: daysFromNow(18), contactId: null, dealId: null },
    { title: 'Review competitor analysis', description: 'Update competitive landscape analysis document.', status: 'cancelled', priority: 'low', dueDate: daysAgo(3), contactId: null, dealId: null },
  ];

  await db.task.createMany({ data: tasksData });
  const allTasks = await db.task.findMany();
  console.log(`✅ Created ${allTasks.length} tasks`);

  // ─── ACTIVITIES ───
  const activitiesData = [
    { type: 'call', title: 'Discovery call with Arjun', description: 'Discussed Cloud Migration Phase 2 requirements and timeline.', contactId: allContacts[0].id, dealId: allDeals[1].id, taskId: null },
    { type: 'email', title: 'Proposal sent to Priya', description: 'Sent updated Cloud Migration proposal with revised pricing.', contactId: allContacts[1].id, dealId: allDeals[1].id, taskId: null },
    { type: 'meeting', title: 'Demo with TCS engineering team', description: 'Product walkthrough demo for the DevOps tooling package.', contactId: allContacts[2].id, dealId: allDeals[2].id, taskId: allTasks[1].id },
    { type: 'note', title: 'TCS - positive feedback', description: 'Arjun mentioned they are very happy with Phase 1 and eager to proceed.', contactId: allContacts[0].id, dealId: allDeals[1].id, taskId: null },
    { type: 'deal_update', title: 'Deal moved to negotiation', description: 'Cloud Migration Phase 2 moved from proposal to negotiation stage.', contactId: allContacts[0].id, dealId: allDeals[1].id, taskId: null },
    { type: 'call', title: 'Follow-up with Deepika Nair', description: 'Discussed technical requirements for risk assessment platform.', contactId: allContacts[3].id, dealId: allDeals[4].id, taskId: allTasks[4].id },
    { type: 'email', title: 'Contract sent to Rahul Mehta', description: 'Sent final contract for the payment gateway project review.', contactId: allContacts[4].id, dealId: allDeals[3].id, taskId: null },
    { type: 'meeting', title: 'Quarterly business review with Vikram', description: 'Discussed Q3 performance and Q4 roadmap.', contactId: allContacts[6].id, dealId: allDeals[5].id, taskId: allTasks[6].id },
    { type: 'note', title: 'Wipro - budget concerns', description: 'Vikram mentioned budget constraints may affect future engagements.', contactId: allContacts[6].id, dealId: null, taskId: null },
    { type: 'deal_update', title: 'Deal closed won - IT Consulting', description: 'IT Consulting Retainer deal signed and closed successfully.', contactId: allContacts[6].id, dealId: allDeals[5].id, taskId: null },
    { type: 'call', title: 'Intro call with Amit Kapoor', description: 'Initial introduction call. Discussed security audit scope.', contactId: allContacts[9].id, dealId: allDeals[8].id, taskId: allTasks[10].id },
    { type: 'email', title: 'API Gateway proposal to Neha', description: 'Sent detailed API Gateway solution proposal with pricing tiers.', contactId: allContacts[10].id, dealId: allDeals[9].id, taskId: null },
    { type: 'meeting', title: 'Post-mortem discussion', description: 'Reviewed the lost Data Analytics Platform deal. Key issue was pricing.', contactId: allContacts[9].id, dealId: allDeals[7].id, taskId: allTasks[11].id },
    { type: 'note', title: 'Reliance - strong interest in API Gateway', description: 'Amit expressed strong interest in the API Gateway solution after demo.', contactId: allContacts[9].id, dealId: allDeals[9].id, taskId: null },
    { type: 'call', title: 'Investor pitch with Harshil', description: 'Discussed Series C terms and growth projections.', contactId: allContacts[12].id, dealId: allDeals[11].id, taskId: allTasks[14].id },
    { type: 'email', title: 'SDK delivery confirmation', description: 'Confirmed successful delivery and integration of the payment SDK.', contactId: allContacts[12].id, dealId: allDeals[11].id, taskId: allTasks[13].id },
    { type: 'task_update', title: 'Proposal preparation completed', description: 'Cloud Migration Phase 2 proposal is finalized and ready for review.', contactId: null, dealId: allDeals[1].id, taskId: allTasks[0].id },
  ];

  await db.activity.createMany({ data: activitiesData });
  console.log(`📝 Created ${activitiesData.length} activities`);

  console.log('✅ Seed completed successfully!');
}
