import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import XmlNodeType from "../../types/XmlNodeType";
import sanitizeNode from "../sanitizeNode";

test("XML with bare attributes", () => {
  const xml = `<xml attribute=value attribute2=value2 />`;

  const xmlDoc = grabXml(xml);
  const doc = sanitizeNode(xmlDoc);

  const expected = {
    type: XmlNodeType.ELEMENT,
    children: [
      {
        type: XmlNodeType.ELEMENT,
        tag: "xml",
        attributes: {
          attribute: "value",
          attribute2: "value2",
        },
      },
    ],
  };

  assert.equal(doc, expected);
});

test.run();
