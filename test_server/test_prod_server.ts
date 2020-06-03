import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';

let app: express.Application = express();

app.use(express.static(path.resolve('../frontend/rolecall/dist/rolecall/')));

app.get('*', (req, res) => {
    res.sendFile(path.resolve('../frontend/rolecall/dist/rolecall/index.html'));
});

let port = 2020;
let server = app.listen(port, () => {
    console.log('Express listening on port ' + port);
});