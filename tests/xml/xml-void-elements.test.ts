import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import XmlNodeType from "../../types/XmlNodeType";
import sanitizeNode from "../sanitizeNode";

test("XML with void elements", () => {
  const xml = `
<xml>
  <element>
  <element>
</xml>
`;

  const options = { voidElements: ["element"] };
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
            type: XmlNodeType.ELEMENT,
            tag: "element",
          },
          {
            type: XmlNodeType.ELEMENT,
            tag: "element",
          },
        ],
      },
    ],
  };

  assert.equal(doc, expected);

  // Also try it without spaces between elements
  const xml2 = xml.replace(/\>\s+\</g, "><");
  const doc2 = grabXml(xml2, options);
  sanitizeNode(doc2);
  assert.equal(doc2, expected);
});

test.run();
