import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import { XmlNodeType } from "../../types/XmlNode";
import sanitizeNode from "../sanitizeNode";

test("XML minimum possible", () => {
  const xml = `<xml />`;

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
        attributes: {},
        children: [],
      },
    ],
  };

  assert.equal(doc, expected);
});

test.run();
