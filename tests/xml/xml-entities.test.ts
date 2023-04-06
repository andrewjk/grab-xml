import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import XmlNodeType from "../../types/XmlNodeType";
import sanitizeNode from "../sanitizeNode";

test("XML with predifined and character entities", () => {
  const xml = `
<xml>
  <element attr="Predefined entities &lt;&apos;&quot;&gt; &amp; &#8220;character entities&#x201D;">
    Predefined entities &lt;&apos;&quot;&gt; &amp; &#8220;character entities&#x201D;
  </element>
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
        children: [
          {
            type: XmlNodeType.ELEMENT,
            tag: "element",
            attributes: {
              attr: `Predefined entities <'"> & “character entities”`,
            },
            children: [
              {
                type: XmlNodeType.TEXT,
                text: `Predefined entities <'"> & “character entities”`,
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
