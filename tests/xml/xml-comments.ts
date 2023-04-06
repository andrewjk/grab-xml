import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import XmlNodeType from "../../types/XmlNodeType";
import sanitizeNode from "../sanitizeNode";

export default {
  name: "XML with comment",
  test: () => {
    const xml = `
<xml>
  <!-- I'm a comment -->
  <!--I'm a comment without spaces-->
  <!--Really_no_spaces-->
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
    const xml2 = xml.replace(/\>\s+\</g, "><");
    const xmlDoc2 = grabXml(xml2);
    const doc2 = sanitizeNode(xmlDoc2);
    assert.equal(doc2, expected);
  },
};
