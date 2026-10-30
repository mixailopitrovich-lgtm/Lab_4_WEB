import {Command} from 'commander';
import fs from 'node:fs';
import http from 'node:http';

const program = new Command();

program
 .helpOption('-H, --help', 'показати довідку')
 .requiredOption('-i, --input <path>', 'шлях до файлу даних')
 .requiredOption('-h, --host <address>', 'адреса сервера')
 .requiredOption('-p, --port <number>', 'порт сервера')
 .option('-o, --output <path>', 'файл для останньої відповіді');

 program.parse();
 const options = program.opts();

 function send(res, code, data){
  res.writeHead(code, {'Content-Type': 'application/json; charset=utf-8'});
  res.end(JSON.stringify(data));
 }

 function startServer(){
     const server = http.createServer((req, res) => {
      const url = new URL(req.url, 'http://${req.headers.host}');
      
      if (url.pathname !== '/') {
      send(res, 404, { error: 'Маршрут не знайдено'});
      return;
      }

      send(res, 200, { message: 'Сервер працює'});
     });
     server.listen(Number(options.port), options.host, () => {
      console.log(`Сервер запущено: http://${options.host}:${options.port}`);
    });
 }

 fs.access(options.input, (err) => {
  if (err) {
    console.error('Cannot find input file');
    process.exit(1);
  }
  startServer();
});