import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import XmlNodeType from "../../types/XmlNodeType";
import sanitizeNode from "../sanitizeNode";

test("XML with single-quoted attributes", () => {
  const xml = `
<xml attribute='value'>
  <element attribute2='value 2' />
  <element attribute3='value 3'/>
</xml>
`;

  const xmlDoc = grabXml(xml);
  const doc = sanitizeNode(xmlDoc);

  const expected = {
    type: XmlNodeType.ELEMENT,
    children: [
      {
        type: XmlNodeType.ELEMENT,
        tag: "xml",
        attributes: {
          attribute: "value",
        },
        children: [
          {
            type: XmlNodeType.ELEMENT,
            tag: "element",
            attributes: {
              attribute2: "value 2",
            },
          },
          {
            type: XmlNodeType.ELEMENT,
            tag: "element",
            attributes: {
              attribute3: "value 3",
            },
          },
        ],
      },
    ],
  };

  assert.equal(doc, expected);
});

test.run();
