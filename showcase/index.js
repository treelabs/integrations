var http = require('http');

const welcome = require('./welcome');
const actions = require('./actions');
const operators = require('./operators');
const collections = require('./collections');
const blocks = require('./blocks');
const blocksBasic = require('./blocks-basic');
const blocksInput = require('./blocks-input');
const blocksCollections = require('./blocks-collections');
const blocksMedia = require('./blocks-media');
const blocksEmbed = require('./blocks-embed');
const qr = require('./qr');

var app = http.createServer(function (req, res) {
    // Enable CORS, so that clients can call the Hook.
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers',
        'Authorization, Accept, Content-Type')

    if (req.method !== 'POST') {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.write('Not found');
        res.end();
    }

    var payload = '';
    req.on('data', function (chunk) {
        payload += chunk;
    });

    req.on('end', function () {
        var body = JSON.parse(payload);
        var page;
        switch (body.page_id) {
            case 'actions': page = actions.page; break;
            case 'operators': page = operators.page; break;
            case 'collections': page = collections.page; break;
            case 'blocks': page = blocks.page; break;
            case 'blocks-basic': page = blocksBasic.page; break;
            case 'blocks-input': page = blocksInput.page; break;
            case 'blocks-collections': page = blocksCollections.page; break;
            case 'blocks-media': page = blocksMedia.page; break;
            case 'blocks-embed': page = blocksEmbed.page; break;
            case 'qr': page = qr.page; break;
            default: page = welcome.page; break;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(page));
    });
})

app.listen(process.argv[2] || 3000);
