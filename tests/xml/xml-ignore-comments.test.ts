import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import XmlNodeType from "../../types/XmlNodeType";
import sanitizeNode from "../sanitizeNode";

test("XML ignoring comments", () => {
  const xml = `
<xml>
  <!-- I'm a comment -->
  I'm some text
</xml>
`;

  const options = { ignoreComments: true };
  const doc = grabXml(xml, options);
  sanitizeNode(doc);

  const expected = {
    type: XmlNodeType.ELEMENT,
    tag: "#root",
    children: [
      {
        type: XmlNodeType.ELEMENT,
        tag: "xml",
        children: [
          {
            type: XmlNodeType.TEXT,
            text: "I'm some text",
          },
        ],
      },
    ],
  };

  assert.equal(doc, expected);

  // Also try it without spaces between elements
  const doc2 = grabXml(xml.replace(/\>\s+\</g, "><"), options);
  sanitizeNode(doc2);
  assert.equal(doc2, expected);
});

test.run();
