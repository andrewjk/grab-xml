import { XmlNode, XmlNodeType } from "../types/XmlNode";

export default function sanitizeNode(node: XmlNode) {
  // Delete parents (to remove circular references)
  delete node.parent;

  // Remove empty tags
  if (!node.tag) {
    delete node.tag;
  }

  // Trim whitespace from text nodes and remove empty text nodes
  node.text = node.text.trim();
  if (!node.text) {
    delete node.text;
  }

  // Remove empty attributes
  if (!Object.keys(node.attributes).length) {
    delete node.attributes;
  }

  // Remove empty children
  if (!node.children.length) {
    delete node.children;
  }

  if (node.children) {
    // Remove empty text nodes
    node.children = node.children.filter((c) => c.type !== XmlNodeType.TEXT || !!c.text.trim());

    // Sanitize the children
    for (let child of node.children) {
      sanitizeNode(child);
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
