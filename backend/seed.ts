import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './src/config/db';
import { User } from './src/models/User';
import { Item } from './src/models/Item';
import { Claim } from './src/models/Claim';
import { Match } from './src/models/Match';
import { Notification } from './src/models/Notification';
import { AuditLog } from './src/models/AuditLog';
import { RecoveredStory } from './src/models/RecoveredStory';

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

// =====================================================================
// LostFound+ database seed script (development only).
//
//   npm run seed         -> seed only when the database is empty
//   npm run seed:reset   -> clear ONLY the lostfoundplus collections
//                           and recreate the complete test dataset
//
// Dataset: 15 users + EXACTLY 100 items (50 lost / 50 found) including
// 10 realistic lost/found matching pairs, 2 pending claims, 10 suggested
// matches, notifications, audit logs and 2 recovered stories.
//
// DEV-ONLY SEED CREDENTIALS (all seed users share one password):
//   Students:  alex.rivera@campus.edu, elena.r@campus.edu,
//              marcus.v@campus.edu, jordan.lee@campus.edu,
//              student05@campus.edu ... student14@campus.edu
//              password: password123
//   Admin:     a.vance@campus.admin.edu
//              password: adminpassword123
// =====================================================================

const RESET = process.argv.includes('--reset');
const STUDENT_PASSWORD = 'password123';
const ADMIN_PASSWORD = 'adminpassword123';

