// src/data/store.js
// In-memory data store simulating a real backend

export const COLORS = ['#4f6ef7','#22c55e','#f59e0b','#8b5cf6','#ef4444','#06b6d4'];

const stored = (key, def) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
};

const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

// ── Seed data ──────────────────────────────────────────────────────────────
const seedUsers = [
  { id:'u1', name:'Rohit Sharma',   email:'rohit@example.com',   role:'Admin',  team:'Management', joinedOn:'2025-03-10', password:'admin123', bio:'Project manager and team lead with 5+ years of experience in delivering successful digital products.', phone:'+91 98765 43210', location:'Pune, New Delhi', skills:['Project Management','Team Leadership','Agile','Communication'] },
  { id:'u2', name:'Anjali Singh',   email:'anjali@example.com',  role:'Member', team:'Development', joinedOn:'2025-03-12', password:'pass123', bio:'Frontend developer.', phone:'', location:'', skills:['React','CSS','JavaScript'] },
  { id:'u3', name:'Vikram Patel',   email:'vikram@example.com',  role:'Member', team:'Development', joinedOn:'2025-03-15', password:'pass123', bio:'Backend developer.', phone:'', location:'', skills:['Node.js','MongoDB','AWS'] },
  { id:'u4', name:'Priya Mehta',    email:'priya@example.com',   role:'Member', team:'Marketing',  joinedOn:'2025-03-18', password:'pass123', bio:'Digital marketer.', phone:'', location:'', skills:['SEO','Content','Analytics'] },
  { id:'u5', name:'Sandeep Kumar',  email:'sandeep@example.com', role:'Member', team:'Development', joinedOn:'2025-03-22', password:'pass123', bio:'Full-stack developer.', phone:'', location:'', skills:['React','Node.js','PostgreSQL'] },
  { id:'u6', name:'Neha Verma',     email:'neha@example.com',    role:'Member', team:'Marketing',  joinedOn:'2025-03-22', password:'pass123', bio:'Content strategist.', phone:'', location:'', skills:['Content Writing','SEO','Social Media'] },
];

const seedProjects = [
  { id:'p1', name:'Website Redesign',   description:'Redesign company website', color:'#4f6ef7', members:['u1','u2','u3'], status:'In Progress', startDate:'2025-04-01', endDate:'2025-05-22', progress:78 },
  { id:'p2', name:'Mobile App',         description:'Build and ship mobile app', color:'#22c55e', members:['u1','u3','u5'], status:'In Progress', startDate:'2025-04-05', endDate:'2025-06-30', progress:46 },
  { id:'p3', name:'Marketing Campaign', description:'Q2 marketing campaign',     color:'#f59e0b', members:['u4','u6'],      status:'Not Started', startDate:'2025-05-01', endDate:'2025-05-28', progress:10 },
  { id:'p4', name:'Internal Tool',      description:'Internal project management tool', color:'#8b5cf6', members:['u1','u2','u3','u5'], status:'In Progress', startDate:'2025-04-15', endDate:'2025-06-15', progress:30 },
  { id:'p5', name:'Client Portal',      description:'Portal for managing clients', color:'#ef4444', members:['u1','u4'],   status:'On Hold',    startDate:'2025-03-01', endDate:'2025-05-01', progress:60 },
];

