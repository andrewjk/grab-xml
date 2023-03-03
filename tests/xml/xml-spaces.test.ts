import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import { XmlNodeType } from "../../types/XmlNode";
import sanitizeNode from "../sanitizeNode";

test("XML with spaces everywhere", () => {
  const xml = `
< xml >
  < element attribute = "value" attribute2 = value2 >
    Element one
  < / element >
< / xml >
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
            type: XmlNodeType.ELEMENT,
            tagName: "element",
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
