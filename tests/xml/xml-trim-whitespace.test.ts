import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import XmlNodeType from "../../types/XmlNodeType";
import sanitizeNode from "../sanitizeNode";

test("XML trimming whitespace", () => {
  const xml = `
<xml>
  <element>
    Element one
  </element>
</xml>
`;

  const options = { trimWhitespace: true };
  const doc = grabXml(xml, options);
  sanitizeNode(doc, false);

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
            children: [
              {
                type: XmlNodeType.TEXT,
                text: "Element one",
              },
            ],
            text: "",
          },
        ],
        text: "",
      },
    ],
    text: "",
  };

  assert.equal(doc, expected);
});

test.run();
