import pool from '../config/database';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const seed = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ─── Categories ───────────────────────────────────────────────────────────
    const categories = [
      { name: 'Technology', slug: 'technology', icon: '💻', description: 'Software, IT & tech roles' },
      { name: 'Design', slug: 'design', icon: '🎨', description: 'UI/UX, graphic & product design' },
      { name: 'Marketing', slug: 'marketing', icon: '📣', description: 'Digital marketing & growth' },
      { name: 'Finance', slug: 'finance', icon: '💰', description: 'Accounting, banking & finance' },
      { name: 'Healthcare', slug: 'healthcare', icon: '🏥', description: 'Medical & healthcare roles' },
      { name: 'Education', slug: 'education', icon: '📚', description: 'Teaching & training roles' },
      { name: 'Sales', slug: 'sales', icon: '📈', description: 'Business development & sales' },
      { name: 'Operations', slug: 'operations', icon: '⚙️', description: 'Logistics, ops & admin' },
      { name: 'Legal', slug: 'legal', icon: '⚖️', description: 'Legal & compliance roles' },
      { name: 'Human Resources', slug: 'human-resources', icon: '👥', description: 'HR, talent & people ops' },
    ];

    const categoryIds: Record<string, string> = {};
    for (const cat of categories) {
      const existing = await client.query('SELECT id FROM categories WHERE slug = $1', [cat.slug]);
      if (existing.rows.length === 0) {
        const result = await client.query(
          `INSERT INTO categories (name, slug, icon, description)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [cat.name, cat.slug, cat.icon, cat.description]
        );
        categoryIds[cat.slug] = result.rows[0].id;
        console.log(`  ✓ Category: ${cat.name}`);
      } else {
        categoryIds[cat.slug] = existing.rows[0].id;
        console.log(`  → Category exists: ${cat.name}`);
      }
    }

    // ─── Admin User ───────────────────────────────────────────────────────────
    const adminEmail = 'admin@hirenest.io';
    const existingAdmin = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    let adminId: string;

    if (existingAdmin.rows.length === 0) {
      const adminHash = await bcrypt.hash('Admin@123', 12);
      const adminResult = await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'admin') RETURNING id`,
        ['Admin User', adminEmail, adminHash]
      );
      adminId = adminResult.rows[0].id;
      console.log('  ✓ Admin user created: admin@hirenest.io / Admin@123');
    } else {
      adminId = existingAdmin.rows[0].id;
      console.log('  → Admin user exists');
    }

    // ─── Demo User ────────────────────────────────────────────────────────────
    const userEmail = 'john@example.com';
    const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    let demoUserId: string;

    if (existingUser.rows.length === 0) {
      const userHash = await bcrypt.hash('User@123', 12);
      const userResult = await client.query(
        `INSERT INTO users (name, email, password_hash, role, phone)
         VALUES ($1, $2, $3, 'user', $4) RETURNING id`,
        ['John Doe', userEmail, userHash, '+1-555-0100']
      );
      demoUserId = userResult.rows[0].id;
      console.log('  ✓ Demo user created: john@example.com / User@123');
    } else {
      demoUserId = existingUser.rows[0].id;
      console.log('  → Demo user exists');
    }

    // ─── Jobs ─────────────────────────────────────────────────────────────────
    const jobs = [
      {
        title: 'Senior React Developer',
        company: 'TechVision Inc.',
        location: 'San Francisco, CA',
        job_type: 'full-time',
        experience_level: 'senior',
        category_slug: 'technology',
        description: 'We are looking for a Senior React Developer to join our product team and help build world-class web applications. You will collaborate with designers, backend engineers, and product managers to deliver high-quality features.',
        requirements: ['5+ years of React experience', 'Strong TypeScript skills', 'Experience with Redux/Zustand', 'Familiarity with REST APIs & GraphQL', 'Understanding of web performance optimization'],
        responsibilities: ['Build and maintain React applications', 'Write clean, maintainable TypeScript code', 'Collaborate with cross-functional teams', 'Conduct code reviews', 'Mentor junior developers'],
        skills: ['React', 'TypeScript', 'Redux', 'GraphQL', 'Tailwind CSS', 'Jest'],
        salary_min: 120000, salary_max: 160000, salary_currency: 'USD',
        is_featured: true,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Full Stack Engineer',
        company: 'CloudBase Systems',
        location: 'Remote',
        job_type: 'remote',
        experience_level: 'mid',
        category_slug: 'technology',
        description: 'Join our distributed team building scalable SaaS products. You will work on both frontend and backend systems, contributing to architecture decisions and day-to-day feature development.',
        requirements: ['3+ years of full-stack experience', 'Proficiency in Node.js and React', 'PostgreSQL or similar RDBMS', 'Docker and basic DevOps knowledge'],
        responsibilities: ['Develop end-to-end features', 'Design and implement APIs', 'Optimize database queries', 'Participate in sprint planning'],
        skills: ['Node.js', 'React', 'PostgreSQL', 'Docker', 'AWS', 'TypeScript'],
        salary_min: 90000, salary_max: 130000, salary_currency: 'USD',
        is_featured: true,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'UI/UX Designer',
        company: 'PixelCraft Studio',
        location: 'New York, NY',
        job_type: 'full-time',
        experience_level: 'mid',
        category_slug: 'design',
        description: 'We need a talented UI/UX Designer to craft intuitive and beautiful user experiences for our suite of productivity tools used by over 1 million users worldwide.',
        requirements: ['3+ years in UI/UX design', 'Figma mastery', 'Experience with design systems', 'Portfolio showcasing web/mobile work'],
        responsibilities: ['Create wireframes, prototypes & final designs', 'Conduct user research', 'Maintain and evolve the design system', 'Collaborate with engineering'],
        skills: ['Figma', 'Design Systems', 'Prototyping', 'User Research', 'Adobe XD'],
        salary_min: 80000, salary_max: 110000, salary_currency: 'USD',
        is_featured: true,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'DevOps Engineer',
        company: 'Nexus Cloud',
        location: 'Austin, TX',
        job_type: 'full-time',
        experience_level: 'senior',
        category_slug: 'technology',
        description: 'Drive reliability and automation across our cloud infrastructure. You will manage CI/CD pipelines, Kubernetes clusters, and work closely with engineering teams to ensure 99.99% uptime.',
        requirements: ['4+ years DevOps/SRE experience', 'Kubernetes and Docker', 'Terraform IaC', 'AWS or GCP expertise', 'Strong scripting (Bash/Python)'],
        responsibilities: ['Manage cloud infrastructure', 'Build and maintain CI/CD pipelines', 'Implement monitoring and alerting', 'On-call rotation'],
        skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'GitHub Actions', 'Prometheus'],
        salary_min: 130000, salary_max: 170000, salary_currency: 'USD',
        is_featured: false,
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Digital Marketing Manager',
        company: 'GrowthLab Agency',
        location: 'Chicago, IL',
        job_type: 'full-time',
        experience_level: 'mid',
        category_slug: 'marketing',
        description: 'Lead our digital marketing strategy across paid, organic, and social channels. You will own performance metrics and drive customer acquisition at scale.',
        requirements: ['4+ years digital marketing experience', 'Google Ads & Meta Ads certified', 'SEO/SEM expertise', 'Strong analytical skills', 'Experience with marketing automation tools'],
        responsibilities: ['Manage paid campaigns across channels', 'Drive SEO strategy', 'Oversee content marketing', 'Report on KPIs weekly'],
        skills: ['Google Ads', 'Meta Ads', 'SEO', 'HubSpot', 'Google Analytics', 'Content Strategy'],
        salary_min: 70000, salary_max: 95000, salary_currency: 'USD',
        is_featured: false,
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Product Manager',
        company: 'InnovateTech',
        location: 'Boston, MA',
        job_type: 'full-time',
        experience_level: 'senior',
        category_slug: 'technology',
        description: 'Define and execute the product roadmap for our B2B SaaS platform. You will work at the intersection of business, design, and engineering to ship products users love.',
        requirements: ['5+ years product management experience', 'Experience with Agile/Scrum', 'Strong data analysis skills', 'Technical background preferred'],
        responsibilities: ['Own the product roadmap', 'Write detailed PRDs', 'Coordinate cross-functional releases', 'Gather and prioritize user feedback'],
        skills: ['Product Strategy', 'Agile', 'Jira', 'SQL', 'Data Analysis', 'Roadmapping'],
        salary_min: 110000, salary_max: 150000, salary_currency: 'USD',
        is_featured: true,
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Backend Node.js Developer',
        company: 'DataStream Labs',
        location: 'Seattle, WA',
        job_type: 'full-time',
        experience_level: 'mid',
        category_slug: 'technology',
        description: 'Build robust and scalable backend services for our real-time analytics platform processing millions of events per day.',
        requirements: ['3+ years Node.js/TypeScript', 'PostgreSQL and Redis experience', 'REST API design principles', 'Message queues (RabbitMQ/Kafka)'],
        responsibilities: ['Build and maintain microservices', 'Design database schemas', 'Optimize query performance', 'Write unit and integration tests'],
        skills: ['Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Kafka', 'Docker'],
        salary_min: 95000, salary_max: 125000, salary_currency: 'USD',
        is_featured: false,
        deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'HR Business Partner',
        company: 'PeopleFirst Corp',
        location: 'Atlanta, GA',
        job_type: 'full-time',
        experience_level: 'mid',
        category_slug: 'human-resources',
        description: 'Partner with business leaders to drive talent strategy, organizational development, and employee engagement initiatives across the company.',
        requirements: ['4+ years HR generalist/HRBP experience', 'PHR or SPHR certification preferred', 'Experience with HRIS systems', 'Strong communication and coaching skills'],
        responsibilities: ['Advise managers on HR best practices', 'Lead talent review processes', 'Drive DEI initiatives', 'Manage employee relations cases'],
        skills: ['Talent Management', 'Employee Relations', 'HRIS', 'Coaching', 'DEI', 'Workday'],
        salary_min: 75000, salary_max: 100000, salary_currency: 'USD',
        is_featured: false,
        deadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Frontend React Intern',
        company: 'StartupHub',
        location: 'Remote',
        job_type: 'internship',
        experience_level: 'entry',
        category_slug: 'technology',
        description: 'Great opportunity for a student or recent graduate to gain hands-on experience building real products with a fast-moving startup team.',
        requirements: ['Basic React knowledge', 'HTML/CSS/JavaScript fundamentals', 'Eagerness to learn', 'Available for 6 months'],
        responsibilities: ['Build UI components', 'Fix bugs and write tests', 'Participate in standups', 'Document your work'],
        skills: ['React', 'JavaScript', 'CSS', 'Git'],
        salary_min: 2000, salary_max: 3000, salary_currency: 'USD',
        is_featured: false,
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Data Scientist',
        company: 'Analytix AI',
        location: 'San Jose, CA',
        job_type: 'full-time',
        experience_level: 'senior',
        category_slug: 'technology',
        description: 'Apply ML and statistical techniques to extract insights from large datasets and build predictive models for our AI-powered products.',
        requirements: ['5+ years data science experience', 'Python and R proficiency', 'Machine learning frameworks (TensorFlow/PyTorch)', 'Strong statistics background', 'Experience with big data tools'],
        responsibilities: ['Build and deploy ML models', 'Conduct exploratory data analysis', 'Collaborate with product teams', 'Present findings to stakeholders'],
        skills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'Spark', 'Statistics', 'Tableau'],
        salary_min: 140000, salary_max: 180000, salary_currency: 'USD',
        is_featured: true,
        deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const job of jobs) {
      const existing = await client.query(
        'SELECT id FROM jobs WHERE title = $1 AND company = $2',
        [job.title, job.company]
      );
      if (existing.rows.length === 0) {
        await client.query(
          `INSERT INTO jobs (
            title, company, location, job_type, experience_level, category_id,
            description, requirements, responsibilities, skills,
            salary_min, salary_max, salary_currency, is_featured, deadline, created_by
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
          [
            job.title, job.company, job.location, job.job_type,
            job.experience_level, categoryIds[job.category_slug],
            job.description, job.requirements, job.responsibilities, job.skills,
            job.salary_min, job.salary_max, job.salary_currency,
            job.is_featured, job.deadline, adminId,
          ]
        );
        console.log(`  ✓ Job: ${job.title} @ ${job.company}`);
      } else {
        console.log(`  → Job exists: ${job.title}`);
      }
    }

    // ─── Demo application ─────────────────────────────────────────────────────
    const firstJob = await client.query('SELECT id FROM jobs LIMIT 1');
    if (firstJob.rows.length > 0 && demoUserId) {
      const existingApp = await client.query(
        'SELECT id FROM applications WHERE job_id = $1 AND user_id = $2',
        [firstJob.rows[0].id, demoUserId]
      );
      if (existingApp.rows.length === 0) {
        await client.query(
          `INSERT INTO applications (job_id, user_id, cover_letter, status)
           VALUES ($1, $2, $3, 'pending')`,
          [firstJob.rows[0].id, demoUserId, 'I am very excited about this opportunity and believe my skills are a great match.']
        );
        console.log('  ✓ Demo application created');
      }
    }

    await client.query('COMMIT');
    console.log('\n🌱 Seed data inserted successfully');
    console.log('\nCredentials:');
    console.log('  Admin → admin@hirenest.io / Admin@123');
    console.log('  User  → john@example.com / User@123');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
