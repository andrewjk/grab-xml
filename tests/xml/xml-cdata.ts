import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import XmlNodeType from "../../types/XmlNodeType";
import sanitizeNode from "../sanitizeNode";

export default {
  name: "XML with character data (CDATA)",
  test: () => {
    const xml = `
<xml>
  <![CDATA[I'm <em>character</em> data]]>
  <![CDATA[I_have_no_spaces]]>
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
              type: XmlNodeType.TEXT,
              text: "I'm <em>character</em> data",
            },
            {
              type: XmlNodeType.TEXT,
              text: "I_have_no_spaces",
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
