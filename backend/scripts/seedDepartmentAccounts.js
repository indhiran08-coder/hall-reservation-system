const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const supabase = require('../src/config/db');

const DEPARTMENT_ACCOUNTS = [
  { email: 'hodaids@velalarengg.ac.in', name: 'HoD AI & DS', department: 'Artificial Intelligence & Data Science' },
  { email: 'hodaiml@velalarengg.ac.in', name: 'HoD AI & ML', department: 'Artificial Intelligence & Machine Learning' },
  { email: 'hodbme@velalarengg.ac.in', name: 'HoD BME', department: 'Biomedical Engineering' },
  { email: 'hodchemistry@velalarengg.ac.in', name: 'HoD Chemistry', department: 'Chemistry' },
  { email: 'hodcse@velalarengg.ac.in', name: 'HoD CSE', department: 'Computer Science & Engineering' },
  { email: 'hodece@velalarengg.ac.in', name: 'HoD ECE', department: 'Electronics & Communication Engg' },
  { email: 'hodeee@velalarengg.ac.in', name: 'HoD EEE', department: 'Electrical & Electronics Engg' },
  { email: 'hodenglish@velalarengg.ac.in', name: 'HoD English', department: 'English' },
  { email: 'hodit@velalarengg.ac.in', name: 'HoD IT', department: 'Information Technology' },
  { email: 'hodmba@velalarengg.ac.in', name: 'HoD MBA', department: 'Master of Business Administration' },
  { email: 'hodmde@velalarengg.ac.in', name: 'HoD MDE', department: 'Medical Electronics' },
  { email: 'hodmech@velalarengg.ac.in', name: 'HoD Mechanical', department: 'Mechanical Engineering' },
  { email: 'hodphysics@velalarengg.ac.in', name: 'HoD Physics', department: 'Physics' },
  { email: 'hodsh@velalarengg.ac.in', name: 'HoD S&H', department: 'Science & Humanities' },
  { email: 'hodcivil@velalarengg.ac.in', name: 'HoD Civil', department: 'Civil Engineering' },
  { email: 'vcetevents@velalarengg.ac.in', name: 'VCET Events Coordinator', department: 'VCET Events' },
  { email: 'idealab@velalarengg.ac.in', name: 'IDEA Lab Incharge', department: 'IDEA Lab' },
  { email: 'vcetiic@velalarengg.ac.in', name: 'VCET IIC President', department: 'Institution Innovation Council' },
  { email: 'ieduihub@velalarengg.ac.in', name: 'IEDC / UI-Hub Incharge', department: 'IEDC & UI-Hub' },
  { email: 'industrialvisits@velalarengg.ac.in', name: 'IV Coordinator', department: 'Industrial Visits Cell' },
  { email: 'iqac@velalarengg.ac.in', name: 'IQAC Coordinator', department: 'Internal Quality Assurance Cell' },
  { email: 'vcetcdc@velalarengg.ac.in', name: 'CDC Coordinator', department: 'Career Development Centre' },
  { email: 'placement@velalarengg.ac.in', name: 'Placement Officer', department: 'Training & Placement Cell' }
];

const DEFAULT_PASSWORD = process.env.DEFAULT_DEPT_PASSWORD || 'Vcet@2026';

async function seed() {
  console.log(`Starting seeding of ${DEPARTMENT_ACCOUNTS.length} department accounts...`);
  console.log(`Default initial password: ${DEFAULT_PASSWORD}`);

  const password_hash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  for (const acc of DEPARTMENT_ACCOUNTS) {
    const email = acc.email.toLowerCase().trim();

    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id, college_email')
      .eq('college_email', email)
      .maybeSingle();

    if (existing) {
      // Update department and password
      const { error: updateError } = await supabase
        .from('users')
        .update({
          first_name: acc.name,
          department: acc.department,
          password_hash,
          role: 'staff'
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error(`Error updating ${email}:`, updateError.message);
      } else {
        console.log(`Updated existing: ${email}`);
      }
    } else {
      // Insert new
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          first_name: acc.name,
          department: acc.department,
          college_email: email,
          personal_email: email,
          phone: '9999999999',
          password_hash,
          role: 'staff'
        });

      if (insertError) {
        console.error(`Error inserting ${email}:`, insertError.message);
      } else {
        console.log(`Created new: ${email}`);
      }
    }
  }

  console.log('Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
