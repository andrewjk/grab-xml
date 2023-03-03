import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import { XmlNodeType } from "../../types/XmlNode";
import sanitizeNode from "../sanitizeNode";

test("XML with single-quoted attributes", () => {
  const xml = `<xml attribute='value' attribute2='value 2' />`;

  const doc = grabXml(xml);
  sanitizeNode(doc);

  const expected = {
    type: XmlNodeType.ELEMENT,
    tagName: "#root",
    attributes: {},
    children: [
      {
        type: XmlNodeType.ELEMENT,
        tagName: "xml",
        attributes: {
          attribute: "value",
          attribute2: "value 2",
        },
        children: [],
      },
    ],
  };

  assert.equal(doc, expected);
});

test.run();
