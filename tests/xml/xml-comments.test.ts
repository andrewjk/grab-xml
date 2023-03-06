import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import XmlNodeType from "../../types/XmlNodeType";
import sanitizeNode from "../sanitizeNode";

test("XML with comment", () => {
  const xml = `
<xml>
  <!-- I'm a comment -->
  <!--I'm a comment without spaces-->
  <!--Really_no_spaces-->
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
            type: XmlNodeType.COMMENT,
            text: "I'm a comment",
          },
          {
            type: XmlNodeType.COMMENT,
            text: "I'm a comment without spaces",
          },
          {
            type: XmlNodeType.COMMENT,
            text: "Really_no_spaces",
          },
        ],
      },
    ],
  };

  assert.equal(doc, expected);

  // Also try it without spaces between elements
  const doc2 = grabXml(xml.replace(/\>\s+\</g, "><"));
  sanitizeNode(doc2);
  assert.equal(doc2, expected);
});

test.run();
