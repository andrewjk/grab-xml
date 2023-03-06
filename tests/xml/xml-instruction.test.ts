import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import { XmlElementNode, XmlNodeType } from "../../types/XmlNode";
import sanitizeNode from "../sanitizeNode";

//const xml = `
//<?xml version="1.0" encoding="utf-8"?>
//<bookstore>
//  <book>
//    <title lang="en">The Lord of the Rings</title>
//    <price>29.99</price>
//    <book>
//        <title lang="en">The Fellowship of the Ring</title>
//    </book>
//    <book>
//        <title lang="en">The Two Towers</title>
//    </book>
//    <book>
//        <title lang="en">The Return of the King</title>
//    </book>
//  </book>
//  <book>
//    <title lang="es">El Aleph</title>
//    <price>19.99</price>
//  </book>
//  <book>
//    <title lang="en">Software Development for Dummies</title>
//    <price>39.99</price>
//  </book>
//</bookstore>
//`;

test("XML with prolog instruction", () => {
  const xml = `
  <?xml version="1.0" encoding="utf-8"?>
  <?php do some php stuff?>
`;

  const doc = grabXml(xml);
  sanitizeNode(doc);

  const expected = {
    type: XmlNodeType.ELEMENT,
    tagName: "#root",
    attributes: {},
    children: [
      {
        type: XmlNodeType.INSTRUCTION,
        tagName: "?xml",
        text: 'version="1.0" encoding="utf-8"',
        children: [],
        attributes: {},
      },
      {
        type: XmlNodeType.INSTRUCTION,
        tagName: "?php",
        text: "do some php stuff",
        children: [],
        attributes: {},
      },
    ],
  };

  assert.equal(doc, expected);
});

test.run();
