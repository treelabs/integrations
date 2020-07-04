const { get, indexOf, map, isEmpty } = require('lodash');

const parsePage = async (entry) => {
    // Parse a Contentful entry into a Page
    let title = null
    let blocks = []
    try {
        title = entry.fields.title
    } catch (e) {}

    try {
        blocks = await parseBlocks(entry.fields.content)
    } catch (e) {
        console.log("Error: " + e)
    }

    return { title, blocks }
}

const parseBlocks = async (json) => {
    // Parse a list of Contentful nodes into a list of Blocks
    if (json == undefined || json.content == undefined) {
        return null;
    }

    if (json.content && json.content.length === 1 && json.content[0].content && json.content[0].content.length === 1) {
        const value = get(json, 'content[0].content[0].value');
        const isTypeform = /https?:\/\/(.*)\.typeform\.com\/(.*)/.test(value);
        if (isTypeform) {
            return [{
                    type: 'typeform',
                    value: value,
                    attrs: {
                        fullscreen: true
                    }
                }];
        }
    }
    const parsed = await Promise.all(json.content.map(async item => {
        try {
            return await parse(item)
        } catch (e) {
            return null
        }
    }))
    return map(parsed).filter(n => n)
}

const parse = async (node) => {
    // Parse a single Contentful content node into a Block
    if (node.nodeType === undefined) { return undefined }
    if (node.nodeType.startsWith("heading")) {
        return parseHeading(node, parseInt(node.nodeType.split("-")[1]))
    } else if (node.nodeType == "blockquote") {
        return await parseQuote(node)
    } else if (node.nodeType == "paragraph") {
        return parseParagraph(node)
    } else if (node.nodeType == "embedded-asset-block") {
        return await parseEmbeddedAssetBlock(node)
    } else if (node.nodeType == "unordered-list") {
        return parseBulletedList(node)
    } else if (node.nodeType == "ordered-list") {
        return parseNumberedList(node)
    } else if (node.nodeType == "hr") {
        return parseDivider(node)
    }
    return undefined
}

const parseInlineText = (node) => {
    //
    // Example Contentful object:
    //
    // {
    //   "data": {},
    //   "marks": [
    //     {
    //       "type": "bold"
    //     }
    //   ],
    //   "value": "Bold",
    //   "nodeType": "text"
    // }
    //
    // or
    //
    // {
    //   "data": {
    //     "uri": "https://www.withtree.com"
    //   },
    //   "content": [
    //     {
    //       "data": {},
    //       "marks": [],
    //       "value": "Tree website",
    //       "nodeType": "text"
    //     }
    //   ],
    //   "nodeType": "hyperlink"
    // }
    if (node.nodeType == "text") {
        const marks = map(node.marks, (d) => d.type)
        if (indexOf(marks, "bold") >= 0) {
            return `**${node.value}**`
        } else if (indexOf(marks, "italic") >= 0) {
            return `*${node.value}*`
        } else if (indexOf(marks, "code") >= 0) {
            return `\`${node.value}\``
        }
    } else if (node.nodeType == "hyperlink") {
        const label = node.content.map(parseInlineText).join("")
        return `[${label}](${node.data.uri})`
    } else if (node.nodeType == "entry-hyperlink") {
        const label = node.content.map(parseInlineText).join("");
        const encodedPageId = encodeURIComponent(node.data.target.sys.id);
        return `[${label}](withtree://?pageId=${encodedPageId})`;
    }
    return node.value
}

const parseHeading = (node, num) => {
    //
    // Example Contentful object:
    //
    // {
    //   "data": {},
    //   "content": [
    //     {
    //       "data": {},
    //       "marks": [],
    //       "value": "Large title",
    //       "nodeType": "text"
    //     }
    //   ],
    //   "nodeType": "heading-1"
    // }
    return {
        type: "heading" + num,
        value: node.content.map(parseInlineText).join("")
    }
}

const parseParagraph = (node) => {
    //
    // Example Contentful object:
    //
    //  {
    //    "data": {},
    //    "content": [
    //      {
    //        "data": {},
    //        "marks": [
    //          {
    //            "type": "bold"
    //          }
    //        ],
    //        "value": "Bold",
    //        "nodeType": "text"
    //      },
    //      {
    //        "data": {},
    //        "marks": [],
    //        "value": " ",
    //        "nodeType": "text"
    //      },
    //      {
    //        "data": {},
    //        "marks": [
    //          {
    //            "type": "italic"
    //          }
    //        ],
    //        "value": "italic",
    //        "nodeType": "text"
    //      }
    //    ],
    //    "nodeType": "paragraph"
    //  }
    const trimmedBlocks = node.content
        .filter(b => { return !isEmpty(b.value) || !isEmpty(b.content) || !isEmpty(b.data) })

    // If the content is a single entry hyperlink, convert it to a Link Block
    if (trimmedBlocks.length === 1 && trimmedBlocks[0].nodeType === "entry-hyperlink") {
        const node = trimmedBlocks[0]
        return {
            type: "link",
            value: parseParagraph(node).value,
            attrs: {
                pageId: node.data.target.sys.id
            }
        }
    }
    
    return {
        type: "text",
        value: node.content.map(parseInlineText).join("")
    }
}

const parseQuote = async (node) => {
    //
    // Example Contentful object:
    //
    // {
    //   "data": {},
    //   "content": [
    //     {
    //       "data": {},
    //       "content": [
    //         {
    //           "data": {},
    //           "marks": [],
    //           "value": "A quote from our partner",
    //           "nodeType": "text"
    //         }
    //       ],
    //       "nodeType": "paragraph"
    //     }
    //   ],
    //   "nodeType": "blockquote"
    // }
    const parsed = await Promise.all(node.content.map(async item => { return await parse(item) }))
    return {
        type: "quote",
        value: parsed
    }
}