const seedTasks = [
  { id:'t1',  title:'Design homepage',      projectId:'p1', assigneeId:'u1', reporterId:'u1', status:'In Progress', priority:'High',   dueDate:'2025-05-22', description:'Design the main homepage layout and components', createdAt:'2025-04-20' },
  { id:'t2',  title:'Fix login bug',        projectId:'p2', assigneeId:'u2', reporterId:'u1', status:'Done',        priority:'High',   dueDate:'2025-05-20', description:'Fix the authentication bug causing login failures', createdAt:'2025-04-18' },
  { id:'t3',  title:'Setup database',       projectId:'p4', assigneeId:'u3', reporterId:'u1', status:'In Progress', priority:'High',   dueDate:'2025-05-24', description:'Configure and setup the production database', createdAt:'2025-04-22' },
  { id:'t4',  title:'Write blog post',      projectId:'p3', assigneeId:'u4', reporterId:'u1', status:'To Do',       priority:'Medium', dueDate:'2025-05-26', description:'Write a blog post about Q2 marketing strategy', createdAt:'2025-04-25' },
  { id:'t5',  title:'Deploy to production', projectId:'p2', assigneeId:'u1', reporterId:'u1', status:'To Do',       priority:'High',   dueDate:'2025-05-30', description:'Deploy the latest release to production servers', createdAt:'2025-04-28' },
  { id:'t6',  title:'API integration',      projectId:'p2', assigneeId:'u3', reporterId:'u2', status:'In Progress', priority:'High',   dueDate:'2025-05-24', description:'Integrate third-party payment APIs', createdAt:'2025-04-21' },
  { id:'t7',  title:'User testing',         projectId:'p2', assigneeId:'u5', reporterId:'u1', status:'In Progress', priority:'Medium', dueDate:'2025-05-25', description:'Conduct user testing sessions and collect feedback', createdAt:'2025-04-23' },
  { id:'t8',  title:'Marketing plan',       projectId:'p3', assigneeId:'u6', reporterId:'u4', status:'To Do',       priority:'Low',    dueDate:'2025-05-28', description:'Create a detailed marketing plan for the campaign', createdAt:'2025-04-26' },
  { id:'t9',  title:'Fix high login bug',   projectId:'p4', assigneeId:'u2', reporterId:'u1', status:'In Review',   priority:'High',   dueDate:'2025-05-19', description:'Resolve login bug in internal tool', createdAt:'2025-04-17' },
  { id:'t10', title:'Create wireframes',    projectId:'p1', assigneeId:'u2', reporterId:'u1', status:'Done',        priority:'Medium', dueDate:'2025-05-18', description:'Create wireframes for all main pages', createdAt:'2025-04-15' },
  { id:'t11', title:'Social media plan',    projectId:'p3', assigneeId:'u4', reporterId:'u4', status:'To Do',       priority:'Medium', dueDate:'2025-06-05', description:'Create social media content calendar', createdAt:'2025-05-01' },
  { id:'t12', title:'Deploy homepage',      projectId:'p1', assigneeId:'u3', reporterId:'u1', status:'In Review',   priority:'Medium', dueDate:'2025-05-29', description:'Deploy homepage to staging environment', createdAt:'2025-04-29' },
];

const seedActivity = [
  { id:'a1', userId:'u2', action:'completed', target:'"Fix login bug"', projectName:'Mobile App', time:'2 hours ago', createdAt: Date.now() - 7200000 },
  { id:'a2', userId:'u3', action:'updated task', target:'"Setup database"', projectName:'', time:'4 hours ago', createdAt: Date.now() - 14400000 },
  { id:'a3', userId:'u4', action:'created a new task', target:'"Social media plan"', projectName:'', time:'1 day ago', createdAt: Date.now() - 86400000 },
  { id:'a4', userId:'u1', action:'created project', target:'"Internal Tool"', projectName:'', time:'2 days ago', createdAt: Date.now() - 172800000 },
];

