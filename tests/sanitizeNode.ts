import {
  XmlElementNode,
  XmlNode,
  XmlNodeType,
  XmlTextNode,
} from "../types/XmlNode";

export default function sanitizeNode(node: XmlNode) {
  // Delete parents (to remove circular references)
  delete node.parent;

  if (node.type === XmlNodeType.ELEMENT) {
    const el = node as XmlElementNode;

    // Convert attributes to objects so they get properly inspected
    // TODO: Just use an object
    //el.attributes = Object.fromEntries(el.attributes);

    // Trim whitespace from text nodes
    el.children.forEach((c) => {
      if (c.type === XmlNodeType.TEXT) {
        const tx = c as XmlTextNode;
        tx.text = tx.text.trim();
      }
    });

    // Remove empty text nodes
    el.children = el.children.filter(
      (c) => c.type !== XmlNodeType.TEXT || !!(c as XmlTextNode).text
    );

    // Sanitize the child
    for (let child of el.children) {
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
