import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";

test("Node content", () => {
  const xml = `
<xml>
  <element>
    <p>I'm a paragraph.</p>
    <p>I'm another paragraph.</p>
  </element>
</xml>
`;

  const doc = grabXml(xml, { trimWhitespace: true });

  const expected = "I'm a paragraph.I'm another paragraph.";

  assert.equal(doc.children[0].children[0].content().trim(), expected);
});

test.run();
