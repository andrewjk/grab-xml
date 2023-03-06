export enum XmlNodeType {
  ELEMENT = 0,
  TEXT = 1,
  COMMENT = 2,
  INSTRUCTION = 3,
}

export interface XmlNode {
  type: XmlNodeType;
  parent: XmlNode;
}

export interface XmlElementNode extends XmlNode {
  tagName: string;
  attributes: Record<string, string>;
  children: XmlNode[];
}

export interface XmlTextNode extends XmlNode {
  text: string;
}

export interface XmlCommentNode extends XmlNode {
  text: string;
}

export interface XmlInstructionNode extends XmlNode {
  tagName: string;
  text: string;
}
