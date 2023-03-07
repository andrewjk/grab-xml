import XmlNode from "../types/XmlNode";
import XmlNodeType from "../types/XmlNodeType";

export default function sanitizeNode(node: XmlNode, trim = true) {
  // Delete parents (to remove circular references)
  delete node.parent;

  // Remove empty tags
  if (!node.tag) {
    delete node.tag;
  }

  if (trim) {
    // Trim whitespace from text nodes and remove empty text nodes
    node.text = node.text.trim();
    if (!node.text) {
      delete node.text;
    }
  }

  // Remove empty attributes
  if (!Object.keys(node.attributes).length) {
    delete node.attributes;
  }

  if (trim) {
    // Remove empty text nodes
    node.children = node.children.filter((c) => c.type !== XmlNodeType.TEXT || !!c.text.trim());
  }

  // Remove empty children
  if (!node.children.length) {
    delete node.children;
  }

  if (node.children) {
    // Sanitize the children
    for (let child of node.children) {
      sanitizeNode(child, trim);
    }
  }
}

/*
function sanitizeNodes(nodes: XmlNode[]) {
  nodes.forEach((n) => {
    delete n.parent;
    if (n.type === XmlNodeType.ELEMENT) {
      const en = n as XmlElementNode;
      sanitizeNodes(en.children);
    }
  });
}
*/
