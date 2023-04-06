import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import XmlNodeType from "../../types/XmlNodeType";
import sanitizeNode from "../sanitizeNode";

export default {
  name: "XML decoding entities",
  test: () => {
    const xml = `
<xml>
  <element>
    I should have &lt;em&gt;emphasis&lt;/em&gt;.
  </element>
  <!-- I should not have &lt;em&gt;emphasis&lt;/em&gt;. -->
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
              children: [
                {
                  type: XmlNodeType.TEXT,
                  text: "I should have <em>emphasis</em>.",
                },
              ],
            },
            {
              type: XmlNodeType.COMMENT,
              text: "I should not have &lt;em&gt;emphasis&lt;/em&gt;.",
            },
          ],
        },
      ],
    };

    assert.equal(doc, expected);
  },
};
