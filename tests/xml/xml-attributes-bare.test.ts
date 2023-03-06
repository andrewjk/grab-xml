import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import XmlNodeType from "../../types/XmlNodeType";
import sanitizeNode from "../sanitizeNode";

test("XML with bare attributes", () => {
  const xml = `<xml attribute=value attribute2=value2 />`;

  const doc = grabXml(xml);
  sanitizeNode(doc);

  const expected = {
    type: XmlNodeType.ELEMENT,
    tag: "#root",
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