// ── Time entries seed ── (userId, taskId, date, minutes, app, category)
const mkDate = (daysAgo, h, m) => {
  const d = new Date(); d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, 0, 0); return d.toISOString();
};
const seedTimeEntries = [
  // Rohit – today
  { id:'te1',  userId:'u1', taskId:'t1', projectId:'p1', description:'Designing homepage layout', startTime: mkDate(0,9,0),  endTime: mkDate(0,11,30), minutes:150, date: new Date().toDateString(), app:'Figma', category:'Design' },
  { id:'te2',  userId:'u1', taskId:'t5', projectId:'p2', description:'Planning production deploy',  startTime: mkDate(0,12,0), endTime: mkDate(0,13,0),  minutes:60,  date: new Date().toDateString(), app:'Slack', category:'Communication' },
  { id:'te3',  userId:'u1', taskId:'t1', projectId:'p1', description:'Reviewing design mockups',   startTime: mkDate(0,14,0), endTime: mkDate(0,16,30), minutes:150, date: new Date().toDateString(), app:'Figma', category:'Design' },
  // Anjali – today
  { id:'te4',  userId:'u2', taskId:'t9', projectId:'p4', description:'Fixing login bug in tool',   startTime: mkDate(0,9,30), endTime: mkDate(0,12,0),  minutes:150, date: new Date().toDateString(), app:'VS Code', category:'Development' },
  { id:'te5',  userId:'u2', taskId:'t9', projectId:'p4', description:'Writing unit tests',         startTime: mkDate(0,13,0), endTime: mkDate(0,15,0),  minutes:120, date: new Date().toDateString(), app:'VS Code', category:'Development' },
  { id:'te6',  userId:'u2', taskId:'t10',projectId:'p1', description:'Updating wireframes',        startTime: mkDate(0,15,30),endTime: mkDate(0,17,0),  minutes:90,  date: new Date().toDateString(), app:'Figma', category:'Design' },
  // Vikram – today
  { id:'te7',  userId:'u3', taskId:'t3', projectId:'p4', description:'Setting up PostgreSQL',      startTime: mkDate(0,9,0),  endTime: mkDate(0,10,30), minutes:90,  date: new Date().toDateString(), app:'Terminal', category:'Development' },
  { id:'te8',  userId:'u3', taskId:'t6', projectId:'p2', description:'Payment API integration',    startTime: mkDate(0,11,0), endTime: mkDate(0,13,30), minutes:150, date: new Date().toDateString(), app:'VS Code', category:'Development' },
  // Priya – today
  { id:'te9',  userId:'u4', taskId:'t4', projectId:'p3', description:'Writing Q2 blog post',       startTime: mkDate(0,10,0), endTime: mkDate(0,12,0),  minutes:120, date: new Date().toDateString(), app:'Google Docs', category:'Content' },
  { id:'te10', userId:'u4', taskId:'t11',projectId:'p3', description:'Social media planning',      startTime: mkDate(0,14,0), endTime: mkDate(0,16,0),  minutes:120, date: new Date().toDateString(), app:'Notion', category:'Planning' },
  // Sandeep – today
  { id:'te11', userId:'u5', taskId:'t7', projectId:'p2', description:'Running usability tests',    startTime: mkDate(0,9,0),  endTime: mkDate(0,11,0),  minutes:120, date: new Date().toDateString(), app:'Chrome', category:'Testing' },
  { id:'te12', userId:'u5', taskId:'t7', projectId:'p2', description:'Documenting test results',   startTime: mkDate(0,13,0), endTime: mkDate(0,14,30), minutes:90,  date: new Date().toDateString(), app:'Notion', category:'Documentation' },
  // Yesterday entries
  { id:'te13', userId:'u1', taskId:'t1', projectId:'p1', description:'Initial mockup',             startTime: mkDate(1,9,0),  endTime: mkDate(1,12,0),  minutes:180, date: new Date(Date.now()-86400000).toDateString(), app:'Figma', category:'Design' },
  { id:'te14', userId:'u2', taskId:'t2', projectId:'p2', description:'Bug investigation',          startTime: mkDate(1,10,0), endTime: mkDate(1,13,0),  minutes:180, date: new Date(Date.now()-86400000).toDateString(), app:'VS Code', category:'Development' },
  { id:'te15', userId:'u3', taskId:'t12',projectId:'p1', description:'Deployment scripts',         startTime: mkDate(1,9,0),  endTime: mkDate(1,11,30), minutes:150, date: new Date(Date.now()-86400000).toDateString(), app:'Terminal', category:'Development' },
  { id:'te16', userId:'u4', taskId:'t8', projectId:'p3', description:'Campaign planning',          startTime: mkDate(1,11,0), endTime: mkDate(1,14,0),  minutes:180, date: new Date(Date.now()-86400000).toDateString(), app:'Google Docs', category:'Content' },
];

