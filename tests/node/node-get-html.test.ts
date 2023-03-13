import { test } from "uvu";
import * as assert from "uvu/assert";
import grabXml from "../../src/grabXml";

test("Node getHtml", () => {
  const xml = `
<xml>
  <element>
    <p>I'm a paragraph.</p>
    <p>I'm another paragraph.</p>
  </element>
</xml>
`;

  const doc = grabXml(xml, { trimWhitespace: true });

  const expected = "<element><p>I'm a paragraph.</p><p>I'm another paragraph.</p></element>";

  assert.equal(doc.children[0].children[0].getHtml(), expected);
});

test.run();
