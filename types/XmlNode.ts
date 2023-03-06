export enum XmlNodeType {
  ELEMENT,
  TEXT,
  COMMENT,
  INSTRUCTION,
}

export interface XmlNode {
  type: XmlNodeType;
  parent: XmlNode;
  tag: string;
  attributes: Record<string, string>;
  children: XmlNode[];
  text: string;
}