// ---------------- Seed users (15) ----------------
const seedUsers = [
  { id: 'USR-001', name: 'Alex Rivera', email: 'alex.rivera@campus.edu', password: STUDENT_PASSWORD, role: 'USER', roleLabel: 'Student / Campus Member', department: 'Computer Science Dept.', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=AlexRivera', phone: '+1 (555) 234-8901', activeReportsCount: 6, recoveredCount: 4, createdAt: '2026-09-20T10:00:00Z' },
  { id: 'USR-002', name: 'Elena Rostova', email: 'elena.r@campus.edu', password: STUDENT_PASSWORD, role: 'USER', roleLabel: 'Student / Campus Member', department: 'Mathematics & Statistics', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=ElenaRostova', phone: '+1 (555) 882-1920', activeReportsCount: 4, recoveredCount: 3, createdAt: '2026-09-21T11:00:00Z' },
  { id: 'USR-003', name: 'Marcus Vance', email: 'marcus.v@campus.edu', password: STUDENT_PASSWORD, role: 'USER', roleLabel: 'Student / Campus Member', department: 'Business Administration', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=MarcusVance', phone: '+1 (555) 304-9912', activeReportsCount: 3, recoveredCount: 2, createdAt: '2026-09-22T09:30:00Z' },
  { id: 'USR-004', name: 'Jordan Lee', email: 'jordan.lee@campus.edu', password: STUDENT_PASSWORD, role: 'USER', roleLabel: 'Student / Campus Member', department: 'Electrical Engineering', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=JordanLee', phone: '+1 (555) 712-4091', activeReportsCount: 2, recoveredCount: 1, createdAt: '2026-09-23T14:15:00Z' },
  { id: 'USR-005', name: 'Priya Nair', email: 'student05@campus.edu', password: STUDENT_PASSWORD, role: 'USER', roleLabel: 'Student / Campus Member', department: 'Electronics & Communication', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=PriyaNair', phone: '+1 (555) 410-2210', activeReportsCount: 5, recoveredCount: 2, createdAt: '2026-08-02T09:00:00Z' },
  { id: 'USR-006', name: 'Rahul Menon', email: 'student06@campus.edu', password: STUDENT_PASSWORD, role: 'USER', roleLabel: 'Student / Campus Member', department: 'Mechanical Engineering', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=RahulMenon', phone: '+1 (555) 410-2211', activeReportsCount: 3, recoveredCount: 1, createdAt: '2026-08-05T10:30:00Z' },
  { id: 'USR-007', name: 'Sofia Dutta', email: 'student07@campus.edu', password: STUDENT_PASSWORD, role: 'USER', roleLabel: 'Student / Campus Member', department: 'Computer Science & Business Systems', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=SofiaDutta', phone: '+1 (555) 410-2212', activeReportsCount: 4, recoveredCount: 3, createdAt: '2026-08-09T11:15:00Z' },
  { id: 'USR-008', name: 'Arjun Patel', email: 'student08@campus.edu', password: STUDENT_PASSWORD, role: 'USER', roleLabel: 'Student / Campus Member', department: 'Civil Engineering', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=ArjunPatel', phone: '+1 (555) 410-2213', activeReportsCount: 2, recoveredCount: 0, createdAt: '2026-08-12T14:00:00Z' },
  { id: 'USR-009', name: 'Meera Krishnan', email: 'student09@campus.edu', password: STUDENT_PASSWORD, role: 'USER', roleLabel: 'Student / Campus Member', department: 'Physics', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=MeeraKrishnan', phone: '+1 (555) 410-2214', activeReportsCount: 6, recoveredCount: 5, createdAt: '2026-08-15T09:45:00Z' },
  { id: 'USR-010', name: 'Devika Rao', email: 'student10@campus.edu', password: STUDENT_PASSWORD, role: 'USER', roleLabel: 'Student / Campus Member', department: 'Chemistry', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=DevikaRao', phone: '+1 (555) 410-2215', activeReportsCount: 1, recoveredCount: 1, createdAt: '2026-08-18T13:20:00Z' },
  { id: 'USR-011', name: 'Kiran Bose', email: 'student11@campus.edu', password: STUDENT_PASSWORD, role: 'USER', roleLabel: 'Student / Campus Member', department: 'Information Technology', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=KiranBose', phone: '+1 (555) 410-2216', activeReportsCount: 3, recoveredCount: 2, createdAt: '2026-08-21T10:10:00Z' },
  { id: 'USR-012', name: 'Ananya Iyer', email: 'student12@campus.edu', password: STUDENT_PASSWORD, role: 'USER', roleLabel: 'Student / Campus Member', department: 'Biotechnology', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=AnanyaIyer', phone: '+1 (555) 410-2217', activeReportsCount: 2, recoveredCount: 2, createdAt: '2026-08-24T15:30:00Z' },
  { id: 'USR-013', name: 'Vikram Singh', email: 'student13@campus.edu', password: STUDENT_PASSWORD, role: 'USER', roleLabel: 'Student / Campus Member', department: 'Electrical Engineering', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=VikramSingh', phone: '+1 (555) 410-2218', activeReportsCount: 4, recoveredCount: 1, createdAt: '2026-08-27T12:00:00Z' },
  { id: 'USR-014', name: 'Nisha Verma', email: 'student14@campus.edu', password: STUDENT_PASSWORD, role: 'USER', roleLabel: 'Student / Campus Member', department: 'Architecture', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=NishaVerma', phone: '+1 (555) 410-2219', activeReportsCount: 1, recoveredCount: 0, createdAt: '2026-08-30T16:40:00Z' },
  { id: 'USR-ADM', name: 'Dr. Arthur Vance', email: 'a.vance@campus.admin.edu', password: ADMIN_PASSWORD, role: 'ADMIN', roleLabel: 'Campus Operations Administrator', department: 'University Student Affairs & Facilities', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=ArthurVance', phone: '+1 (555) 102-9900', activeReportsCount: 0, recoveredCount: 512, createdAt: '2026-09-01T08:00:00Z' },
];

// ---------------- Locations ----------------
const LOCATIONS: Array<{ location: string; building: string }> = [
  { location: 'Main Block - Room 204', building: 'Main Block' },
  { location: 'CSE Block - Lab 3', building: 'CSE Block' },
  { location: 'CSBS Block - Seminar Room', building: 'CSBS Block' },
  { location: 'ECE Block - Corridor B', building: 'ECE Block' },
  { location: 'Central Library - Reading Hall', building: 'Library' },
  { location: 'Main Auditorium - Row F', building: 'Auditorium' },
  { location: 'Campus Cafeteria - Table 12', building: 'Cafeteria' },
  { location: 'Boys Hostel - Common Room', building: 'Hostel' },
  { location: 'Parking Area - Gate 2', building: 'Parking Area' },
  { location: 'Sports Ground - Pavilion', building: 'Sports Ground' },
  { location: 'Physics Laboratory - Bench 4', building: 'Laboratory' },
  { location: 'Seminar Hall - Seat C9', building: 'Seminar Hall' },
  { location: 'Examination Hall - Desk 31', building: 'Examination Hall' },
  { location: 'Bus Area - Shuttle Bay 1', building: 'Bus Area' },
  { location: 'Classroom CR-7 - Back Bench', building: 'Classroom' },
  { location: 'Computer Lab - System 12', building: 'Computer Lab' },
];

const DATES = ['2026-06-08', '2026-06-17', '2026-06-25', '2026-07-04', '2026-07-12', '2026-07-21', '2026-07-30', '2026-08-07', '2026-08-15', '2026-08-23', '2026-09-02', '2026-09-11', '2026-09-19', '2026-09-26'];
const TIMES = ['09:15', '10:40', '12:15', '13:05', '14:30', '15:50', '16:20', '17:45'];
const DROP_OFFS = ['Central Library - Circulation Desk', 'Campus Security Lost & Found Office', 'Student Union Building - Info Desk'];

// ---------------- 10 explicit lost/found matching pairs (20 items) ----------------
// Pairs share category/color/location-family but differ in wording and detail
// so matching can be tested without exact duplicates.
const PAIRS: any[] = [
  {
    lost: { title: 'Black HP Laptop Backpack', category: 'Bags & Backpacks', brand: 'HP', color: 'Black', location: 'Central Library - Reading Hall', building: 'Library', date: '2026-09-24', time: '14:30', description: 'Black HP laptop backpack left on a reading table near the window row. Has a padded 15.6 inch laptop sleeve inside.', distinguishingFeatures: 'Small red keychain on the front zipper, frayed left strap edge.', privateVerificationInfo: 'Red NCC keychain, HP warranty card with serial 5CG3421 inside front pocket', securityQuestion: 'What is attached to the front zipper?', securityAnswer: 'A small red keychain', aiAnalysis: { object: 'backpack', brand: 'HP', model: 'Unknown', color: 'Black', category: 'Bags & Backpacks', description: 'Black fabric laptop backpack with front zip pocket', visibleText: 'HP', distinctiveFeatures: ['Red keychain on zipper', 'Padded shoulder straps'], possibleIdentifiers: ['HP logo tag on front'] } },
    found: { title: 'Black HP Pavilion Backpack', category: 'Bags & Backpacks', brand: 'HP', color: 'Black', location: 'Central Library - Reading Hall desk 14', building: 'Library', date: '2026-09-24', time: '17:00', description: 'Found unattended at reading desk 14. Handed to the circulation desk staff.', distinguishingFeatures: 'Red keychain attached to the zipper pull.', privateVerificationInfo: 'Warranty card inside, pen drive with project files in side pocket', securityQuestion: 'Which desk number was it found at?', securityAnswer: 'Desk 14', aiAnalysis: { object: 'backpack', brand: 'HP', model: 'Unknown', color: 'Black', category: 'Bags & Backpacks', description: 'Black HP laptop backpack, front pocket with keychain', visibleText: 'HP', distinctiveFeatures: ['Red zipper keychain'], possibleIdentifiers: ['HP logo'] } },
  },
  {
    lost: { title: 'Blue Milton Steel Water Bottle', category: 'Other Items', brand: 'Milton', color: 'Blue', location: 'Campus Cafeteria - Table 12', building: 'Cafeteria', date: '2026-09-23', time: '13:05', description: 'Blue 1 litre Milton thermosteel bottle forgotten on the cafeteria table after lunch.', distinguishingFeatures: 'Small dent on the base, white name sticker peeling off.', privateVerificationInfo: 'Name sticker reads SOFIA.D, black cap with scratch mark', securityQuestion: 'What name is on the sticker?', securityAnswer: 'SOFIA.D', aiAnalysis: { object: 'water bottle', brand: 'Milton', model: 'Unknown', color: 'Blue', category: 'Other Items', description: 'Blue stainless steel bottle with cap', visibleText: 'Milton', distinctiveFeatures: ['Dent on base', 'Peeling name sticker'], possibleIdentifiers: ['Milton logo print'] } },
    found: { title: 'Blue Thermosteel Flask 1L', category: 'Other Items', brand: 'Milton', color: 'Blue', location: 'Campus Cafeteria - Outdoor seating', building: 'Cafeteria', date: '2026-09-23', time: '15:20', description: 'Blue steel flask found on an outdoor bench. Kept at the cafeteria counter.', distinguishingFeatures: 'Dented bottom rim, faded sticker residue.', privateVerificationInfo: 'Partial sticker text SOF, cap liner replaced with red ring', securityQuestion: 'Describe the damage on the bottle.', securityAnswer: 'Dent on the base', aiAnalysis: { object: 'water bottle', brand: 'Milton', model: 'Unknown', color: 'Blue', category: 'Other Items', description: 'Blue steel flask with sticker residue', visibleText: 'Milton', distinctiveFeatures: ['Base dent'], possibleIdentifiers: [] } },
  },
  {
    lost: { title: 'Casio fx-991ES Scientific Calculator', category: 'Electronics & Gadgets', brand: 'Casio', color: 'Black', location: 'Examination Hall - Desk 31', building: 'Examination Hall', date: '2026-09-22', time: '10:40', description: 'Black Casio scientific calculator left on the exam desk after the internal test.', distinguishingFeatures: 'White correction-fluid dot on the cover, initials RS on the back.', privateVerificationInfo: 'Initials RS scratched near battery lid, solar panel hairline mark', securityQuestion: 'What mark is on the back of the calculator?', securityAnswer: 'Initials RS', aiAnalysis: { object: 'calculator', brand: 'Casio', model: 'fx-991ES', color: 'Black', category: 'Electronics & Gadgets', description: 'Black scientific calculator with slide cover', visibleText: 'CASIO fx-991ES PLUS', distinctiveFeatures: ['White dot on cover', 'RS initials'], possibleIdentifiers: ['Serial inside battery lid'] } },
    found: { title: 'Casio Scientific Calculator with Cover', category: 'Electronics & Gadgets', brand: 'Casio', color: 'Black', location: 'Examination Hall - Row C', building: 'Examination Hall', date: '2026-09-22', time: '12:00', description: 'Calculator with slide-on cover found under a desk in row C after the exam.', distinguishingFeatures: 'Cover has a white paint dot, back has scratched letters.', privateVerificationInfo: 'RS initials near battery compartment, Mode button slightly loose', securityQuestion: 'What is written near the battery lid?', securityAnswer: 'RS', aiAnalysis: { object: 'calculator', brand: 'Casio', model: 'fx-991ES', color: 'Black', category: 'Electronics & Gadgets', description: 'Black Casio calculator, cover with white dot', visibleText: 'CASIO', distinctiveFeatures: ['White dot', 'Scratched initials'], possibleIdentifiers: [] } },
  },
  {
    lost: { title: 'boAt Airdopes Wireless Earbuds', category: 'Electronics & Gadgets', brand: 'boAt', color: 'White', location: 'Seminar Hall - Seat C9', building: 'Seminar Hall', date: '2026-09-21', time: '15:50', description: 'White boAt airdopes case with both buds slipped out of a jacket pocket during the seminar.', distinguishingFeatures: 'Left bud missing its silicone tip, case lid hinge loose.', privateVerificationInfo: 'Right bud engraved B-221, case has blue dot sticker inside lid', securityQuestion: 'Which earbud is missing its silicone tip?', securityAnswer: 'Left bud', aiAnalysis: { object: 'earbuds', brand: 'boAt', model: 'Unknown', color: 'White', category: 'Electronics & Gadgets', description: 'White wireless earbuds charging case', visibleText: 'boAt', distinctiveFeatures: ['Missing left silicone tip', 'Loose hinge'], possibleIdentifiers: ['B-221 engraving'] } },
    found: { title: 'White Wireless Earbuds Case', category: 'Electronics & Gadgets', brand: 'boAt', color: 'White', location: 'Seminar Hall - Exit aisle', building: 'Seminar Hall', date: '2026-09-21', time: '17:10', description: 'White earbuds charging case found near the exit aisle seats.', distinguishingFeatures: 'One silicone tip missing, small blue sticker inside the lid.', privateVerificationInfo: 'B-221 engraving on right bud, 68 percent charge when found', securityQuestion: 'What is inside the lid of the case?', securityAnswer: 'A small blue sticker', aiAnalysis: { object: 'earbuds', brand: 'boAt', model: 'Unknown', color: 'White', category: 'Electronics & Gadgets', description: 'White charging case with two buds', visibleText: 'boAt', distinctiveFeatures: ['Blue sticker in lid'], possibleIdentifiers: ['B-221 engraving'] } },
  },
  {
    lost: { title: 'Brown Leather Wallet', category: 'Wallets & Cards', brand: 'Hidesign', color: 'Brown', location: 'Parking Area - Gate 2', building: 'Parking Area', date: '2026-09-20', time: '17:45', description: 'Brown leather bifold wallet dropped near the two-wheeler parking at gate 2.', distinguishingFeatures: 'Worn right corner, metro card visible in the outer slot.', privateVerificationInfo: 'Metro card ending 4417, gym membership card, Rs. 350 cash', securityQuestion: 'What card is in the outer slot?', securityAnswer: 'Metro card', aiAnalysis: { object: 'wallet', brand: 'Hidesign', model: 'Unknown', color: 'Brown', category: 'Wallets & Cards', description: 'Brown leather bifold wallet', visibleText: 'Hidesign', distinctiveFeatures: ['Worn corner', 'Metro card in slot'], possibleIdentifiers: ['Metro card 4417'] } },
    found: { title: 'Brown Bifold Leather Wallet', category: 'Wallets & Cards', brand: 'Hidesign', color: 'Brown', location: 'Parking Area - Near gate 2 pillar', building: 'Parking Area', date: '2026-09-20', time: '18:20', description: 'Leather wallet found beside the gate 2 pillar. Secured at the security booth.', distinguishingFeatures: 'Scuffed corner with a transit card in the front slot.', privateVerificationInfo: 'Metro card 4417, faded movie ticket stub from August', securityQuestion: 'What are the last digits of the metro card?', securityAnswer: '4417', aiAnalysis: { object: 'wallet', brand: 'Hidesign', model: 'Unknown', color: 'Brown', category: 'Wallets & Cards', description: 'Brown bifold with card in slot', visibleText: 'Unknown', distinctiveFeatures: ['Scuffed corner'], possibleIdentifiers: ['Metro card'] } },
  },
  {
    lost: { title: 'CSBS Student ID Card - Aarav Sharma', category: 'IDs & Documents', brand: 'Campus ID', color: 'White and Blue', location: 'CSE Block - Lab 3', building: 'CSE Block', date: '2026-09-19', time: '09:15', description: 'Student ID card with blue lanyard lost during the morning lab session.', distinguishingFeatures: 'Photo slightly faded, lanyard clip cracked.', privateVerificationInfo: 'ID number 2023CSB045, blood group B+ printed on back', securityQuestion: 'What is the ID number on the card?', securityAnswer: '2023CSB045', aiAnalysis: { object: 'ID card', brand: 'Unknown', model: 'Unknown', color: 'White and Blue', category: 'IDs & Documents', description: 'Student identity card with lanyard', visibleText: 'Aarav Sharma 2023CSB045', distinctiveFeatures: ['Cracked lanyard clip'], possibleIdentifiers: ['ID 2023CSB045'] } },
    found: { title: 'Student ID Card with Blue Lanyard', category: 'IDs & Documents', brand: 'Campus ID', color: 'White and Blue', location: 'CSE Block - First floor corridor', building: 'CSE Block', date: '2026-09-19', time: '11:30', description: 'ID card on a blue lanyard found in the first floor corridor.', distinguishingFeatures: 'Faded photo, one cracked clip on the lanyard.', privateVerificationInfo: 'Name Aarav Sharma, 2023CSB045, hostel sticker H-214', securityQuestion: 'Which hostel room sticker is on the card?', securityAnswer: 'H-214', aiAnalysis: { object: 'ID card', brand: 'Unknown', model: 'Unknown', color: 'White and Blue', category: 'IDs & Documents', description: 'ID card with blue lanyard', visibleText: 'Aarav Sharma', distinctiveFeatures: ['Faded photo'], possibleIdentifiers: ['2023CSB045'] } },
  },
  {
    lost: { title: 'Dell 65W Laptop Charger', category: 'Electronics & Gadgets', brand: 'Dell', color: 'Black', location: 'Computer Lab - System 12', building: 'Computer Lab', date: '2026-09-18', time: '16:20', description: 'Black Dell round-pin 65W adapter left plugged in at system 12.', distinguishingFeatures: 'Cable tied with a green velcro strap, adapter corner chipped.', privateVerificationInfo: 'Green velcro strap, asset tag DELL-LAB-118 on the brick', securityQuestion: 'What color is the cable strap?', securityAnswer: 'Green velcro strap', aiAnalysis: { object: 'charger', brand: 'Dell', model: '65W', color: 'Black', category: 'Electronics & Gadgets', description: 'Black laptop power adapter with cable', visibleText: 'DELL 65W', distinctiveFeatures: ['Green velcro strap', 'Chipped corner'], possibleIdentifiers: ['Asset tag DELL-LAB-118'] } },
    found: { title: 'Black Laptop Power Adapter 65W', category: 'Electronics & Gadgets', brand: 'Dell', color: 'Black', location: 'Computer Lab - Near printer desk', building: 'Computer Lab', date: '2026-09-18', time: '18:00', description: 'Power adapter found coiled near the printer desk. Kept with the lab assistant.', distinguishingFeatures: 'Green strap around the cable, small chip on the adapter edge.', privateVerificationInfo: 'Asset tag DELL-LAB-118, pin slightly bent', securityQuestion: 'What is written on the asset tag?', securityAnswer: 'DELL-LAB-118', aiAnalysis: { object: 'charger', brand: 'Dell', model: 'Unknown', color: 'Black', category: 'Electronics & Gadgets', description: 'Coiled black adapter with strap', visibleText: 'DELL', distinctiveFeatures: ['Green strap'], possibleIdentifiers: ['Asset tag'] } },
  },
  {
    lost: { title: 'Noise ColorFit Smartwatch - Black', category: 'Electronics & Gadgets', brand: 'Noise', color: 'Black', location: 'Boys Hostel - Common Room', building: 'Hostel', date: '2026-09-17', time: '12:15', description: 'Black Noise smartwatch with silicone strap left on the common room couch.', distinguishingFeatures: 'Screen guard cracked at the top, strap keeper loop torn.', privateVerificationInfo: 'Watchface shows step goal 8000, paired name KIRAN NOISE', securityQuestion: 'What is the paired Bluetooth name?', securityAnswer: 'KIRAN NOISE', aiAnalysis: { object: 'smartwatch', brand: 'Noise', model: 'ColorFit', color: 'Black', category: 'Electronics & Gadgets', description: 'Black smartwatch with silicone strap', visibleText: 'Noise', distinctiveFeatures: ['Cracked screen guard', 'Torn keeper loop'], possibleIdentifiers: [] } },
    found: { title: 'Black Fitness Smartwatch', category: 'Electronics & Gadgets', brand: 'Noise', color: 'Black', location: 'Boys Hostel - TV room sofa', building: 'Hostel', date: '2026-09-17', time: '20:10', description: 'Smartwatch found on the TV room sofa cushions. With the warden office.', distinguishingFeatures: 'Cracked guard film, silicone strap with torn loop.', privateVerificationInfo: 'KIRAN NOISE pairing, alarm set for 6 AM', securityQuestion: 'What time is the alarm set for?', securityAnswer: '6 AM', aiAnalysis: { object: 'smartwatch', brand: 'Noise', model: 'Unknown', color: 'Black', category: 'Electronics & Gadgets', description: 'Black fitness watch, cracked guard', visibleText: 'Noise', distinctiveFeatures: ['Cracked guard'], possibleIdentifiers: [] } },
  },
  {
    lost: { title: 'Classmate Physics Lab Notebook', category: 'Books & Notebooks', brand: 'Classmate', color: 'Blue', location: 'Physics Laboratory - Bench 4', building: 'Laboratory', date: '2026-09-16', time: '10:40', description: 'Blue Classmate long notebook with physics experiment readings up to exp 6.', distinguishingFeatures: 'Name slip on first page, coffee stain on page 12.', privateVerificationInfo: 'Name slip MEERA-K, roll 22PH14, graph sheet stapled at page 20', securityQuestion: 'What is written on the name slip?', securityAnswer: 'MEERA-K', aiAnalysis: { object: 'notebook', brand: 'Classmate', model: 'Unknown', color: 'Blue', category: 'Books & Notebooks', description: 'Blue ruled long notebook', visibleText: 'Classmate', distinctiveFeatures: ['Name slip', 'Coffee stain page 12'], possibleIdentifiers: ['Roll 22PH14'] } },
    found: { title: 'Blue Long Notebook - Physics Readings', category: 'Books & Notebooks', brand: 'Classmate', color: 'Blue', location: 'Physics Laboratory - Side shelf', building: 'Laboratory', date: '2026-09-16', time: '13:30', description: 'Long notebook with handwritten experiment tables found on the side shelf.', distinguishingFeatures: 'Stained page inside, handwritten name on first page.', privateVerificationInfo: 'MEERA-K slip, readings till experiment 6', securityQuestion: 'Till which experiment are readings written?', securityAnswer: 'Experiment 6', aiAnalysis: { object: 'notebook', brand: 'Classmate', model: 'Unknown', color: 'Blue', category: 'Books & Notebooks', description: 'Blue notebook with tables', visibleText: 'Classmate', distinctiveFeatures: ['Stained page'], possibleIdentifiers: [] } },
  },
  {
    lost: { title: 'SanDisk 64GB USB Pendrive', category: 'Electronics & Gadgets', brand: 'SanDisk', color: 'Red and Black', location: 'ECE Block - Corridor B', building: 'ECE Block', date: '2026-09-15', time: '13:05', description: 'Red-black SanDisk 64GB drive with project report files lost near the corridor.', distinguishingFeatures: 'Blue cap, keyring hole with a copper ring.', privateVerificationInfo: 'Volume label FINAL-YEAR, copper split ring, cap teeth mark', securityQuestion: 'What is the volume label of the drive?', securityAnswer: 'FINAL-YEAR', aiAnalysis: { object: 'USB drive', brand: 'SanDisk', model: '64GB', color: 'Red and Black', category: 'Electronics & Gadgets', description: 'Red and black pendrive with cap', visibleText: 'SanDisk 64GB', distinctiveFeatures: ['Blue cap', 'Copper ring'], possibleIdentifiers: ['Volume FINAL-YEAR'] } },
    found: { title: 'Red SanDisk Pendrive with Cap', category: 'Electronics & Gadgets', brand: 'SanDisk', color: 'Red and Black', location: 'ECE Block - Seminar hall entrance', building: 'ECE Block', date: '2026-09-15', time: '16:45', description: 'Pendrive with cap found at the seminar hall entrance steps.', distinguishingFeatures: 'Copper ring in the keyhole, cap has a teeth mark.', privateVerificationInfo: 'FINAL-YEAR volume, contains viva presentation', securityQuestion: 'What files are inside the drive?', securityAnswer: 'Project report and viva presentation', aiAnalysis: { object: 'USB drive', brand: 'SanDisk', model: 'Unknown', color: 'Red and Black', category: 'Electronics & Gadgets', description: 'Pendrive with blue cap', visibleText: 'SanDisk', distinctiveFeatures: ['Copper ring'], possibleIdentifiers: [] } },
  },
];

// ---------------- 80 generated items: 10 categories x 8 variants ----------------
const POOLS: Record<string, Array<{ t: string; b: string; c: string; d: string; f: string }>> = {
  'Electronics & Gadgets': [
    { t: 'Samsung Galaxy M35 Mobile Phone', b: 'Samsung', c: 'Dark Blue', d: 'Dark blue Samsung phone with transparent back cover, lost around the charging station.', f: 'Cracked camera lens guard, pop-socket ring on the back.' },
    { t: 'Apple MacBook Air Charger 35W', b: 'Apple', c: 'White', d: 'White dual-port Apple adapter with braided cable, left in the design studio.', f: 'Cable has a yellow band near the connector.' },
    { t: 'Sony WH-CH520 Headphones', b: 'Sony', c: 'Matte Black', d: 'Over-ear Sony headphones in a grey pouch, left on the bus seat.', f: 'Right cushion slightly torn, SONY embossed on the band.' },
    { t: 'Lenovo ThinkPad Mouse', b: 'Lenovo', c: 'Black', d: 'Wireless ThinkPad mouse with red trackpoint cap design, missing nano receiver.', f: 'Scroll wheel squeaks, asset sticker underneath.' },
    { t: 'Mi 20000mAh Power Bank', b: 'Mi', c: 'White', d: 'White Mi power bank with dual output, cable attached with rubber band.', f: 'Rubber band mark on the body, LED 3 of 4 glowing.' },
    { t: 'Logitech K480 Keyboard', b: 'Logitech', c: 'Black and Yellow', d: 'Multi-device Logitech keyboard with phone slot, left in the media room.', f: 'Spacebar shine, E key legend fading.' },
    { t: 'Realme Buds Wireless Neckband', b: 'Realme', c: 'Green', d: 'Green neckband earphones with magnetic buds, found tangled in the gym bag area.', f: 'Left bud mesh dented, charging flap loose.' },
    { t: 'HP 15s Laptop Sleeve', b: 'HP', c: 'Grey', d: 'Grey padded sleeve for 15.6 inch laptops with front document pocket.', f: 'Zip pull replaced with a paperclip, ink spot inside.' },
  ],
  'Bags & Backpacks': [
    { t: 'Wildcraft 45L Trekking Backpack', b: 'Wildcraft', c: 'Olive Green', d: 'Large olive trekking pack with rain cover pouch, left at the sports storeroom.', f: 'Rain cover missing, buckle on waist belt cracked.' },
    { t: 'Nike Heritage Gym Duffel', b: 'Nike', c: 'Black and Orange', d: 'Medium Nike duffel with shoe compartment, forgotten near the gym lockers.', f: 'Orange zip pulls, sweat towel still inside.' },
    { t: 'Lavie Beige Handbag', b: 'Lavie', c: 'Beige', d: 'Beige structured handbag with gold chain strap, found in the auditorium.', f: 'Chain strap tangled, lipstick mark on inner lining.' },
    { t: 'American Tourister Laptop Bag', b: 'American Tourister', c: 'Navy Blue', d: 'Navy office laptop bag with trolley strap, left in the placement cell.', f: 'Trolley strap Velcro worn, pen loop stretched.' },
    { t: 'Puma Phase Backpack', b: 'Puma', c: 'Red', d: 'Red Puma backpack with front shove-it pocket, lost on the shuttle bus.', f: 'Bus ticket stub in the front pocket, cat badge pinned.' },
    { t: 'Skybags Polyester Tote', b: 'Skybags', c: 'Maroon', d: 'Maroon tote with inner zip divider, found hanging on a classroom door.', f: 'Handle stitching loose on one side.' },
    { t: 'Adidas Tiro Teambag Small', b: 'Adidas', c: 'Black and White', d: 'Small black team duffel with white stripes, left at the football field.', f: 'Mud stains on the base, whistle inside.' },
    { t: 'Canvas Jute Library Tote', b: 'Unknown', c: 'Natural Beige', d: 'Plain canvas tote with library due-date slip stapled inside.', f: 'Ink stamp LIB-214 on the base corner.' },
  ],
  'Wallets & Cards': [
    { t: 'Black Leather Card Holder', b: 'Unknown', c: 'Black', d: 'Slim black card holder with 4 cards visible through the window slot.', f: 'Metro token and photo card inside.' },
    { t: 'Tan Fossil Wallet', b: 'Fossil', c: 'Tan', d: 'Tan trifold wallet with coin pouch, dropped near the ATM kiosk.', f: 'Coin pouch zip stuck halfway, fuel receipt inside.' },
    { t: 'Blue Denim Purse', b: 'Unknown', c: 'Denim Blue', d: 'Small denim purse with wooden button closure, found on the canteen counter.', f: 'Button thread redone with white thread.' },
    { t: 'Fastrack Black Wallet', b: 'Fastrack', c: 'Black', d: 'Black bifold with embossed logo, lost during the cricket match.', f: 'Emboss fading, match ticket inside.' },
    { t: 'Metro Smart Card - Blue', b: 'Unknown', c: 'Blue', d: 'Blue metro smart card in a transparent sleeve with a photo.', f: 'Sleeve cracked at the corner.' },
    { t: 'Tommy Hilfiger Wallet', b: 'Tommy Hilfiger', c: 'Navy', d: 'Navy wallet with flag tab, found in the seminar hall seats.', f: 'Flag tab frayed, visiting card of a dentist inside.' },
    { t: 'Campus Food Court Card', b: 'Unknown', c: 'Orange', d: 'Orange rechargeable food card with balance slip attached.', f: 'Balance slip shows Rs. 210.' },
    { t: 'Zara Mini Coin Pouch', b: 'Zara', c: 'Pink', d: 'Pink zip coin pouch with mirror charm, lost near the girls hostel gate.', f: 'Mirror charm scratched, bus change inside.' },
  ],
  'Keys & Keychains': [
    { t: 'Bike Keys with Steel Chain', b: 'Yamaha', c: 'Silver', d: 'Two Yamaha bike keys on a steel ball chain with a helmet token.', f: 'Helmet token number 77, rubber grip worn.' },
    { t: 'Hostel Room Key - H214', b: 'Unknown', c: 'Brass', d: 'Brass room key tagged H-214 with a green plastic fob.', f: 'Fob melted slightly at one edge.' },
    { t: 'Car Key with Black Cover', b: 'Maruti Suzuki', c: 'Black', d: 'Car remote key in a black silicone cover with house keys attached.', f: 'Cover torn near the buttons.' },
    { t: 'Locker Key - Gym 33', b: 'Unknown', c: 'Silver', d: 'Small locker key numbered 33 with a blue wrist band.', f: 'Band elastic stretched out.' },
    { t: 'Bunch of 5 Door Keys', b: 'Godrej', c: 'Mixed', d: 'Five Godrej door keys on an iron ring with a leather tag.', f: 'Leather tag stamped LAB.' },
    { t: 'Cycle Lock Key Pair', b: 'Hero', c: 'Silver', d: 'Two cycle lock keys with a smiley keychain, found at the cycle stand.', f: 'Smiley paint half peeled.' },
    { t: 'Lab Almirah Key', b: 'Unknown', c: 'Golden', d: 'Single almirah key with red thread tied, lost near the chemistry lab.', f: 'Red thread knotted twice.' },
    { t: 'Drawer Keys with Batman Fob', b: 'Unknown', c: 'Black and Yellow', d: 'Two drawer keys with a Batman rubber fob, dropped in the library.', f: 'Batman ear chipped.' },
  ],
  'IDs & Documents': [
    { t: 'Driving Licence Card', b: 'Unknown', c: 'White', d: 'Laminated driving licence card in a black sleeve.', f: 'Sleeve elastic loose, photo corners bent.' },
    { t: 'Aadhaar Card Printout', b: 'Unknown', c: 'White', d: 'Folded Aadhaar printout in a poly cover, found near the xerox shop.', f: 'Shop stamp on the back.' },
    { t: 'Semester Hall Ticket', b: 'Unknown', c: 'White and Green', d: 'Hall ticket for semester exams with photo and timetable.', f: 'Timetable highlighted in pink.' },
    { t: 'Library Membership Card', b: 'Unknown', c: 'Yellow', d: 'Yellow library card with barcode sticker and due stamp.', f: 'Barcode sticker half torn.' },
    { t: 'Internship Offer Letter', b: 'Unknown', c: 'White', d: 'Two-page offer letter in a brown envelope, name visible on top.', f: 'Envelope sealed with cello tape.' },
    { t: 'Bus Pass - Route 12', b: 'Unknown', c: 'Pink', d: 'Monthly bus pass for route 12 with photo and hologram.', f: 'Hologram scratched, valid till month end.' },
    { t: 'Voter ID Card', b: 'Unknown', c: 'White', d: 'Voter ID card with address of hostel, found in the record room.', f: 'Edges laminated twice.' },
    { t: 'Project Bonafide Certificate', b: 'Unknown', c: 'Cream', d: 'Bonafide certificate with department seal for project review.', f: 'Seal smudged on the left.' },
  ],
  'Clothing & Apparel': [
    { t: 'Nike Black Hoodie - L', b: 'Nike', c: 'Black', d: 'Black pullover hoodie size L with kangaroo pocket, left in the gym.', f: 'Drawstring tip missing on one side.' },
    { t: 'Blue Denim Jacket - M', b: 'Levis', c: 'Blue', d: 'Medium wash denim jacket with brass buttons, found on the auditorium seat.', f: 'Cuff button missing, ticket stub in pocket.' },
    { t: 'Puma White Sports Shoes - UK9', b: 'Puma', c: 'White', d: 'Pair of white running shoes UK 9 with mismatched laces.', f: 'Left lace blue, right lace white.' },
    { t: 'Red Cotton Saree Cover', b: 'Unknown', c: 'Red', d: 'Folded red cotton stole in a zip cover, lost near the cultural hall.', f: 'Zari border torn at one end.' },
    { t: 'Black Formal Blazer - 40', b: 'Park Avenue', c: 'Black', d: 'Single-breasted black blazer size 40 with placement badge pin.', f: 'Badge pin bent, inner pocket torn.' },
    { t: 'Adidas Track Pants - M', b: 'Adidas', c: 'Navy', d: 'Navy track pants with white side stripes, found in the locker room.', f: 'Drawstring knot permanent, knee faded.' },
    { t: 'Woollen Grey Sweater', b: 'Monte Carlo', c: 'Grey', d: 'Grey full-sleeve sweater with elbow patches, left in the night bus.', f: 'Right elbow patch re-stitched.' },
    { t: 'Yellow Raincoat with Hood', b: 'Wildcraft', c: 'Yellow', d: 'Yellow packable raincoat with hood and front vents.', f: 'Vent snap button missing.' },
  ],
  'Books & Notebooks': [
    { t: 'Let Us C Programming Book', b: 'BPB', c: 'Yellow and Black', d: 'Let Us C 19th edition with solved exercise markings till chapter 5.', f: 'Page 112 dog-eared, pencil notes in margins.' },
    { t: 'Engineering Mathematics Vol 2', b: 'Unknown', c: 'Green', d: 'Hardbound maths textbook with university syllabus sticker.', f: 'Sticker serial 24M311, coffee ring on cover.' },
    { t: 'Spiral Bound Project Report', b: 'Unknown', c: 'Black', d: 'Black spiral project report titled IoT Attendance System, 68 pages.', f: 'CD pocket empty, guide signature on page 2.' },
    { t: 'Diary 2026 - Brown Cover', b: 'Unknown', c: 'Brown', d: 'Brown daily diary with entries till August and a ribbon marker.', f: 'Ribbon frayed, phone numbers on last page.' },
    { t: 'Data Structures Notebook', b: 'Classmate', c: 'Green', d: 'Green notebook with tree diagrams and algorithm notes.', f: 'Sticky flags on BST pages.' },
    { t: 'Novel - The Alchemist', b: 'HarperCollins', c: 'Golden', d: 'Paperback novel with boarding-pass bookmark inside.', f: 'Spine creased at page 90.' },
    { t: 'GATE Aptitude Guide', b: 'Arihant', c: 'Orange', d: 'Aptitude guide with mock OMR sheets tucked inside.', f: 'Two OMR sheets already filled.' },
    { t: 'Sketchbook A4 - 60 Pages', b: 'Unknown', c: 'Black', d: 'A4 sketchbook half filled with pencil portraits.', f: 'Elastic band replaced with hair tie.' },
  ],
  'Jewelry & Watches': [
    { t: 'Fastrack Analog Watch', b: 'Fastrack', c: 'Silver and Black', d: 'Silver-chain analog watch with black dial, glass intact.', f: 'Clasp spring loose, 7th link scratched.' },
    { t: 'Gold-Plated Stud Earring', b: 'Unknown', c: 'Golden', d: 'Single gold-plated stud with white stone, found near the washbasin.', f: 'Back screw type, stone slightly cloudy.' },
    { t: 'Silver Bracelet with Charm', b: 'Unknown', c: 'Silver', d: 'Silver chain bracelet with a star charm and S-hook.', f: 'Charm engraved with a date.' },
    { t: 'Titan Raga Ladies Watch', b: 'Titan', c: 'Rose Gold', d: 'Rose gold slim watch with mesh strap, left in the dance room.', f: 'Mesh magnet weak, crown stiff.' },
    { t: 'Black Thread Anklet', b: 'Unknown', c: 'Black and Silver', d: 'Black thread anklet with two silver beads.', f: 'One bead oval, one round.' },
    { t: 'Copper Kada Bracelet', b: 'Unknown', c: 'Copper', d: 'Plain copper kada with temple design edges.', f: 'Inner side darkened with wear.' },
    { t: 'Pearl Pendant Chain', b: 'Unknown', c: 'White and Silver', d: 'Artificial pearl pendant on a silver chain, clasp marked 925.', f: 'One pearl slightly off-white.' },
    { t: 'Boat Wave Smart Band', b: 'boAt', c: 'Blue', d: 'Blue smart band with magnetic charger pin cover missing.', f: 'Strap pin replaced with wire.' },
  ],
  'Sports Equipment': [
    { t: 'Cosco Football Size 5', b: 'Cosco', c: 'White and Black', d: 'Size 5 football with needle and valve cap, mildly deflated.', f: 'Signature in marker near valve.' },
    { t: 'Yonex Badminton Racket', b: 'Yonex', c: 'Red and Black', d: 'Yonex racket with gutting intact and full cover.', f: 'Grip replaced with black tape.' },
    { t: 'SG Cricket Bat - SH', b: 'SG', c: 'Natural Wood', d: 'Short-handle SG bat with toe guard and scuff sheet.', f: 'Toe guard half peeled.' },
    { t: 'Nivia Volleyball', b: 'Nivia', c: 'Yellow and Blue', d: 'Match volleyball with moist-panel feel, found near the net pole.', f: 'Panel seam opening near logo.' },
    { t: 'Skipping Rope with Counter', b: 'Unknown', c: 'Black', d: 'Ball-bearing skipping rope with digital counter in handle.', f: 'Counter stuck at 0420.' },
    { t: 'Table Tennis Bats Pair', b: 'GKI', c: 'Red and Black', d: 'Two GKI bats with 3 balls in a net pouch.', f: 'One rubber bubbled at edge.' },
    { t: 'Carrom Striker Set', b: 'Unknown', c: 'White', d: 'Two strikers and powder box in a cloth pouch.', f: 'One striker chipped.' },
    { t: 'Gym Gloves - Large', b: 'Nike', c: 'Grey and Black', d: 'Pair of large gym gloves with wrist wraps.', f: 'Left wrap Velcro weak.' },
  ],
  'Other Items': [
    { t: 'Cello Milton Lunch Box Set', b: 'Milton', c: 'Green', d: 'Three-container lunch set with steel spoon, name label on lid.', f: 'Label reads DEV, spoon bent.' },
    { t: 'Black Folding Umbrella', b: 'Unknown', c: 'Black', d: 'Auto-open folding umbrella with sleeve cover.', f: 'One rib slightly bent.' },
    { t: 'Transparent Exam Pouch', b: 'Unknown', c: 'Transparent', d: 'Transparent pouch with pens, pencils, eraser and ID card slot.', f: 'Zip tag replaced with safety pin.' },
    { t: 'Steel Tiffin Carrier', b: 'Unknown', c: 'Silver', d: 'Four-tier steel carrier with side clips, found at the mess hall.', f: 'One clip spring missing.' },
    { t: 'Spectacles in Brown Case', b: 'Lenskart', c: 'Brown', d: 'Black-frame spectacles power -2.5 in a brown hard case.', f: 'Right temple arm loose.' },
    { t: 'White Lab Apron - M', b: 'Unknown', c: 'White', d: 'Medium lab apron with pen stains and embroidered initials.', f: 'Initials NK near pocket.' },
    { t: 'Helmet - Vega Black', b: 'Vega', c: 'Black', d: 'Black full-face Vega helmet size M with tinted visor.', f: 'Visor scratched on the right.' },
    { t: 'Cricket Kit Bag Wheels', b: 'SG', c: 'Blue and Black', d: 'Large wheeled kit bag with bat pockets on both sides.', f: 'One wheel jammed, zip garage torn.' },
  ],
};

// ---------------- Main ----------------
async function main() {
  await connectDB();
  const dbName = mongoose.connection.name;

  const itemCount = await Item.countDocuments();

  if (!RESET && itemCount > 0) {
    console.log(`Seed skipped: database '${dbName}' already has ${itemCount} items. Use 'npm run seed:reset' to reseed.`);
    await mongoose.disconnect();
    return;
  }

  if (RESET) {
    // Operate ONLY on LostFound+ collections inside the configured database.
    await Promise.all([
      User.deleteMany({}),
      Item.deleteMany({}),
      Claim.deleteMany({}),
      Match.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      RecoveredStory.deleteMany({}),
    ]);
    console.log(`Cleared LostFound+ collections in database '${dbName}'.`);
  }

  // Users
  const usersToInsert = seedUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email.toLowerCase(),
    passwordHash: bcrypt.hashSync(u.password, 10),
    role: u.role,
    roleLabel: u.roleLabel,
    department: u.department,
    avatar: u.avatar,
    phone: u.phone,
    activeReportsCount: u.activeReportsCount,
    recoveredCount: u.recoveredCount,
    createdAt: u.createdAt,
  }));
  await User.insertMany(usersToInsert);
  const reporters = seedUsers.filter((u) => u.role !== 'ADMIN');

  // Items: 10 pairs (20) + 80 generated = EXACTLY 100 (50 lost / 50 found)
  const itemsToInsert: any[] = [];
  let seq = 1;
  const pad = (n: number) => `LF-2026-${String(n).padStart(3, '0')}`;

  const ownerOf = (index: number) => reporters[index % reporters.length];

  const buildItem = (base: any, type: 'lost' | 'found', seqNo: number, ownerIdx: number, locIdx: number, dropIdx: number) => {
    const owner = ownerOf(ownerIdx);
    const loc = base.location && base.building ? base : LOCATIONS[locIdx % LOCATIONS.length];
    const isFound = type === 'found';
    const dropOff = isFound ? (base.dropOffLocation || DROP_OFFS[dropIdx % DROP_OFFS.length]) : undefined;
    return {
      id: pad(seqNo),
      userId: owner.id,
      type,
      title: base.title,
      category: base.category,
      brand: base.brand || 'Unknown',
      color: base.color || 'Unknown',
      location: base.location || loc.location,
      building: base.building || loc.building,
      date: base.date || DATES[seqNo % DATES.length],
      time: base.time || TIMES[seqNo % TIMES.length],
      description: base.description || base.d,
      distinguishingFeatures: base.distinguishingFeatures || base.f,
      privateVerificationInfo: base.privateVerificationInfo || `Seed verification detail set ${seqNo}`,
      securityQuestion: base.securityQuestion || 'What unique mark identifies this item?',
      securityAnswer: base.securityAnswer || `Seed answer ${seqNo}`,
      contactName: owner.name,
      contactEmail: owner.email,
      contactPhone: owner.phone,
      status: 'ACTIVE',
      custodyStatus: isFound ? `Handed to ${dropOff}` : 'With Owner (Lost)',
      ...(isFound ? { dropOffLocation: dropOff } : {}),
      ...(base.aiAnalysis ? { aiAnalysis: base.aiAnalysis } : {}),
      createdAt: `${base.date || DATES[seqNo % DATES.length]}T${base.time || TIMES[seqNo % TIMES.length]}:00Z`,
    };
  };

  // Pairs first (LF-2026-001 .. LF-2026-020)
  const pairRefs: Array<{ lostId: string; foundId: string; category: string; color: string; building: string }> = [];
  PAIRS.forEach((pair, p) => {
    const lostId = pad(seq++);
    const foundId = pad(seq++);
    itemsToInsert.push(buildItem(pair.lost, 'lost', parseInt(lostId.slice(-3), 10), p % reporters.length, p * 2, p));
    itemsToInsert.push(buildItem(pair.found, 'found', parseInt(foundId.slice(-3), 10), (p + 3) % reporters.length, p * 2 + 1, p));
    pairRefs.push({ lostId, foundId, category: pair.lost.category, color: pair.lost.color, building: pair.lost.building });
  });

  // Generated 80 (LF-2026-021 .. LF-2026-100), alternating lost/found
  const categories = Object.keys(POOLS);
  let gi = 0;
  categories.forEach((cat, ci) => {
    POOLS[cat].forEach((v) => {
      const type = gi % 2 === 0 ? 'lost' : 'found';
      const seqNo = seq++;
      itemsToInsert.push(
        buildItem(
          { title: v.t, category: cat, brand: v.b, color: v.c, description: v.d, distinguishingFeatures: v.f },
          type,
          seqNo,
          (gi + ci) % reporters.length,
          gi,
          gi
        )
      );
      gi++;
    });
  });

  if (itemsToInsert.length !== 100) {
    throw new Error(`Seed integrity failure: expected 100 items, built ${itemsToInsert.length}. Aborting.`);
  }
  const lostCount = itemsToInsert.filter((i) => i.type === 'lost').length;
  const foundCount = itemsToInsert.filter((i) => i.type === 'found').length;
  await Item.insertMany(itemsToInsert);

  // Matches for the 10 pairs
  const matchesToInsert = pairRefs.map((p, i) => ({
    id: `MATCH-SEED-${String(i + 1).padStart(2, '0')}`,
    lostItemId: p.lostId,
    foundItemId: p.foundId,
    confidenceScore: 84 + (i % 12),
    status: 'suggested',
    matchedOn: [
      `Identical Category: ${p.category}`,
      `Location proximity: ${p.building}`,
      'Temporal proximity: Reported within 48 hours of discovery',
      `Matching color: ${p.color}`,
    ],
    notes: 'Potential Match: Seeded pair for matching tests. Awaiting human administrator review.',
    detectedAt: `2026-09-2${i % 9}T10:00:00Z`,
  }));
  await Match.insertMany(matchesToInsert);

  // 2 pending claims on generated found items
  const claimTargets = itemsToInsert.filter((i) => i.type === 'found' && !pairRefs.some((p) => p.foundId === i.id)).slice(0, 2);
  const claimsToInsert = claimTargets.map((t, i) => ({
    id: `CLM-91${String(10 + i)}`,
    itemId: t.id,
    itemTitle: t.title,
    itemCategory: t.category,
    claimantId: reporters[i].id,
    claimantName: reporters[i].name,
    claimantEmail: reporters[i].email,
    claimantPhone: reporters[i].phone,
    finderName: t.contactName,
    dropOffLocation: t.dropOffLocation || DROP_OFFS[0],
    status: 'PENDING',
    reviewedBy: null,
    reviewedAt: null,
    handoverOtp: `${100000 + i * 111111}`,
    qrCodeString: `LF-HANDOVER-${100000 + i * 111111}`,
    evidence: {
      lastSeenLocation: t.location,
      lostTime: `${t.date} around ${t.time}`,
      contentsDescription: t.description,
      distinctiveMarks: t.distinguishingFeatures,
      accessoryDetails: '',
      serialOrReceipt: '',
      additionalNotes: 'Seeded claim for testing the admin approval workflow.',
    },
    proofSubmitted: t.distinguishingFeatures,
    adminNotes: '',
    timeline: [
      { step: 'Claim Submitted', date: '2026-09-27 10:00', completed: true },
      { step: 'Under Admin Review', date: 'In progress', completed: true },
      { step: 'Identity & Evidence Verified by Admin', date: 'Pending Admin Decision', completed: false },
      { step: 'Handover Authorized', date: 'Pending', completed: false },
      { step: 'Recovery Confirmed', date: 'Pending', completed: false },
    ],
    createdAt: '2026-09-27T10:00:00Z',
  }));
  await Claim.insertMany(claimsToInsert);
  for (const c of claimsToInsert) {
    await Item.updateOne({ id: c.itemId }, { $set: { status: 'CLAIMED' } });
  }

  // Notifications
  await Notification.insertMany([
    { id: 'NOTIF-SEED-01', userId: 'USR-001', type: 'POTENTIAL_MATCH', title: 'Potential Match Found', message: 'A potential match was detected for your lost backpack at the Library.', read: false, link: '/matches', createdAt: '2026-09-25T10:00:00Z' },
    { id: 'NOTIF-SEED-02', userId: 'USR-001', type: 'CLAIM_SUBMITTED', title: 'Claim Under Review', message: 'Your claim has been submitted to Campus Administration for review.', read: false, link: '/claims', createdAt: '2026-09-27T10:05:00Z' },
    { id: 'NOTIF-SEED-03', userId: 'USR-002', type: 'POTENTIAL_MATCH', title: 'Potential Match Found', message: 'A potential match was detected for your lost calculator.', read: true, link: '/matches', createdAt: '2026-09-23T09:00:00Z' },
    { id: 'NOTIF-SEED-04', userId: 'USR-005', type: 'CLAIM_SUBMITTED', title: 'Claim Under Review', message: 'Your ownership claim is now under review by Campus Administration.', read: false, link: '/claims', createdAt: '2026-09-27T11:00:00Z' },
    { id: 'NOTIF-SEED-05', userId: 'USR-007', type: 'RECOVERY_CONFIRMED', title: 'Recovery Confirmed!', message: 'Physical handover for your item has been verified and confirmed.', read: true, link: '/recovered', createdAt: '2026-09-26T18:00:00Z' },
  ]);

  // Audit logs
  await AuditLog.insertMany([
    { id: 'AUD-SEED-01', actor: 'System Seeder', actorId: 'SYSTEM', action: 'ITEM_REPORTED', entity: 'Item', entityId: 'LF-2026-001', timestamp: '2026-09-24 14:35:00', details: 'Seeded lost item report ingested.', result: 'Recorded' },
    { id: 'AUD-SEED-02', actor: 'System Seeder', actorId: 'SYSTEM', action: 'ITEM_REPORTED', entity: 'Item', entityId: 'LF-2026-002', timestamp: '2026-09-24 17:05:00', details: 'Seeded found item intake validated.', result: 'Verified' },
    { id: 'AUD-SEED-03', actor: 'Alex Rivera', actorId: 'USR-001', action: 'CLAIM_SUBMITTED', entity: 'Claim', entityId: claimsToInsert[0]?.id || 'CLM-9110', timestamp: '2026-09-27 10:00:00', details: 'Seeded ownership claim submitted for review.', result: 'Pending' },
    { id: 'AUD-SEED-04', actor: 'Dr. Arthur Vance (ADMIN)', actorId: 'USR-ADM', action: 'ADMIN_LOGIN', entity: 'Session', entityId: 'USR-ADM', timestamp: '2026-09-27 09:00:00', details: 'Administrator authenticated into Central Console.', result: 'Success' },
    { id: 'AUD-SEED-05', actor: 'System Seeder', actorId: 'SYSTEM', action: 'SEED_COMPLETED', entity: 'Database', entityId: dbName, timestamp: '2026-09-29 12:00:00', details: 'Seeded 100 items with matching pairs for testing.', result: 'Success' },
  ]);

  // Recovered stories
  await RecoveredStory.insertMany([
    { id: 'REC-091', title: 'Graphing Calculator (TI-84 Plus CE)', category: 'Electronics & Gadgets', owner: 'Maya Lin (Freshman)', finder: 'Prof. Henderson', timeToRecover: '45 minutes', date: '2026-09-26', testimonial: 'Left in the STEM 101 lecture hall right before midterms. Claimed and safely retrieved using my verified student OTP within the hour!', badge: 'Fast Return' },
    { id: 'REC-092', title: 'Leatherbound Moleskine Research Notebook', category: 'Books & Notebooks', owner: 'Dr. Tariq Al-Mansoor', finder: 'Library Custodial Staff', timeToRecover: '2 hours', date: '2026-09-19', testimonial: 'This journal had two years of research sketches. The security verification question ensured only I could claim it. Truly thankful to our campus community.', badge: 'Safely Returned' },
  ]);

  // Final verification
  const counts = {
    users: await User.countDocuments(),
    items: await Item.countDocuments(),
    lost: await Item.countDocuments({ type: 'lost' }),
    found: await Item.countDocuments({ type: 'found' }),
    claims: await Claim.countDocuments(),
    matches: await Match.countDocuments(),
    notifications: await Notification.countDocuments(),
    auditlogs: await AuditLog.countDocuments(),
    stories: await RecoveredStory.countDocuments(),
  };

  console.log('Seed complete:');
  console.log(`  users: ${counts.users}`);
  console.log(`  items: ${counts.items} (lost: ${counts.lost}, found: ${counts.found})`);
  console.log(`  claims: ${counts.claims}`);
  console.log(`  matches: ${counts.matches}`);
  console.log(`  notifications: ${counts.notifications}`);
  console.log(`  auditlogs: ${counts.auditlogs}`);
  console.log(`  recoveredstories: ${counts.stories}`);

  if (counts.items !== 100) {
    console.error(`SEED INTEGRITY FAILURE: expected exactly 100 items, found ${counts.items}.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log('Seed credentials (dev only): students -> password123 | admin a.vance@campus.admin.edu -> adminpassword123');
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('Seed failed:', err);
  try {
    await mongoose.disconnect();
  } catch { }
  process.exit(1);
});
