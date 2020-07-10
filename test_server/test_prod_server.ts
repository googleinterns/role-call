import * as express from 'express';
import * as path from 'path';

const app: express.Application = express();

app.use((req, res, next) => {
  console.log(`${req.url === '/' || req.url === '' || !req.url ||
    ((!req.url.endsWith('.js')) && (!req.url.endsWith('.css'))) ? '\n' : ''}
    New connection on url ${req.url}!`);
  next();
});

app.use(express.static(path.resolve('../frontend/rolecall/dist/rolecall/')));

const serveIndex: express.RequestHandler = (req, res) => {
  res.sendFile(path.resolve('../frontend/rolecall/dist/rolecall/index.html'));
};

app.get('', serveIndex);
app.get('*', serveIndex);

const port = process.env.PORT || 2020;
const server = app.listen(port, () => {
  console.log('Express listening on port ' + port);
});
