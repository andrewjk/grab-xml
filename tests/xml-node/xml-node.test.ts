import { test } from "uvu";
import xmlNodeInnerXml from "./xml-node-inner-xml";
import xmlNodeJson from "./xml-node-json";
import xmlNodeOuterXml from "./xml-node-outer-xml";
import xmlNodeText from "./xml-node-text";

test(xmlNodeInnerXml.name, xmlNodeInnerXml.test);
test(xmlNodeJson.name, xmlNodeJson.test);
test(xmlNodeOuterXml.name, xmlNodeOuterXml.test);
test(xmlNodeText.name, xmlNodeText.test);

test.run();
