import XmlNode from "../types/XmlNode";
import grabXml from "./grabXml";

/**
 * Parses HTML into a root node with all of the HTML's nodes as children.
 * @param content The HTML content to parse.
 * @returns A root node with all of the HTML's nodes as children.
 */
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
