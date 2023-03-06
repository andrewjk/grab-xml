import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import { XmlNodeType } from "../../types/XmlNode";
import sanitizeNode from "../sanitizeNode";

test("XML with character data (CDATA)", () => {
  const xml = `
<xml>
  <![CDATA[I'm <em>character</em> data]]>
</xml>
`;

  const doc = grabXml(xml);
  sanitizeNode(doc);

  const expected = {
    type: XmlNodeType.ELEMENT,
    tagName: "#root",
    attributes: {},
    children: [
      {
        type: XmlNodeType.ELEMENT,
        tagName: "xml",
        attributes: {},
        children: [
          {
            type: XmlNodeType.TEXT,
            text: "I'm <em>character</em> data",
          },
        ],
      },
    ],
  };

  assert.equal(doc, expected);

  // Also try it without spaces between elements
  const doc2 = grabXml(xml.replace(/\>\s+\</g, "><"));
  sanitizeNode(doc2);
  assert.equal(doc2, expected);
});

test.run();
