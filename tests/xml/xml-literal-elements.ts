import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import XmlNodeType from "../../types/XmlNodeType";
import sanitizeNode from "../sanitizeNode";

export default {
  name: "XML with literal elements",
  test: () => {
    const xml = `
<xml>
  <script>
    return '<div>';
  </script>
</xml>
`;

    const options = { literalElements: ["script"] };
    const xmlDoc = grabXml(xml, options);
    const doc = sanitizeNode(xmlDoc);

    const expected = {
      type: XmlNodeType.ELEMENT,
      children: [
        {
          type: XmlNodeType.ELEMENT,
          tag: "xml",
          children: [
            {
              type: XmlNodeType.LITERAL,
              tag: "script",
              text: "return '<div>';",
            },
          ],
        },
      ],
    };

    assert.equal(doc, expected);

    // Also try it without spaces between elements
    const xml2 = xml.replace(/\>\s+\</g, "><");
    const xmlDoc2 = grabXml(xml2, options);
    const doc2 = sanitizeNode(xmlDoc2);
    assert.equal(doc2, expected);
  },
};
