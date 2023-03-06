import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import XmlNodeType from "../../types/XmlNodeType";
import sanitizeNode from "../sanitizeNode";

test("XML with attributes without a value", () => {
  const xml = `
<xml attribute>
  <element attribute2 />
  <element attribute3 attribute4="value" />
  <element attribute5/>
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
        attributes: { attribute: "" },
        children: [
          {
            type: XmlNodeType.ELEMENT,
            tag: "element",
            attributes: { attribute2: "" },
          },
          {
            type: XmlNodeType.ELEMENT,
            tag: "element",
            attributes: {
              attribute3: "",
              attribute4: "value",
            },
          },
          {
            type: XmlNodeType.ELEMENT,
            tag: "element",
            attributes: {
              attribute5: "",
            },
          },
        ],
      },
    ],
  };

  assert.equal(doc, expected);
});

test.run();