const parseEmbeddedAssetBlock = async (node) => {
    //
    // Example Contentful object:
    //
    // {
    //   "data": {
    //     "target": {
    //       "sys": {
    //         "space": {
    //           "sys": {
    //             "type": "Link",
    //             "linkType": "Space",
    //             "id": "nttg4jfd16qt"
    //           }
    //         },
    //         "id": "2xm0ej9f1ks5Sujd1yhjGi",
    //         "type": "Asset",
    //         "createdAt": "2019-01-25T11:29:07.593Z",
    //         "updatedAt": "2019-01-25T11:29:07.593Z",
    //         "environment": {
    //           "sys": {
    //             "id": "master",
    //             "type": "Link",
    //             "linkType": "Environment"
    //           }
    //         },
    //         "revision": 1,
    //         "locale": "en-US"
    //       },
    //       "fields": {
    //         "title": "Building",
    //         "file": {
    //           "url": "//images.ctfassets.net/nttg4jfd16qt/2xm0ej9f1ks5Sujd1yhjGi/be15300661525cba810dde18691130a4/simone-hutsch-1319976-unsplash.jpg",
    //           "details": {
    //             "size": 1397162,
    //             "image": {
    //               "width": 3956,
    //               "height": 3650
    //             }
    //           },
    //           "fileName": "simone-hutsch-1319976-unsplash.jpg",
    //           "contentType": "image/jpeg"
    //         }
    //       }
    //     }
    //   },
    //   "content": [],
    //   "nodeType": "embedded-asset-block"
    // }
    let url = node.data.target.fields.file.url
    if (!url) {
        return null
    }

    if (!url.startsWith('http')) {
        url = `https:${url}`
    }

    let block = {
        type: "image",
        value: url,
        attrs: {}
    }

    try {
        if (node.data.target.fields.title) {
            block["attrs"]["caption"] = node.data.target.fields.title
        }
    } catch (e) {}


    try {
        block["attrs"]["width"] = parseInt(node.data.target.fields.file.details.image.width)
        block["attrs"]["height"] = parseInt(node.data.target.fields.file.details.image.height)
    } catch (e) {}

    return block
}

const parseBulletedList = async (node) => {
    //
    // {
    //   "data": {},
    //   "content": [
    //     {
    //       "data": {},
    //       "content": [
    //         {
    //           "data": {},
    //           "content": [
    //             {
    //               "data": {},
    //               "marks": [],
    //               "value": "First option",
    //               "nodeType": "text"
    //             }
    //           ],
    //           "nodeType": "paragraph"
    //         }
    //       ],
    //       "nodeType": "list-item"
    //     },
    //     {
    //       "data": {},
    //       "content": [
    //         {
    //           "data": {},
    //           "content": [
    //             {
    //               "data": {},
    //               "marks": [],
    //               "value": "Second option",
    //               "nodeType": "text"
    //             }
    //           ],
    //           "nodeType": "paragraph"
    //         }
    //       ],
    //       "nodeType": "list-item"
    //     },
    //     {
    //       "data": {},
    //       "content": [
    //         {
    //           "data": {},
    //           "content": [
    //             {
    //               "data": {},
    //               "marks": [],
    //               "value": "Third option",
    //               "nodeType": "text"
    //             }
    //           ],
    //           "nodeType": "paragraph"
    //         }
    //       ],
    //       "nodeType": "list-item"
    //     }
    //   ],
    //   "nodeType": "unordered-list"
    // }
    const parsed = await Promise.all(node.content
        .map(n => n.content[0])
        .map(async item => { return await parse(item) }))
        
    
    return {
        type: "bulletedlist",
        value: parsed.map(block => { return block.value })
    }
}

const parseNumberedList = async (node) => {
        //
    // {
    //   "data": {},
    //   "content": [
    //     {
    //       "data": {},
    //       "content": [
    //         {
    //           "data": {},
    //           "content": [
    //             {
    //               "data": {},
    //               "marks": [],
    //               "value": "First option",
    //               "nodeType": "text"
    //             }
    //           ],
    //           "nodeType": "paragraph"
    //         }
    //       ],
    //       "nodeType": "list-item"
    //     },
    //     {
    //       "data": {},
    //       "content": [
    //         {
    //           "data": {},
    //           "content": [
    //             {
    //               "data": {},
    //               "marks": [],
    //               "value": "Second option",
    //               "nodeType": "text"
    //             }
    //           ],
    //           "nodeType": "paragraph"
    //         }
    //       ],
    //       "nodeType": "list-item"
    //     },
    //     {
    //       "data": {},
    //       "content": [
    //         {
    //           "data": {},
    //           "content": [
    //             {
    //               "data": {},
    //               "marks": [],
    //               "value": "Third option",
    //               "nodeType": "text"
    //             }
    //           ],
    //           "nodeType": "paragraph"
    //         }
    //       ],
    //       "nodeType": "list-item"
    //     }
    //   ],
    //   "nodeType": "ordered-list"
    // }
    const parsed = await Promise.all(node.content.map(n => n.content[0])
        .map(async item => { return await parse(item) }))
        
    return {
        type: "numberedlist",
        value: parsed.map(block => { return block.value })
    }
}

const parseDivider = (node) => {
    //
    // Example Contentful object:
    //
    // {
    //   "data": {},
    //   "content": [],
    //   "nodeType": "hr"
    // }
    return {
        type: "divider"
    }
}

module.exports = parsePage
