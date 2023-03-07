import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";
import XmlNodeType from "../../types/XmlNodeType";
import sanitizeNode from "../sanitizeNode";

test("XML namespaces", () => {
  const xml = `
<x:xml xmlns:x="https://www.w3.org/TR/html4/">
  <x:element>
    Element one
  </x:element>
</x:xml>
`;

  const doc = grabXml(xml);
  sanitizeNode(doc);

  const expected = {
    type: XmlNodeType.ELEMENT,
    tag: "#root",
    children: [
      {
        type: XmlNodeType.ELEMENT,
        tag: "x:xml",
        attributes: {
          "xmlns:x": "https://www.w3.org/TR/html4/",
        },
        children: [
          {
            type: XmlNodeType.ELEMENT,
            tag: "x:element",
            children: [
              {
                type: XmlNodeType.TEXT,
                text: "Element one",
              },
            ],
          },
        ],
      },
    ],
  };

  assert.equal(doc, expected);
});

test.run();
