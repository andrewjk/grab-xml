import XmlNode from "../types/XmlNode";
import XmlNodeType from "../types/XmlNodeType";

export default function sanitizeNode(node: XmlNode, trim = true) {
  const result: Record<string, any> = {};

  result.type = node.type;
  if (node.tag) {
    result.tag = node.tag;
  }
  if (Object.keys(node.attributes).length) {
    result.attributes = node.attributes;
  }
  if (node.text || !trim) {
    if (trim && !!node.text.trim()) {
      result.text = node.text.trim();
    } else {
      result.text = node.text;
    }
  }

  const children = [];
  for (let child of node.children.filter(
    (c) => !trim || c.type !== XmlNodeType.TEXT || !!c.text.trim()
  )) {
    children.push(sanitizeNode(child, trim));
  }
  if (children.length) {
    result.children = children;
  }

  return result;
}
