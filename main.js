import {Command} from 'commander';
import fs from 'node:fs';

const program = new Command();

program
 .helpOption('-H, --help', 'показати довідку')
 .requiredOption('-i, --input <path>', 'шляд до файлу даних')
 .requiredOption('-h, --host <adress>', 'адреса сервера')
 .requiredOption('-p, --port <number>', 'порт сервера')
 .option('-o, --output <path>', 'файл для останньої відповіді');

 program.parse();
 const options = program.opts();

 fs.access(options.input, (err) => {
  if (err) {
    console.error('Cannot find input file');
    process.exit(1);
  }
  console.log('Файл знайдено, можна рухатись далі');
});