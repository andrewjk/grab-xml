import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import { XmlNodeType } from "../../types/XmlNode";
import sanitizeNode from "../sanitizeNode";

test("XML with double-quoted attributes", () => {
  const xml = `
<xml attribute="value">
  <element attribute2="value 2" />
  <element attribute3="value 3"/>
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
        attributes: {
          attribute: "value",
        },
        children: [
          {
            type: XmlNodeType.ELEMENT,
            tagName: "element",
            attributes: {
              attribute2: "value 2",
            },
            children: [],
          },
          {
            type: XmlNodeType.ELEMENT,
            tagName: "element",
            attributes: {
              attribute3: "value 3",
            },
            children: [],
          },
        ],
      },
    ],
  };

  assert.equal(doc, expected);
});

test.run();
