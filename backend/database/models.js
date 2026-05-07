const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const User = sequelize.define('User', {
  id: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'Member' },
  team: { type: DataTypes.STRING },
  bio: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING },
  skills: { type: DataTypes.JSON, defaultValue: [] }
});

const Project = sequelize.define('Project', {
  id: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  color: { type: DataTypes.STRING }
});

const Task = sequelize.define('Task', {
  id: { type: DataTypes.STRING, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  projectId: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'To Do' },
  priority: { type: DataTypes.STRING, defaultValue: 'Medium' },
  dueDate: { type: DataTypes.STRING },
  assigneeId: { type: DataTypes.STRING }
});

// Relationships
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

User.hasMany(Task, { foreignKey: 'assigneeId', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

module.exports = { User, Project, Task };
