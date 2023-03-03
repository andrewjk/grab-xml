export enum XmlNodeType {
  ELEMENT = 0,
  TEXT = 1,
  COMMENT = 2,
}

export interface XmlNode {
  type: XmlNodeType;
  parent: XmlNode;
}

//export interface XmlRootNode extends XmlNode {
//  children: XmlNode[];
//}

export interface XmlElementNode extends XmlNode {
  tagName: string;
  attributes: Record<string, string>;
  children: XmlNode[];
}

export interface XmlTextNode extends XmlNode {
  text: string;
}

export interface XmlCommentNode extends XmlNode {
  comment: string;
}
