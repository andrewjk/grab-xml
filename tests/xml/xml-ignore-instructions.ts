import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import XmlNodeType from "../../types/XmlNodeType";
import sanitizeNode from "../sanitizeNode";

export default {
  name: "XML ignoring instruction",
  test: () => {
    const xml = `
<?xml version="1.0" encoding="utf-8"?>
<xml>
  <?php do some php stuff?>
</xml>
`;

    const options = { ignoreInstructions: true };
    const xmlDoc = grabXml(xml, options);
    const doc = sanitizeNode(xmlDoc);

    const expected = {
      type: XmlNodeType.ELEMENT,
      children: [
        {
          type: XmlNodeType.ELEMENT,
          tag: "xml",
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
