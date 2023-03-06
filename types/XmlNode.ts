import XmlNodeType from "./XmlNodeType";

/** A node that is returned while parsing XML */
export default interface XmlNode {
  /** The type of node */
  type: XmlNodeType;
  /** The parent node */
  parent: XmlNode;
  /** The tag name of the node, if applicable for the node type */
  tag: string;
  /** Any attributes that were set on the node, if applicable for the node type */
  attributes: Record<string, string>;
  /** The child nodes, if applicable for the node type */
  children: XmlNode[];
  /** The text content, if applicable for the node type */
  text: string;
}
