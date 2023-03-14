import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";

test("Node getOuterXml", () => {
  const xml = `
<xml>
  <element>
    <p>I'm a paragraph.</p>
    <p>I'm another paragraph.</p>
    <img src="self-closing.jpg" />
  </element>
</xml>
`;

  const doc = grabXml(xml, { trimWhitespace: true });

  const expected =
    "<element><p>I'm a paragraph.</p><p>I'm another paragraph.</p><img src=\"self-closing.jpg\" /></element>";

  assert.equal(doc.children[0].children[0].getOuterXml(), expected);
});

test("Node getInnerXml", () => {
  const xml = `
<xml>
  <element>
    <p>I'm a paragraph.</p>
    <p>I'm another paragraph.</p>
    <img src="self-closing.jpg" />
  </element>
</xml>
`;

  const doc = grabXml(xml, { trimWhitespace: true });

  const expected =
    "<p>I'm a paragraph.</p><p>I'm another paragraph.</p><img src=\"self-closing.jpg\" />";

  assert.equal(doc.children[0].children[0].getInnerXml(), expected);
});

test.run();
