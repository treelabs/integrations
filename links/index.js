var http = require('http');

var page1 = {
    blocks: [
        {
            type: 'heading2',
            value: 'Page 1'
        },
        {
            type: 'link',
            value: 'Go to Page 2',
            attrs: {
                pageId: '2'
            }
        },
        {
            type: 'link',
            value: 'Go to website ↗',
            attrs: {
                url: 'https://withtree.com'
            }
        },
        {
            type: 'image',
            value: 'https://source.unsplash.com/800x600/?forest',
            attrs: {
                format: 'landscape',
                caption: 'Images can also open links.',
                onClick: {
                    action: 'open',
                    payload: {
                        pageId: '2'
                    }
                }
            }
        }
    ]
};

var page2 = {
    blocks: [
        {
            type: 'heading2',
            value: 'Page 2'
        }
    ]
};

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
        var page = (body.page_id === '2') ? page2 : page1;
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(page));
    });
})

app.listen(process.argv[2] || 3000);
