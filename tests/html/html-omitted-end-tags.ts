/*
import * as assert from "uvu/assert";
import grabHtml from "../../src/grabHtml";
import XmlNodeType from "../../types/XmlNodeType";
import sanitizeNode from "../sanitizeNode";

export default { name: "HTML omitted end tags", test: () => {
  const html = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <h1>HTML Document</h1>
    <p>
      Paragraph one.
    <p>
      Paragraph two.
    <ol>
      <li>List item one
      <li>List item two
    </ol>
  </body>
</html>
`;

  const htmlDoc = grabHtml(html);
  const doc = sanitizeNode(htmlDoc);

  const expected = {
    type: XmlNodeType.ELEMENT,
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
            tag: "body",
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
}};
*/
