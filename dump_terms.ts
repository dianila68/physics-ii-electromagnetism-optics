import { TERMS } from './src/content/terms.js';
import * as fs from 'fs';
fs.writeFileSync('./public/terms.json', JSON.stringify(TERMS, null, 2));
console.log('Terms dumped to public/terms.json');
