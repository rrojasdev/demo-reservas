import { createDatabase } from './db/database.js';
import { port } from './config/environment.js';
import { createApp } from './http/app.js';

const database = createDatabase();
const app = createApp(database);

app.listen(port, '0.0.0.0', () => {
  console.log(`Padel reservations API listening on http://localhost:${port}`);
});
