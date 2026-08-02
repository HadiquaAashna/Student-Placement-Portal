import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import Student from '../models/Student.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect';
    console.log(`Connecting to database for seeding: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Student.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await Notification.deleteMany({});
    console.log('Database cleared.');

    // 1. Seed Admin User
    const adminPassword = 'admin123'; // Hashed once by the User model's pre-save hook
    const adminUser = await User.create({
      email: 'admin@placement.edu',
      password: adminPassword,
      role: 'admin',
      isApproved: true
    });
    console.log('Seeded Admin account: admin@placement.edu / admin123');

    // 2. Seed 10 Famous Companies
    const companyDetails = [
      { name: 'IBM', email: 'hr@ibm.com', industry: 'Enterprise Software & Cloud', website: 'https://ibm.com', desc: 'A global technology and consulting company offering cloud, AI, and IT infrastructure solutions.', status: 'approved' },
      { name: 'TCS', email: 'hr@tcs.com', industry: 'IT Services & Consulting', website: 'https://tcs.com', desc: 'A leading global IT services, consulting, and business solutions organization.', status: 'approved' },
      { name: 'Infosys', email: 'hr@infosys.com', industry: 'IT Services & Consulting', website: 'https://infosys.com', desc: 'A global leader in next-generation digital services and consulting.', status: 'approved' },
      { name: 'Wipro', email: 'hr@wipro.com', industry: 'IT Services & Business Process', website: 'https://wipro.com', desc: 'A leading technology services and consulting company focused on building innovative solutions.', status: 'approved' },
      { name: 'Accenture', email: 'hr@accenture.com', industry: 'Management Consulting & IT', website: 'https://accenture.com', desc: 'A global professional services company with leading capabilities in digital, cloud, and security.', status: 'approved' },
      { name: 'Google', email: 'hr@google.com', industry: 'Internet & Technology Services', website: 'https://google.com', desc: 'Focuses on search, online advertising, cloud computing, software, and hardware.', status: 'approved' },
      { name: 'Microsoft', email: 'hr@microsoft.com', industry: 'Software & Technology Solutions', website: 'https://microsoft.com', desc: 'A global developer and provider of software, devices, solutions, and cloud services.', status: 'approved' },
      { name: 'Amazon', email: 'hr@amazon.com', industry: 'E-commerce, Cloud & AI', website: 'https://amazon.com', desc: 'A multinational tech company focusing on e-commerce, cloud computing, and digital streaming.', status: 'approved' },
      { name: 'Meta', email: 'hr@meta.com', industry: 'Social Technology & Advertising', website: 'https://meta.com', desc: 'Builds technologies that help people connect, find communities, and grow businesses.', status: 'pending' }, // Let one be pending
      { name: 'Capgemini', email: 'hr@capgemini.com', industry: 'Consulting & Technology Services', website: 'https://capgemini.com', desc: 'A multicultural company offering consulting, digital transformation, and technology services.', status: 'approved' }
    ];

    const seededCompanies = [];
    const defaultPassword = 'password123'; // Hashed once by the User model's pre-save hook

    for (const comp of companyDetails) {
      const companyUser = await User.create({
        email: comp.email,
        password: defaultPassword,
        role: 'company',
        isApproved: comp.status === 'approved'
      });

      const companyProfile = await Company.create({
        user: companyUser._id,
        companyName: comp.name,
        website: comp.website,
        industry: comp.industry,
        description: comp.desc,
        logoUrl: `https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=60`, // Generic company logo
        status: comp.status
      });

      seededCompanies.push(companyProfile);
    }
    console.log(`Seeded ${seededCompanies.length} company profiles.`);

    // 3. Seed 20 Demo Students
    const studentNames = [
      'Aarav Sharma', 'Aditi Rao', 'Rohan Patel', 'Priya Singh', 'Kabir Verma',
      'Ananya Gupta', 'Vikram Malhotra', 'Sneha Iyer', 'Arjun Reddy', 'Kavya Nair',
      'Rahul Sen', 'Diya Joshi', 'Amit Das', 'Neha Trivedi', 'Siddharth Roy',
      'Pooja Nair', 'Gaurav Mehta', 'Ishaan Kapoor', 'Divya Rangan', 'Riya Chatterjee'
    ];

    const skillsPool = [
      ['React.js', 'Node.js', 'MongoDB', 'JavaScript', 'Tailwind CSS'],
      ['Python', 'Data Analysis', 'SQL', 'Pandas', 'Matplotlib'],
      ['Java', 'Spring Boot', 'MySQL', 'Data Structures', 'Algorithms'],
      ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Bash Scripting'],
      ['UI/UX Design', 'Figma', 'HTML/CSS', 'Responsive Design', 'Wireframing'],
      ['React Native', 'TypeScript', 'Redux', 'Firebase', 'Mobile Dev'],
      ['Machine Learning', 'TensorFlow', 'Python', 'NLP', 'Computer Vision'],
      ['C++', 'Embedded Systems', 'System Design', 'Algorithms', 'Operating Systems']
    ];

    const projectPool = [
      { title: 'Placement Portal', description: 'A web portal connecting graduating students with corporate recruiters.', link: 'https://github.com/placement' },
      { title: 'E-commerce API', description: 'Microservices-based backend API for a digital marketplace built with Node and Express.', link: 'https://github.com/ecom-api' },
      { title: 'Stock Predictor', description: 'Machine learning model predicting index stock prices using LSTM networks.', link: 'https://github.com/stock-lstm' },
      { title: 'Task Manager App', description: 'A productivity application with drag-and-drop support built with React and Tailwind.', link: 'https://github.com/tasker' },
      { title: 'IoT Weather Station', description: 'Firmware and interface dashboard monitoring environmental sensors using NodeMCU.', link: 'https://github.com/weather-iot' }
    ];

    const seededStudents = [];

    for (let i = 0; i < studentNames.length; i++) {
      const email = `student${i + 1}@placement.edu`;
      const name = studentNames[i];

      const studentUser = await User.create({
        email,
        password: defaultPassword,
        role: 'student',
        isApproved: true
      });

      // Distribute academic CGPA realistically
      const cgpa = (7.2 + Math.random() * 2.7).toFixed(2);
      const studentSkills = skillsPool[i % skillsPool.length];
      const studentProjects = [
        projectPool[i % projectPool.length],
        projectPool[(i + 2) % projectPool.length]
      ];

      const studentProfile = await Student.create({
        user: studentUser._id,
        fullName: name,
        phone: `+91 ${9876500000 + i}`,
        photoUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80&key=${i}`,
        resumeUrl: `/uploads/mock-resume-${i + 1}.pdf`,
        cgpa: parseFloat(cgpa),
        education: [
          { school: 'A.T. School', degree: 'High School Diploma', year: '2022' },
          { school: 'City Tech University', degree: 'B.Tech Computer Science', year: '2026' }
        ],
        skills: studentSkills,
        projects: studentProjects,
        savedJobs: []
      });

      seededStudents.push(studentProfile);
    }
    console.log(`Seeded ${seededStudents.length} student profiles.`);

    // 4. Seed 30 Realistic Job Postings
    const jobTemplates = [
      { title: 'Software Engineer Intern', type: 'internship', location: 'Bengaluru', salary: '₹35,000 / month', skills: ['React.js', 'JavaScript', 'HTML/CSS'], reqs: ['Currently pursuing B.Tech in CSE/IT', 'Good understanding of JS and DOM', 'Strong communication skills'] },
      { title: 'Associate Software Engineer', type: 'full-time', location: 'Hyderabad', salary: '₹8,50,000 / annum', skills: ['Java', 'Spring Boot', 'MySQL'], reqs: ['Graduating by 2026', 'Strong problem solving and DS/Algo foundation', 'Knowledge of relational databases'] },
      { title: 'Frontend Developer', type: 'full-time', location: 'Pune', salary: '₹7,20,000 / annum', skills: ['React.js', 'TypeScript', 'Tailwind CSS'], reqs: ['Familiarity with state management libraries', 'Experience building responsive layouts', 'Strong frontend testing skills'] },
      { title: 'Backend Developer', type: 'full-time', location: 'Noida', salary: '₹9,00,000 / annum', skills: ['Node.js', 'Express.js', 'MongoDB'], reqs: ['Experience designing RESTful APIs', 'Database indexing and modeling experience', 'Familiar with JWT/Session management'] },
      { title: 'Cloud Solutions Consultant', type: 'full-time', location: 'Bengaluru', salary: '₹12,00,000 / annum', skills: ['AWS', 'Docker', 'Kubernetes'], reqs: ['Basic certifications in AWS/Azure', 'Understanding of networking and VPC concepts', 'Familiarity with infrastructure as code'] },
      { title: 'Data Analyst', type: 'full-time', location: 'Chennai', salary: '₹6,50,000 / annum', skills: ['Python', 'SQL', 'Pandas'], reqs: ['Bachelor degree in Stats/Math/CS', 'Proficient in write-ups & SQL queries', 'Experience dashboarding with PowerBI/Tableau'] },
      { title: 'UI/UX Design Intern', type: 'internship', location: 'Mumbai', salary: '₹25,000 / month', skills: ['Figma', 'UI/UX Design', 'Responsive Design'], reqs: ['Strong portfolio of web/mobile screens', 'Understanding of typography and spatial layout', 'User testing experience'] },
      { title: 'DevOps Engineer', type: 'full-time', location: 'Hyderabad', salary: '₹11,00,000 / annum', skills: ['CI/CD', 'Docker', 'Bash Scripting'], reqs: ['Knowledge of shell scripting', 'Hands-on experience with Jenkins/GitHub Actions', 'Linux system administration basics'] },
      { title: 'QA Automation Engineer', type: 'full-time', location: 'Gurugram', salary: '₹8,00,000 / annum', skills: ['Selenium', 'Java', 'Algorithms'], reqs: ['Basic programming in Java/Python', 'Knowledge of automation frameworks', 'Understanding of STLC phases'] },
      { title: 'Machine Learning Associate', type: 'full-time', location: 'Bengaluru', salary: '₹14,00,000 / annum', skills: ['Machine Learning', 'TensorFlow', 'NLP'], reqs: ['Master degree in CS/Data Science preferred', 'Experience training CNNs or NLP transformers', 'Strong linear algebra fundamentals'] }
    ];

    const seededJobs = [];
    
    // Distribute 30 jobs across the 9 approved companies
    const approvedCompanies = seededCompanies.filter(c => c.status === 'approved');

    for (let i = 0; i < 30; i++) {
      const template = jobTemplates[i % jobTemplates.length];
      const company = approvedCompanies[i % approvedCompanies.length];
      
      const job = await Job.create({
        company: company._id,
        title: `${template.title} - ${company.companyName}`,
        description: `Join ${company.companyName} as a ${template.title}. We are looking for highly motivated graduates to join our collaborative core engineering team. This position offers a rapid growth path and exposure to cutting-edge technical architectures.`,
        requirements: template.reqs,
        skills: template.skills,
        location: template.location,
        type: template.type,
        salary: template.salary,
        status: 'active'
      });

      seededJobs.push(job);
    }
    console.log(`Seeded ${seededJobs.length} job postings.`);

    // 5. Seed Demo Applications & Notifications
    console.log('Seeded demo applications for dashboard analytics...');
    
    // Student 1 applies to Job 1, 2, 3
    const student1 = seededStudents[0];
    const job1 = seededJobs[0];
    const job2 = seededJobs[1];
    const job3 = seededJobs[2];

    await Application.create({
      job: job1._id,
      student: student1._id,
      resumeUrl: student1.resumeUrl,
      status: 'shortlisted',
      coverLetter: 'I am excited to apply for this role. I have extensive experience building React projects.',
      appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });

    await Application.create({
      job: job2._id,
      student: student1._id,
      resumeUrl: student1.resumeUrl,
      status: 'pending',
      coverLetter: 'Applying for the Java developer role. Ready for the online coding assessment.',
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    await Application.create({
      job: job3._id,
      student: student1._id,
      resumeUrl: student1.resumeUrl,
      status: 'accepted',
      coverLetter: 'Applying for the Frontend Developer opening.',
      appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    });

    // Seed notifications for Student 1
    await Notification.create({
      recipient: student1.user,
      title: 'Congratulations!',
      message: `Your application at ${job3.title.split(' - ')[1]} has been ACCEPTED! Check details on the portal.`
    });

    await Notification.create({
      recipient: student1.user,
      title: 'Application Shortlisted',
      message: `You have been shortlisted for: "${job1.title}". Prepare for the technical interview.`
    });

    // Student 2 applies to Job 1, 4
    const student2 = seededStudents[1];
    const job4 = seededJobs[3];

    await Application.create({
      job: job1._id,
      student: student2._id,
      resumeUrl: student2.resumeUrl,
      status: 'rejected',
      coverLetter: 'Applying for the Software Engineer Intern role. Hope to hear back soon.',
      appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    });

    await Application.create({
      job: job4._id,
      student: student2._id,
      resumeUrl: student2.resumeUrl,
      status: 'reviewed',
      coverLetter: 'I have good command over Node.js and MongoDB.',
      appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });

    // Apply several student applicants across random jobs for realistic charts
    for (let index = 2; index < 15; index++) {
      const studentIdx = index;
      const jobIdx = index * 2;
      const activeStudent = seededStudents[studentIdx];
      const activeJob = seededJobs[jobIdx % seededJobs.length];

      const statuses = ['pending', 'reviewed', 'shortlisted'];
      const randomStatus = statuses[index % statuses.length];

      try {
        await Application.create({
          job: activeJob._id,
          student: activeStudent._id,
          resumeUrl: activeStudent.resumeUrl,
          status: randomStatus,
          coverLetter: 'Applying for the position listed. Review my resume attached.',
          appliedAt: new Date(Date.now() - (index % 7) * 24 * 60 * 60 * 1000)
        });
      } catch (err) {
        // Skip duplicate index catches
      }
    }

    console.log('Seeding completed successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
