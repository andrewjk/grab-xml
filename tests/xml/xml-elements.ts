import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import XmlNodeType from "../../types/XmlNodeType";
import sanitizeNode from "../sanitizeNode";

export default {
  name: "XML with elements",
  test: () => {
    const xml = `
<xml>
  <element>
    Element one
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
  },
};
