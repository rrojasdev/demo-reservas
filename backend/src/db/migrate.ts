import { createDatabase } from './database.js';

const database = createDatabase();
database.close();
console.log('Database migrated');
