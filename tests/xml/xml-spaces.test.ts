import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import XmlNodeType from "../../types/XmlNodeType";
import sanitizeNode from "../sanitizeNode";

test("XML with spaces everywhere", () => {
  const xml = `
< xml >
  < element attribute = "value" attribute2 = value2 >
    Element one
  < / element >
< / xml >
`;

  const xmlDoc = grabXml(xml);
  const doc = sanitizeNode(xmlDoc);

  const expected = {
    type: XmlNodeType.ELEMENT,
    children: [
      {
        type: XmlNodeType.ELEMENT,
        tag: "xml",
        children: [
          {
            type: XmlNodeType.ELEMENT,
            tag: "element",
            attributes: {
              attribute: "value",
              attribute2: "value2",
            },
            children: [
              {
                type: XmlNodeType.TEXT,
                text: "Element one",
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
