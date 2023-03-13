import XmlNodeType from "../types/XmlNodeType";

export default class XmlNode {
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

  constructor(type: XmlNodeType, parent: XmlNode) {
    this.type = type;
    this.parent = parent;
    this.tag = "";
    this.attributes = {};
    this.children = [];
    this.text = "";
  }

  getText(): string {
    if (this.type === XmlNodeType.ELEMENT) {
      return this.children.map((c) => c.getText()).join("");
    } else if (this.type === XmlNodeType.TEXT) {
      return this.text;
    }
  }

  getHtml(): string {
    if (this.type === XmlNodeType.ELEMENT) {
      return `<${this.tag}>${this.children.map((c) => c.getHtml()).join("")}</${this.tag}>`;
    } else if (this.type === XmlNodeType.TEXT) {
      return this.text;
    }
  }

  getJson(): string {
    function replacer(key: string, value: any) {
      if (key == "parent") return undefined;
      else return value;
    }
    return JSON.stringify(this, replacer, 2);
  }
}
