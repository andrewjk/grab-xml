import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import XmlNodeType from "../../types/XmlNodeType";
import sanitizeNode from "../sanitizeNode";

test("XML with self-closing elements", () => {
  const xml = `
<xml>
  <element />
  <element />
</xml>
`;

  const doc = grabXml(xml);
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
});

test.run();
