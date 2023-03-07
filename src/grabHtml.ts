import XmlNode from "../types/XmlNode";
import grabXml from "./grabXml";

export default function grabHtml(content: string): XmlNode {
  // From https://developer.mozilla.org/en-US/docs/Glossary/Void_element
  const voidElements = [
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "source",
    "track",
    "wbr",
  ];
  const literalElements = ["script", "style"];
  const options = {
    voidElements,
    literalElements,
  };
  return grabXml(content, options);
}
