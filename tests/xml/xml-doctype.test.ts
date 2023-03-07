import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import XmlNodeType from "../../types/XmlNodeType";
import sanitizeNode from "../sanitizeNode";

test("XML with doctypes", () => {
  const xml = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<!DOCTYPE sgml [
  <!ELEMENT sgml ANY>
  <!ENTITY % std "standard SGML">
]>
`;

  const doc = grabXml(xml);
  sanitizeNode(doc);

  const expected = {
    type: XmlNodeType.ELEMENT,
    tag: "#root",
    children: [
      {
        type: XmlNodeType.INSTRUCTION,
        tag: "!DOCTYPE",
        text: 'html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"',
      },
      {
        type: XmlNodeType.INSTRUCTION,
        tag: "!DOCTYPE",
        text: `sgml [
  <!ELEMENT sgml ANY>
  <!ENTITY % std "standard SGML">
]`,
      },
    ],
  };

  assert.equal(doc, expected);

  // Also try it without spaces between elements
  const xml2 = xml.replace(/\>\s+\</g, "><");
  const doc2 = grabXml(xml2);
  sanitizeNode(doc2);
  expected.children[1].text = expected.children[1].text.replace(/\>\s+\</g, "><");
  assert.equal(doc2, expected);
});

test.run();
