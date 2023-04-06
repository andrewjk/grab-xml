import { test } from "uvu";
import xmlAttributesDouble from "./xml-attributes-double";
import xmlAttributesBare from "./xml-attributes-bare";
import xmlAttributesSingle from "./xml-attributes-single";
import xmlAttributesWithoutValue from "./xml-attributes-without-value";
import xmlCdata from "./xml-cdata";
import xmlComments from "./xml-comments";
import xmlDecode from "./xml-decode";
import xmlDoctype from "./xml-doctype";
import xmlElementsSelfClosing from "./xml-elements-self-closing";
import xmlElements from "./xml-elements";
import xmlEntities from "./xml-entities";
import xmlIgnoreComments from "./xml-ignore-comments";
import xmlIgnoreInstructions from "./xml-ignore-instructions";
import xmlInstruction from "./xml-instruction";
import xmlLiteralElements from "./xml-literal-elements";
import xmlMinimum from "./xml-minimum";
import xmlNamespaces from "./xml-namespaces";
import xmlSpaces from "./xml-spaces";
import xmlTrimWhitespace from "./xml-trim-whitespace";
import xmlVoidElements from "./xml-void-elements";

addTest(xmlAttributesBare);
addTest(xmlAttributesDouble);
addTest(xmlAttributesSingle);
addTest(xmlAttributesWithoutValue);
addTest(xmlCdata);
addTest(xmlComments);
addTest(xmlDecode);
addTest(xmlDoctype);
addTest(xmlElementsSelfClosing);
addTest(xmlElements);
addTest(xmlEntities);
addTest(xmlIgnoreComments);
addTest(xmlIgnoreInstructions);
addTest(xmlInstruction);
addTest(xmlLiteralElements);
addTest(xmlMinimum);
addTest(xmlNamespaces);
addTest(xmlSpaces);
addTest(xmlTrimWhitespace);
addTest(xmlVoidElements);

function addTest(x: any) {
  test(x.name, x.test);
}

test.run();
