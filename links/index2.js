// An example of links between pages with parameters (params).
var http = require('http');
var querystring = require('querystring');

// The main page 1 has fixed content.
var page1 = {
    blocks: [
        {
            type: 'heading2',
            value: 'Page 1'
        },
        {
            type: 'link',
            value: 'Go to Page 2: Kitten',
            attrs: {
                pageId: '2',
                params: {
                    'image_name': 'Cute Kitten',
                    'image_url': 'https://source.unsplash.com/800x600/?kitten',
                }
            }
        },
        {
            type: 'link',
            value: 'Go to Page 2: Puppy',
            attrs: {
                pageId: '2',
                params: {
                    'image_name': 'A Sweet Puppy',
                    'image_url': 'https://source.unsplash.com/800x600/?puppy',
                }
            }
        },
    ]
};

// The second page 2 uses two parameters for an image name and URL.
var makePage2 = (params) => ({
    blocks: [
        {
            type: 'heading2',
            value: 'Page 2'
        },
        {
            type: 'text',
            value: `${params.image_name}`
        },
        {
            type: 'image',
            value: `${params.image_url}`,
            attrs: {
                format: 'landscape'
            }
        },
        {
            type: 'link',
            value: 'Back',
            attrs: {
                pageId: '1'
            }
        }
    ]
});

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
        if (body.page_id === '2') {
            // parse the parameters from query string such as 'a=b&c=d' to an object such as {a: 'b', c: 'd'}
            var params = body.params ? querystring.parse(body.params) : {};
            page = makePage2(params);
        } else {
            page = page1;
        }
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(page));
    });
})

app.listen(process.argv[2] || 3000);
