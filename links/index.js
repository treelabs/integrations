// An example of links between pages.
var http = require('http');

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
                path: '2'
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
                        path: '2'
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
                path: '3/kitten',
            }
        },
        {
            type: 'link',
            value: 'Go to Page 3: Puppy',
            attrs: {
                path: '3/puppy',
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

// Page 3 uses a parameter for an image URL component.
var makePage3 = (image) => ({
    blocks: [
        {
            type: 'heading2',
            value: 'Page 3'
        },
        {
            type: 'text',
            value: `This image is called: ${image}`
        },
        {
            type: 'image',
            value: `https://source.unsplash.com/800x600/?${image}`,
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
        var path = body.path || '';
        var page;
        if (path.startsWith('3')) {
            // parse the image URL
            var image = path.replace('3/', '');
            page = makePage3(image);
        } else if (path.startsWith('2')) {
            page = page2;
        } else {
            page = page1;
        }
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(page));
    });
})

app.listen(process.argv[2] || 3000);
