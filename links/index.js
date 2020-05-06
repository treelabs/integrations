// An example of links between pages with parameters (params).
var http = require('http');
var querystring = require('querystring');

var page1 = {
    blocks: [
        {
            type: 'heading2',
            value: 'Page 1'
        },
        {
            type: 'text',
            value: 'This is the main page that links to the other pages.'
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
        },
        {
            type: 'heading3',
            value: 'Links with parameters:'
        },
        {
            type: 'text',
            value: 'You can pass parameters between pages to customize their appearance and behavior.'
        },
        {
            type: 'link',
            value: 'Go to Page 3: Kitten',
            attrs: {
                pageId: '3',
                params: {
                    'image_name': 'Cute Kitten',
                    'image_url': 'https://source.unsplash.com/800x600/?kitten',
                }
            }
        },
        {
            type: 'link',
            value: 'Go to Page 3: Puppy',
            attrs: {
                pageId: '3',
                params: {
                    'image_name': 'A Sweet Puppy',
                    'image_url': 'https://source.unsplash.com/800x600/?puppy',
                }
            }
        },
    ]
};

var page2 = {
    blocks: [
        {
            type: 'heading2',
            value: 'Page 2'
        },
        {
            type: 'link',
            value: 'Back',
            attrs: {
                pageId: '1'
            }
        }
    ]
};

// Page 3 uses two parameters for an image name and URL.
var makePage3 = (params) => ({
    blocks: [
        {
            type: 'heading2',
            value: 'Page 3'
        },
        {
            type: 'text',
            value: `This image is called: ${params.image_name}`
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
        if (body.page_id === '3') {
            // parse the parameters from query string such as 'a=b&c=d' to an object such as {a: 'b', c: 'd'}
            var params = body.params ? querystring.parse(body.params) : {};
            page = makePage3(params);
        } else if (body.page_id === '2') {
            page = page2;
        } else {
            page = page1;
        }
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(page));
    });
})

app.listen(process.argv[2] || 3000);
