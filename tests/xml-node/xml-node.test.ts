import { test } from "uvu";
import xmlNodeInnerXml from "./xml-node-inner-xml";
import xmlNodeJson from "./xml-node-json";
import xmlNodeOuterXml from "./xml-node-outer-xml";
import xmlNodeText from "./xml-node-text";

addTest(xmlNodeInnerXml);
addTest(xmlNodeJson);
addTest(xmlNodeOuterXml);
addTest(xmlNodeText);

function addTest(x: any) {
  test(x.name, x.test);
}

test.run();
