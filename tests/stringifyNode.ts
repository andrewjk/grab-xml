import { XmlNode } from "../types/XmlNode";

export default function stringifyNode(node: XmlNode) {
  return JSON.stringify(node, replacer, 2);
}

function replacer(key: string, value: any) {
  if (key == "parent") return undefined;
  else if (value instanceof Map) return Object.fromEntries(value.entries());
  else return value;
}
