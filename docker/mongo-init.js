// MongoDB initialization script
// Creates application user with appropriate permissions

db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE || 'content_sphere');

db.createUser({
  user: process.env.MONGO_USER || 'app',
  pwd: process.env.MONGO_PASSWORD || 'changeme',
  roles: [
    {
      role: 'readWrite',
      db: process.env.MONGO_INITDB_DATABASE || 'content_sphere',
    },
  ],
});

print('MongoDB initialization complete');
