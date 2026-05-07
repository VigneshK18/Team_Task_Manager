require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const sequelize = require('./database/db');
const { User, Project, Task } = require('./database/models');

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'local_dev_secret';

/* ---------------- AUTH MIDDLEWARE ---------------- */

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'No token provided'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Invalid token'
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({
      error: 'Requires Admin role'
    });
  }

  next();
};

/* ---------------- SEED DATABASE ---------------- */

const seedDatabase = async () => {
  const adminExists = await User.findOne({
    where: { email: 'admin@example.com' }
  });

  if (adminExists) return;

  const adminPassword = await bcrypt.hash('admin123', 10);
  const memberPassword = await bcrypt.hash('pass123', 10);

  await User.bulkCreate([
    {
      id: 'u1',
      name: 'Rohit Sharma',
      email: 'admin@example.com',
      role: 'Admin',
      team: 'Management',
      password: adminPassword
    },
    {
      id: 'u2',
      name: 'Anjali Singh',
      email: 'anjali@example.com',
      role: 'Member',
      team: 'Development',
      password: memberPassword
    }
  ]);

  await Project.bulkCreate([
    {
      id: 'p1',
      name: 'Website Redesign',
      color: '#3b82f6'
    },
    {
      id: 'p2',
      name: 'Mobile App',
      color: '#22c55e'
    }
  ]);

  await Task.bulkCreate([
    {
      id: 't1',
      title: 'Design homepage',
      projectId: 'p1',
      status: 'In Progress',
      priority: 'High',
      assigneeId: 'u1'
    },
    {
      id: 't2',
      title: 'Setup database',
      projectId: 'p2',
      status: 'To Do',
      priority: 'High',
      assigneeId: 'u2'
    }
  ]);

  console.log('Seed data inserted');
};

/* ---------------- AUTH APIs ---------------- */

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role, team } = req.body;

    const existing = await User.findOne({
      where: { email }
    });

    if (existing) {
      return res.status(400).json({
        error: 'Email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      id: 'u_' + Date.now(),
      name,
      email,
      password: hashedPassword,
      role: role || 'Member',
      team
    });

    const token = jwt.sign(
      {
        id: newUser.id,
        role: newUser.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        team: newUser.team
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Invalid credentials'
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        error: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: user.team
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

/* ---------------- USERS ---------------- */

app.get('/api/users', authenticate, async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] }
  });

  res.json(users);
});

app.delete('/api/users/:id', authenticate, requireAdmin, async (req, res) => {
  await User.destroy({
    where: { id: req.params.id }
  });

  res.json({
    success: true
  });
});

/* ---------------- PROJECTS ---------------- */

app.get('/api/projects', authenticate, async (req, res) => {
  const projects = await Project.findAll();
  res.json(projects);
});

app.post('/api/projects', authenticate, requireAdmin, async (req, res) => {
  const { name, color } = req.body;

  const project = await Project.create({
    id: 'p_' + Date.now(),
    name,
    color
  });

  res.json(project);
});

/* ---------------- TASKS ---------------- */

app.get('/api/tasks', authenticate, async (req, res) => {
  const tasks = await Task.findAll();
  res.json(tasks);
});

app.post('/api/tasks', authenticate, async (req, res) => {
  const task = await Task.create({
    id: 't_' + Date.now(),
    ...req.body
  });

  res.json(task);
});

app.put('/api/tasks/:id', authenticate, async (req, res) => {
  await Task.update(req.body, {
    where: { id: req.params.id }
  });

  const updatedTask = await Task.findByPk(req.params.id);

  res.json(updatedTask);
});

app.delete('/api/tasks/:id', authenticate, async (req, res) => {
  await Task.destroy({
    where: { id: req.params.id }
  });

  res.json({
    success: true
  });
});

/* ---------------- HEALTH CHECK ---------------- */

app.get('/', (req, res) => {
  res.send('Team Task Manager Backend Running');
});

/* ---------------- START SERVER ---------------- */

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    await sequelize.sync();
    console.log('Tables synced');

    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Startup failed:', error);
  }
};

startServer();