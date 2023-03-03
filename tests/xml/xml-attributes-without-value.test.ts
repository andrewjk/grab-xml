import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import { XmlNodeType } from "../../types/XmlNode";
import sanitizeNode from "../sanitizeNode";

test("XML with attributes without a value", () => {
  const xml = `
<xml attribute>
  <element attribute2 />
  <element attribute3 attribute4="value" />
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
        attributes: { attribute: "" },
        children: [
          {
            type: XmlNodeType.ELEMENT,
            tagName: "element",
            attributes: { attribute2: "" },
            children: [],
          },
          {
            type: XmlNodeType.ELEMENT,
            tagName: "element",
            attributes: {
              attribute3: "",
              attribute4: "value",
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
