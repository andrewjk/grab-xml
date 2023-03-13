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
  const xmlDoc = grabXml(xml, options);
  const doc = sanitizeNode(xmlDoc);

  const expected = {
    type: XmlNodeType.ELEMENT,
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
  const xml2 = xml.replace(/\>\s+\</g, "><");
  const xmlDoc2 = grabXml(xml2, options);
  const doc2 = sanitizeNode(xmlDoc2);
  assert.equal(doc2, expected);
});

test.run();
