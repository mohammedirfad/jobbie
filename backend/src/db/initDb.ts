/**
 * initDb.ts — runs migrations + seeds on every server startup.
 *
 * Safe to call from index.ts because it uses the shared pool (does NOT call pool.end()).
 * Uses CREATE TABLE IF NOT EXISTS so migrations are fully idempotent.
 * Seed is skipped if data already exists.
 */

import { query, testConnection } from '../config/database';
import bcrypt from 'bcryptjs';

// ─── Migrations ───────────────────────────────────────────────────────────────
export const runMigrations = async (): Promise<void> => {
  console.log('🔄 Running migrations…');

  await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
      avatar_url TEXT,
      phone VARCHAR(20),
      resume_url TEXT,
      refresh_token TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) UNIQUE NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      icon VARCHAR(100),
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS jobs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      company_logo TEXT,
      location VARCHAR(255) NOT NULL,
      job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('full-time','part-time','contract','internship','remote')),
      experience_level VARCHAR(50) NOT NULL CHECK (experience_level IN ('entry','mid','senior','lead','executive')),
      category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
      description TEXT NOT NULL,
      requirements TEXT[] DEFAULT '{}',
      responsibilities TEXT[] DEFAULT '{}',
      skills TEXT[] DEFAULT '{}',
      salary_min INTEGER,
      salary_max INTEGER,
      salary_currency VARCHAR(10) DEFAULT 'USD',
      is_featured BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      deadline TIMESTAMPTZ,
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      view_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS applications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      applicant_name VARCHAR(255),
      applicant_email VARCHAR(255),
      applicant_phone VARCHAR(50),
      cover_letter TEXT,
      resume_url TEXT,
      resume_filename VARCHAR(500),
      status VARCHAR(50) DEFAULT 'pending' CHECK (
        status IN ('pending','reviewing','shortlisted','rejected','hired')
      ),
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(job_id, user_id)
    )
  `);

  const indexes = [
    `CREATE INDEX IF NOT EXISTS idx_jobs_category   ON jobs(category_id)`,
    `CREATE INDEX IF NOT EXISTS idx_jobs_active      ON jobs(is_active)`,
    `CREATE INDEX IF NOT EXISTS idx_jobs_featured    ON jobs(is_featured)`,
    `CREATE INDEX IF NOT EXISTS idx_jobs_experience  ON jobs(experience_level)`,
    `CREATE INDEX IF NOT EXISTS idx_jobs_type        ON jobs(job_type)`,
    `CREATE INDEX IF NOT EXISTS idx_apps_user        ON applications(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_apps_job         ON applications(job_id)`,
    `CREATE INDEX IF NOT EXISTS idx_users_email      ON users(email)`,
  ];
  for (const idx of indexes) await query(idx);

  await query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
    $$ language 'plpgsql'
  `);
  for (const tbl of ['users', 'jobs', 'applications']) {
    await query(`
      DROP TRIGGER IF EXISTS update_${tbl}_updated_at ON ${tbl};
      CREATE TRIGGER update_${tbl}_updated_at
        BEFORE UPDATE ON ${tbl}
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);
  }

  console.log('✅ Migrations complete');
};

// ─── Seed ─────────────────────────────────────────────────────────────────────
export const runSeed = async (): Promise<void> => {
  const existing = await query('SELECT COUNT(*) FROM categories');
  if (parseInt(existing.rows[0].count) > 0) {
    console.log('⏭️  Seed already applied — skipping');
    return;
  }

  console.log('🌱 Seeding initial data…');

  const categories = [
    { name: 'Technology',      slug: 'technology',      icon: '💻', description: 'Software, IT & tech roles' },
    { name: 'Design',          slug: 'design',          icon: '🎨', description: 'UI/UX, graphic & product design' },
    { name: 'Marketing',       slug: 'marketing',       icon: '📣', description: 'Digital marketing & growth' },
    { name: 'Finance',         slug: 'finance',         icon: '💰', description: 'Accounting, banking & finance' },
    { name: 'Healthcare',      slug: 'healthcare',      icon: '🏥', description: 'Medical & healthcare roles' },
    { name: 'Education',       slug: 'education',       icon: '📚', description: 'Teaching & training roles' },
    { name: 'Sales',           slug: 'sales',           icon: '📈', description: 'Business development & sales' },
    { name: 'Operations',      slug: 'operations',      icon: '⚙️',  description: 'Logistics, ops & admin' },
    { name: 'Legal',           slug: 'legal',           icon: '⚖️',  description: 'Legal & compliance roles' },
    { name: 'Human Resources', slug: 'human-resources', icon: '👥', description: 'HR, talent & people ops' },
  ];

  const catIds: Record<string, string> = {};
  for (const c of categories) {
    const r = await query(
      `INSERT INTO categories (name, slug, icon, description)
       VALUES ($1,$2,$3,$4) RETURNING id`,
      [c.name, c.slug, c.icon, c.description]
    );
    catIds[c.slug] = r.rows[0].id;
  }

  const adminHash = await bcrypt.hash('Admin@123', 12);
  const adminRes = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1,$2,$3,'admin') RETURNING id`,
    ['Admin User', 'admin@hirenest.io', adminHash]
  );
  const adminId = adminRes.rows[0].id;

  const userHash = await bcrypt.hash('User@123', 12);
  const userRes = await query(
    `INSERT INTO users (name, email, password_hash, role, phone)
     VALUES ($1,$2,$3,'user',$4) RETURNING id`,
    ['John Doe', 'john@example.com', userHash, '+1-555-0100']
  );
  const demoUserId = userRes.rows[0].id;

  const jobs = [
    {
      title: 'Senior React Developer', company: 'TechVision Inc.', location: 'San Francisco, CA',
      job_type: 'full-time', experience_level: 'senior', category_slug: 'technology',
      description: 'We are looking for a Senior React Developer to join our product team and help build world-class web applications.',
      requirements: ['5+ years of React experience','Strong TypeScript skills','Experience with Redux/Zustand'],
      responsibilities: ['Build and maintain React applications','Write clean TypeScript code','Conduct code reviews'],
      skills: ['React','TypeScript','Redux','GraphQL','Tailwind CSS'],
      salary_min: 120000, salary_max: 160000, is_featured: true,
    },
    {
      title: 'Full Stack Engineer', company: 'CloudBase Systems', location: 'Remote',
      job_type: 'remote', experience_level: 'mid', category_slug: 'technology',
      description: 'Join our distributed team building scalable SaaS products.',
      requirements: ['3+ years full-stack experience','Node.js and React proficiency','PostgreSQL experience'],
      responsibilities: ['Develop end-to-end features','Design and implement APIs','Optimize database queries'],
      skills: ['Node.js','React','PostgreSQL','Docker','AWS','TypeScript'],
      salary_min: 90000, salary_max: 130000, is_featured: true,
    },
    {
      title: 'UI/UX Designer', company: 'PixelCraft Studio', location: 'New York, NY',
      job_type: 'full-time', experience_level: 'mid', category_slug: 'design',
      description: 'We need a talented UI/UX Designer to craft intuitive and beautiful user experiences.',
      requirements: ['3+ years in UI/UX design','Figma mastery','Experience with design systems'],
      responsibilities: ['Create wireframes and prototypes','Conduct user research','Maintain the design system'],
      skills: ['Figma','Design Systems','Prototyping','User Research'],
      salary_min: 80000, salary_max: 110000, is_featured: true,
    },
    {
      title: 'DevOps Engineer', company: 'Nexus Cloud', location: 'Austin, TX',
      job_type: 'full-time', experience_level: 'senior', category_slug: 'technology',
      description: 'Drive reliability and automation across our cloud infrastructure.',
      requirements: ['4+ years DevOps/SRE experience','Kubernetes and Docker','Terraform IaC'],
      responsibilities: ['Manage cloud infrastructure','Build CI/CD pipelines','Implement monitoring'],
      skills: ['Kubernetes','Docker','Terraform','AWS','GitHub Actions'],
      salary_min: 130000, salary_max: 170000, is_featured: false,
    },
    {
      title: 'Digital Marketing Manager', company: 'GrowthLab Agency', location: 'Chicago, IL',
      job_type: 'full-time', experience_level: 'mid', category_slug: 'marketing',
      description: 'Lead our digital marketing strategy across paid, organic, and social channels.',
      requirements: ['4+ years digital marketing','Google Ads certified','SEO/SEM expertise'],
      responsibilities: ['Manage paid campaigns','Drive SEO strategy','Report on KPIs'],
      skills: ['Google Ads','Meta Ads','SEO','HubSpot','Google Analytics'],
      salary_min: 70000, salary_max: 95000, is_featured: false,
    },
    {
      title: 'Product Manager', company: 'InnovateTech', location: 'Boston, MA',
      job_type: 'full-time', experience_level: 'senior', category_slug: 'technology',
      description: 'Define and execute the product roadmap for our B2B SaaS platform.',
      requirements: ['5+ years product management','Agile/Scrum experience','Strong data analysis'],
      responsibilities: ['Own the product roadmap','Write detailed PRDs','Coordinate releases'],
      skills: ['Product Strategy','Agile','Jira','SQL','Roadmapping'],
      salary_min: 110000, salary_max: 150000, is_featured: true,
    },
    {
      title: 'Backend Node.js Developer', company: 'DataStream Labs', location: 'Seattle, WA',
      job_type: 'full-time', experience_level: 'mid', category_slug: 'technology',
      description: 'Build robust and scalable backend services for our real-time analytics platform.',
      requirements: ['3+ years Node.js/TypeScript','PostgreSQL and Redis','REST API design'],
      responsibilities: ['Build microservices','Design database schemas','Write unit tests'],
      skills: ['Node.js','TypeScript','PostgreSQL','Redis','Docker'],
      salary_min: 95000, salary_max: 125000, is_featured: false,
    },
    {
      title: 'HR Business Partner', company: 'PeopleFirst Corp', location: 'Atlanta, GA',
      job_type: 'full-time', experience_level: 'mid', category_slug: 'human-resources',
      description: 'Partner with business leaders to drive talent strategy and employee engagement.',
      requirements: ['4+ years HRBP experience','PHR certification preferred','HRIS experience'],
      responsibilities: ['Advise managers on HR best practices','Lead talent reviews','Drive DEI initiatives'],
      skills: ['Talent Management','Employee Relations','Workday','Coaching'],
      salary_min: 75000, salary_max: 100000, is_featured: false,
    },
    {
      title: 'Frontend React Intern', company: 'StartupHub', location: 'Remote',
      job_type: 'internship', experience_level: 'entry', category_slug: 'technology',
      description: 'Great opportunity for a student or recent graduate to gain hands-on experience.',
      requirements: ['Basic React knowledge','HTML/CSS/JS fundamentals','Available for 6 months'],
      responsibilities: ['Build UI components','Fix bugs','Participate in standups'],
      skills: ['React','JavaScript','CSS','Git'],
      salary_min: 2000, salary_max: 3000, is_featured: false,
    },
    {
      title: 'Data Scientist', company: 'Analytix AI', location: 'San Jose, CA',
      job_type: 'full-time', experience_level: 'senior', category_slug: 'technology',
      description: 'Apply ML and statistical techniques to extract insights from large datasets.',
      requirements: ['5+ years data science','Python and R proficiency','ML frameworks (TensorFlow/PyTorch)'],
      responsibilities: ['Build and deploy ML models','Conduct exploratory data analysis','Present findings'],
      skills: ['Python','TensorFlow','PyTorch','SQL','Spark','Statistics'],
      salary_min: 140000, salary_max: 180000, is_featured: true,
    },
  ];

  const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  for (const j of jobs) {
    await query(
      `INSERT INTO jobs (
        title, company, location, job_type, experience_level, category_id,
        description, requirements, responsibilities, skills,
        salary_min, salary_max, salary_currency, is_featured, deadline, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'USD',$13,$14,$15)`,
      [
        j.title, j.company, j.location, j.job_type, j.experience_level,
        catIds[j.category_slug], j.description,
        j.requirements, j.responsibilities, j.skills,
        j.salary_min, j.salary_max, j.is_featured, deadline, adminId,
      ]
    );
  }

  const firstJob = await query('SELECT id FROM jobs LIMIT 1');
  if (firstJob.rows.length > 0) {
    await query(
      `INSERT INTO applications (job_id, user_id, applicant_name, applicant_email, applicant_phone, cover_letter, status)
       VALUES ($1,$2,$3,$4,$5,$6,'pending')`,
      [firstJob.rows[0].id, demoUserId, 'John Doe', 'john@example.com', '+1-555-0100',
       'I am very excited about this opportunity.']
    );
  }

  console.log('✅ Seed complete');
  console.log('   Admin → admin@hirenest.io / Admin@123');
  console.log('   User  → john@example.com  / User@123');
};

// ─── Combined init (called from index.ts) ────────────────────────────────────
export const initDatabase = async (): Promise<void> => {
  // Step 1: verify we can actually reach the database.
  // This throws (and crashes the server) if the connection fails,
  // which surfaces the real error instead of silently booting without a DB.
  await testConnection();

  // Step 2: run migrations (idempotent — safe to re-run on every boot)
  await runMigrations();

  // Step 3: seed only if tables are empty
  await runSeed();
};