// ── App usage seed ── per user per day
const seedAppUsage = [
  // Rohit
  { userId:'u1', date: new Date().toDateString(), app:'Figma',       category:'Design',        minutes:180, color:'#8b5cf6' },
  { userId:'u1', date: new Date().toDateString(), app:'Slack',       category:'Communication', minutes:75,  color:'#4a154b' },
  { userId:'u1', date: new Date().toDateString(), app:'Chrome',      category:'Browser',       minutes:55,  color:'#4285f4' },
  { userId:'u1', date: new Date().toDateString(), app:'TeamTask',    category:'Productivity',  minutes:40,  color:'#4f6ef7' },
  { userId:'u1', date: new Date().toDateString(), app:'Gmail',       category:'Communication', minutes:30,  color:'#ea4335' },
  // Anjali
  { userId:'u2', date: new Date().toDateString(), app:'VS Code',     category:'Development',   minutes:270, color:'#007acc' },
  { userId:'u2', date: new Date().toDateString(), app:'Figma',       category:'Design',        minutes:90,  color:'#8b5cf6' },
  { userId:'u2', date: new Date().toDateString(), app:'Chrome',      category:'Browser',       minutes:45,  color:'#4285f4' },
  { userId:'u2', date: new Date().toDateString(), app:'Slack',       category:'Communication', minutes:35,  color:'#4a154b' },
  // Vikram
  { userId:'u3', date: new Date().toDateString(), app:'VS Code',     category:'Development',   minutes:240, color:'#007acc' },
  { userId:'u3', date: new Date().toDateString(), app:'Terminal',    category:'Development',   minutes:90,  color:'#1a1a2e' },
  { userId:'u3', date: new Date().toDateString(), app:'Postman',     category:'Development',   minutes:60,  color:'#ff6c37' },
  { userId:'u3', date: new Date().toDateString(), app:'Slack',       category:'Communication', minutes:40,  color:'#4a154b' },
  { userId:'u3', date: new Date().toDateString(), app:'YouTube',     category:'Distraction',   minutes:25,  color:'#ef4444' },
  // Priya
  { userId:'u4', date: new Date().toDateString(), app:'Google Docs', category:'Content',       minutes:120, color:'#4285f4' },
  { userId:'u4', date: new Date().toDateString(), app:'Notion',      category:'Planning',      minutes:120, color:'#191919' },
  { userId:'u4', date: new Date().toDateString(), app:'Canva',       category:'Design',        minutes:60,  color:'#00c4cc' },
  { userId:'u4', date: new Date().toDateString(), app:'Slack',       category:'Communication', minutes:45,  color:'#4a154b' },
  { userId:'u4', date: new Date().toDateString(), app:'Instagram',   category:'Distraction',   minutes:30,  color:'#e1306c' },
  // Sandeep
  { userId:'u5', date: new Date().toDateString(), app:'Chrome',      category:'Testing',       minutes:200, color:'#4285f4' },
  { userId:'u5', date: new Date().toDateString(), app:'Notion',      category:'Documentation', minutes:90,  color:'#191919' },
  { userId:'u5', date: new Date().toDateString(), app:'VS Code',     category:'Development',   minutes:60,  color:'#007acc' },
  { userId:'u5', date: new Date().toDateString(), app:'Slack',       category:'Communication', minutes:40,  color:'#4a154b' },
  // Neha
  { userId:'u6', date: new Date().toDateString(), app:'Google Docs', category:'Content',       minutes:150, color:'#4285f4' },
  { userId:'u6', date: new Date().toDateString(), app:'Canva',       category:'Design',        minutes:90,  color:'#00c4cc' },
  { userId:'u6', date: new Date().toDateString(), app:'Slack',       category:'Communication', minutes:60,  color:'#4a154b' },
  { userId:'u6', date: new Date().toDateString(), app:'Facebook',    category:'Distraction',   minutes:45,  color:'#1877f2' },
];

