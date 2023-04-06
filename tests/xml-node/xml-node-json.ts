import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";

export default {
  name: "XmlNode json",
  test: () => {
    const xml = `
<xml>
  <element>
    <p>I'm a paragraph.</p>
    <p>I'm another paragraph.</p>
  </element>
</xml>
`;

    const doc = grabXml(xml, { trimWhitespace: true });

    const expected = `{
  "type": 0,
  "tag": "element",
  "attributes": {},
  "children": [
    {
      "type": 0,
      "tag": "p",
      "attributes": {},
      "children": [
        {
          "type": 1,
          "tag": "",
          "attributes": {},
          "children": [],
          "text": "I'm a paragraph."
        }
      ],
      "text": ""
    },
    {
      "type": 0,
      "tag": "p",
      "attributes": {},
      "children": [
        {
          "type": 1,
          "tag": "",
          "attributes": {},
          "children": [],
          "text": "I'm another paragraph."
        }
      ],
      "text": ""
    }
  ],
  "text": ""
}`;

    assert.equal(doc.children[0].children[0].json(), expected);
  },
};
