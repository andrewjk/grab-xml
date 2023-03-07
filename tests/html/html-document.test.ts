import { test } from "uvu";
import * as assert from "uvu/assert";
import grabHtml from "../../src/grabHtml";
import XmlNodeType from "../../types/XmlNodeType";
import sanitizeNode from "../sanitizeNode";

test("HTML document", () => {
  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <script>
      <!-- Ignore me -->
    </script>

    <title>HTML Document</title>    
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" type="text/css" href="style.css">
    <script src="script.js"></script>

    <style>
        h1 {
          color: blue;
        }
    </style>
  </head>
  <body style="background-color: yellow;">
    <h1>HTML Document</h1>
    <hr>
    <p>
      This should be parsed correctly.
    </p>
    <script>
      console.log('hi!');
    </script>
  </body>
</html>
`;

  const doc = grabHtml(html);
  sanitizeNode(doc);

  const expected = {
    type: XmlNodeType.ELEMENT,
    tag: "#root",
    children: [
      {
        type: XmlNodeType.INSTRUCTION,
        tag: "!DOCTYPE",
        text: "html",
      },
      {
        type: XmlNodeType.ELEMENT,
        tag: "html",
        attributes: {
          lang: "en",
        },
        children: [
          {
            type: XmlNodeType.ELEMENT,
            tag: "head",
            children: [
              {
                type: XmlNodeType.LITERAL,
                tag: "script",
                text: `<!-- Ignore me -->`,
              },
              {
                type: XmlNodeType.ELEMENT,
                tag: "title",
                children: [
                  {
                    type: XmlNodeType.TEXT,
                    text: "HTML Document",
                  },
                ],
              },
              {
                type: XmlNodeType.ELEMENT,
                tag: "meta",
                attributes: {
                  charset: "UTF-8",
                },
              },
              {
                type: XmlNodeType.ELEMENT,
                tag: "meta",
                attributes: {
                  name: "viewport",
                  content: "width=device-width,initial-scale=1",
                },
              },
              {
                type: XmlNodeType.ELEMENT,
                tag: "link",
                attributes: {
                  rel: "stylesheet",
                  type: "text/css",
                  href: "style.css",
                },
              },
              {
                type: XmlNodeType.LITERAL,
                tag: "script",
                attributes: {
                  src: "script.js",
                },
              },
              {
                type: XmlNodeType.LITERAL,
                tag: "style",
                text: `h1 {\n          color: blue;\n        }`,
              },
            ],
          },
          {
            type: XmlNodeType.ELEMENT,
            tag: "body",
            attributes: {
              style: "background-color: yellow;",
            },
            children: [
              {
                type: XmlNodeType.ELEMENT,
                tag: "h1",
                children: [
                  {
                    type: XmlNodeType.TEXT,
                    text: "HTML Document",
                  },
                ],
              },
              {
                type: XmlNodeType.ELEMENT,
                tag: "hr",
              },
              {
                type: XmlNodeType.ELEMENT,
                tag: "p",
                children: [
                  {
                    type: XmlNodeType.TEXT,
                    text: "This should be parsed correctly.",
                  },
                ],
              },
              {
                type: XmlNodeType.LITERAL,
                tag: "script",
                text: `console.log('hi!');`,
              },
            ],
          },
        ],
      },
    ],
  };

  assert.equal(doc, expected);
});

test.run();
