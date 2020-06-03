import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';

let app: express.Application = express();

app.use((req, res, next) => {
    console.log(`${req.url=='/' || req.url=='' || !req.url || ((!req.url.endsWith('.js')) && (!req.url.endsWith('.css'))) ? '\n' : ''}New connection on url ${req.url}!`);
    next();
});

app.use(express.static(path.resolve('../frontend/rolecall/dist/rolecall/')));

let serveIndex : express.RequestHandler = (req, res) => {
    res.sendFile(path.resolve('../frontend/rolecall/dist/rolecall/index.html'));
};

app.get('', serveIndex);
app.get('*', serveIndex);

let port = 2020;
let server = app.listen(port, () => {
    console.log('Express listening on port ' + port);
});