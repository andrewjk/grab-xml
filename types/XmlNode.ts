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
  /** Whether this node is self-closing */
  selfClosing: boolean | undefined;

  constructor(type: XmlNodeType, parent: XmlNode) {
    this.type = type;
    this.parent = parent;
    this.tag = "";
    this.attributes = {};
    this.children = [];
    this.text = "";
  }

  /** Returns a string containing the text content of the node and its children */
  content(): string {
    if (this.type === XmlNodeType.ELEMENT) {
      return this.children.map((c) => c.content()).join("");
    } else if (this.type === XmlNodeType.TEXT) {
      return this.text;
    }
  }

  /** Returns a string containing the XML of the node and its children, including the node itself */
  outerXml(): string {
    if (this.type === XmlNodeType.ELEMENT) {
      let result = `<${this.tag}`;
      for (let [name, value] of Object.entries(this.attributes)) {
        result += ` ${name}`;
        if (value) {
          result += `="${value.replace('"', '\\"')}"`;
        }
      }
      if (this.selfClosing) {
        result += ` />`;
      } else {
        result += `>${this.innerXml()}</${this.tag}>`;
      }
      return result;
    } else if (this.type === XmlNodeType.TEXT) {
      return this.text;
    }
  }

  /** Returns a string containing the XML of the node's children */
  innerXml(): string {
    if (this.type === XmlNodeType.ELEMENT) {
      if (this.selfClosing) {
        return "";
      } else {
        return this.children.map((c) => c.outerXml()).join("");
      }
    } else if (this.type === XmlNodeType.TEXT) {
      return this.text;
    }
  }

  /** Returns a string containing a JSON representation of the node and its children, excluding the circular parent references */
  json(): string {
    function replacer(key: string, value: any) {
      if (key == "parent") return undefined;
      else return value;
    }
    return JSON.stringify(this, replacer, 2);
  }
}
