var http = require('http');

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

    var page = {
        blocks: [
            {
                type: 'image',
                value: 'https://images.unsplash.com/photo-1546548970-71785318a17b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=934&q=80',
                attrs: {
                    format: 'landscape'
                }
            },
            {
                type: 'heading1',
                value: 'Welcome'
            },
            {
                type: 'text',
                value: 'Your first page!'
            },
            {
                type: 'bulletedlist',
                value: ['With', 'Bullet', 'Points']
            },
            {
                type: 'divider'
            },
            {
                type: 'quote',
                value: 'And a quote'
            },
            {
                type: 'heading3',
                value: 'A section heading'
            },
            {
                type: 'text',
                value: 'And some longer text spanning across multiple lines.'
            }
        ]
    };

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(page));
})

app.listen(process.argv[2] || 3000);
