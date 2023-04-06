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

test(xmlAttributesBare.name, xmlAttributesBare.test);
test(xmlAttributesDouble.name, xmlAttributesDouble.test);
test(xmlAttributesSingle.name, xmlAttributesSingle.test);
test(xmlAttributesWithoutValue.name, xmlAttributesWithoutValue.test);
test(xmlCdata.name, xmlCdata.test);
test(xmlComments.name, xmlComments.test);
test(xmlDecode.name, xmlDecode.test);
test(xmlDoctype.name, xmlDoctype.test);
test(xmlElementsSelfClosing.name, xmlElementsSelfClosing.test);
test(xmlElements.name, xmlElements.test);
test(xmlEntities.name, xmlEntities.test);
test(xmlIgnoreComments.name, xmlIgnoreComments.test);
test(xmlIgnoreInstructions.name, xmlIgnoreInstructions.test);
test(xmlInstruction.name, xmlInstruction.test);
test(xmlLiteralElements.name, xmlLiteralElements.test);
test(xmlMinimum.name, xmlMinimum.test);
test(xmlNamespaces.name, xmlNamespaces.test);
test(xmlSpaces.name, xmlSpaces.test);
test(xmlTrimWhitespace.name, xmlTrimWhitespace.test);
test(xmlVoidElements.name, xmlVoidElements.test);

test.run();