// ── Online status seed ──
const seedOnlineStatus = {
  u1: { status:'online',  lastSeen: new Date().toISOString(), location:'Pune, India',    timezone:'IST (UTC+5:30)', workHoursStart:'09:00', workHoursEnd:'18:00' },
  u2: { status:'online',  lastSeen: new Date().toISOString(), location:'Mumbai, India',  timezone:'IST (UTC+5:30)', workHoursStart:'09:30', workHoursEnd:'18:30' },
  u3: { status:'away',    lastSeen: new Date(Date.now()-1200000).toISOString(), location:'Bangalore, India', timezone:'IST (UTC+5:30)', workHoursStart:'10:00', workHoursEnd:'19:00' },
  u4: { status:'online',  lastSeen: new Date().toISOString(), location:'Delhi, India',   timezone:'IST (UTC+5:30)', workHoursStart:'09:00', workHoursEnd:'17:00' },
  u5: { status:'offline', lastSeen: new Date(Date.now()-7200000).toISOString(), location:'Chennai, India', timezone:'IST (UTC+5:30)', workHoursStart:'09:00', workHoursEnd:'18:00' },
  u6: { status:'online',  lastSeen: new Date().toISOString(), location:'Hyderabad, India', timezone:'IST (UTC+5:30)', workHoursStart:'09:00', workHoursEnd:'17:30' },
};



// ── Store getters/setters ───────────────────────────────────────────────────
export function getUsers()    { return stored('ttm_users',    seedUsers);    }
export function getProjects() { return stored('ttm_projects', seedProjects); }
export function getTasks()    { return stored('ttm_tasks',    seedTasks);    }
export function getActivity() { return stored('ttm_activity', seedActivity); }
export function getCurrentUser() { return stored('ttm_me', null); }
export function getTimeEntries()  { return stored('ttm_time_entries', seedTimeEntries); }
export function getAppUsage()     { return stored('ttm_app_usage',    seedAppUsage);    }
export function getOnlineStatus() { return stored('ttm_online_status', seedOnlineStatus); }

export function saveUsers(u)    { save('ttm_users',    u); }
export function saveProjects(p) { save('ttm_projects', p); }
export function saveTasks(t)    { save('ttm_tasks',    t); }
export function saveActivity(a) { save('ttm_activity', a); }
export function saveCurrentUser(u) { save('ttm_me', u); }
export function saveTimeEntries(t)  { save('ttm_time_entries', t); }
export function saveAppUsage(a)     { save('ttm_app_usage',    a); }
export function saveOnlineStatus(s) { save('ttm_online_status', s); }


export function addActivity(userId, action, target, projectName='') {
  const acts = getActivity();
  acts.unshift({ id:'a'+Date.now(), userId, action, target, projectName, time:'Just now', createdAt: Date.now() });
  saveActivity(acts.slice(0, 50));
}

// ── Auth helpers ───────────────────────────────────────────────────────────
export function login(email, password) {
  const users = getUsers();
  const u = users.find(x => x.email === email && x.password === password);
  if (u) { saveCurrentUser(u); return { ok: true, user: u }; }
  return { ok: false, error: 'Invalid email or password' };
}

export function signup(name, email, password) {
  const users = getUsers();
  if (users.find(x => x.email === email)) return { ok: false, error: 'Email already registered' };
  const newUser = { id:'u'+Date.now(), name, email, password, role:'Member', team:'', joinedOn: new Date().toISOString().slice(0,10), bio:'', phone:'', location:'', skills:[] };
  users.push(newUser);
  saveUsers(users);
  saveCurrentUser(newUser);
  return { ok: true, user: newUser };
}

export function logout() { save('ttm_me', null); }

// ── Avatar color ───────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#4f6ef7','#22c55e','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#ec4899','#14b8a6'];
export function avatarColor(id) { return AVATAR_COLORS[parseInt(id?.slice(1)||0) % AVATAR_COLORS.length]; }
export function initials(name='') { return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(); }
