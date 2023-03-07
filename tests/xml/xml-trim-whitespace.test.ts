import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import XmlNode from "../../types/XmlNode";
import XmlNodeType from "../../types/XmlNodeType";

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

// We can't use the regular sanitizeNode method because it removes whitespace
function sanitizeNode(node: XmlNode) {
  // Delete parents (to remove circular references)
  delete node.parent;

  // Remove empty tags
  if (!node.tag) {
    delete node.tag;
  }

  // Remove empty attributes
  if (!Object.keys(node.attributes).length) {
    delete node.attributes;
  }

  // Remove empty children
  if (!node.children.length) {
    delete node.children;
  }

  if (node.children) {
    // Sanitize the children
    for (let child of node.children) {
      sanitizeNode(child);
    }
  }
}
