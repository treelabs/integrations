exports.page = {
    blocks: [
        {
            type: 'image',
            value: 'https://images.unsplash.com/photo-1496776574435-bf184935f729',
            attrs: {
                caption: 'Tap the image to go to withtree.com →',
                format: 'landscape',
                onClick: {
                    action: 'open',
                    payload: {
                        url: 'https://withtree.com'
                    }
                }
            }
        },
        {
            type: 'heading2',
            value: 'Showcase',
        },
        {
            type: 'collection',
            value: {
                items: [
                    'Actions',
                    'Collections',
                    'Operators',
                ]
            },
            attrs: {
                viewType: 'gallery',
                itemSize: 'medium',
                renderItem: {
                    blocks: [
                        {
                            type: 'button',
                            value: '${item}',
                            attrs: {
                                fill: 'true',
                                onClick: {
                                    action: 'open',
                                    payload: {
                                        pageId: '${lowercase(item)}'
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        },
        {
            type: 'divider'
        },
        {
            type: 'heading3',
            value: 'Examples',
        },
        {
            type: 'link',
            value: 'Blocks Gallery',
            attrs: {
                pageId: 'blocks',
                iconUrl: 'https://img.icons8.com/color/48/000000/stack-of-photos.png'
            }
        },
        {
            type: 'link',
            value: 'QR Code',
            attrs: {
                pageId: 'qr',
                iconUrl: 'https://img.icons8.com/color/48/000000/qr-code.png'
            }
        }
    ]
}
