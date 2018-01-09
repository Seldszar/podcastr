const fs = require('fs-plus');
const hjson = require('hjson');
const parse = require('yargs-parser');
const createApplication = require('../lib');

const argv = parse(process.argv.slice(2));
const configFilePath = fs.resolve(process.cwd(), argv.config || 'config', ['hjson', 'json', '']);

if (configFilePath) {
  const config = hjson.parse(fs.readFileSync(configFilePath, 'utf8'));
  const app = createApplication({ config });

  process.on('SIGINT', () => {
    app.close();
  });

  app.start();
}
