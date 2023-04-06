import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import XmlNodeType from "../../types/XmlNodeType";
import sanitizeNode from "../sanitizeNode";

export default {
  name: "XML with self-closing elements",
  test: () => {
    const xml = `
<xml>
  <element />
  <element />
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
            },
            {
              type: XmlNodeType.ELEMENT,
              tag: "element",
            },
          ],
        },
      ],
    };

    assert.equal(doc, expected);
  },
};
