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

function send(res, code, data) {
  res.writeHead(code, {'Content-Type': 'application/json; charset=utf-8'});
  res.end(JSON.stringify(data));
}

function toNumber(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function startServer() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname !== '/') {
      send(res, 404, { error: 'Маршрут не знайдено' });
      return;
    }

    const minRainfallRaw = url.searchParams.get('min_rainfall');
    let minRainfall = null;

    if (minRainfallRaw !== null) {
      minRainfall = Number(minRainfallRaw);
      if (minRainfallRaw.trim() === '' || !Number.isFinite(minRainfall)) {
        send(res, 400, { error: 'Параметр min_rainfall має бути числом' });
        return;
      }
    }

    const showHumidity = url.searchParams.get('humidity') === 'true';

    fs.readFile(options.input, 'utf-8', (err, text) => {
      if (err) {
        send(res, 500, { error: 'Не вдалося прочитати файл даних' });
        return;
      }

      let records;
      try {
        records = JSON.parse(text);
      } catch (parseError) {
        send(res, 500, { error: 'Файл даних пошкоджено' });
        return;
      }

      let result = records;

      if (minRainfall !== null) {
        result = result.filter((record) => {
          const rainfall = toNumber(record.Rainfall);
          return rainfall !== null && rainfall > minRainfall;
        });
      }

      const output = result.map((record) => {
        const item = {
          rainfall: toNumber(record.Rainfall),
          pressure3pm: toNumber(record.Pressure3pm),
        };

        if (showHumidity) {
          item.humidity = toNumber(record.Humidity3pm);
        }

        return item;
      });

      send(res, 200, output);
    });
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