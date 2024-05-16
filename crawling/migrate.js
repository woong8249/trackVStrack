import { integrateAllFile } from './src/services/integrate.js';
import migrate from './src/services/migrate.js';

await integrateAllFile();
await migrate();
process.exit();
