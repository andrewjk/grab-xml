import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import XmlNodeType from "../../types/XmlNodeType";
import sanitizeNode from "../sanitizeNode";

export default {
  name: "XML trimming whitespace",
  test: () => {
    const xml = `
<xml>
  <element>
    Element one
  </element>
</xml>
`;

    const options = { trimWhitespace: true };
    const xmlDoc = grabXml(xml, options);
    const doc = sanitizeNode(xmlDoc, false);

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
              text: "",
            },
          ],
          text: "",
        },
      ],
      text: "",
    };

    assert.equal(doc, expected);
  },
};
