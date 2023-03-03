import {
  XmlNodeType,
  XmlNode,
  XmlElementNode,
  XmlTextNode,
} from "../types/XmlNode";

enum ParseLocation {
  NONE,
  NODE_OPENED,
  NODE_CLOSING,
  NODE_SELF_CLOSING,
  NODE_OPEN_NAME,
  NODE_CLOSE_NAME,
  INSIDE_NODE,
  ATTRIBUTE_NAME,
  AFTER_ATTRIBUTE_NAME,
  BEFORE_ATTRIBUTE_VALUE,
  ATTRIBUTE_VALUE,
  INSIDE_TEXT,
}

interface ParseState {
  location: ParseLocation;
  break: number;
  node: XmlNode;
  attribute: string;
  quote: string;
}

export default function grabXml(content: string) {
  const root: XmlElementNode = {
    type: XmlNodeType.ELEMENT,
    tagName: "#root",
    attributes: {},
    parent: null,
    children: [],
  };

  const state: ParseState = {
    location: ParseLocation.NONE,
    break: 0,
    node: root,
    attribute: "",
    quote: "",
  };

  for (let i = 0; i < content.length; i++) {
    processChar(content, i, state);
  }
  processChar(content, content.length + 1, state);

  return root;
}

function processChar(content: string, i: number, state: ParseState) {
  switch (content[i]) {
    case "<": {
      switch (state.location) {
        case ParseLocation.NONE: {
          updateState(state, ParseLocation.NODE_OPENED, i);
          break;
        }
        case ParseLocation.INSIDE_TEXT: {
          (state.node as XmlTextNode).text = content.substring(state.break, i);
          updateState(state, ParseLocation.NODE_OPENED, i, state.node.parent);
          break;
        }
      }
      break;
    }
    case "/": {
      switch (state.location) {
        case ParseLocation.NODE_OPENED: {
          updateState(state, ParseLocation.NODE_CLOSING, i);
          break;
        }
        case ParseLocation.INSIDE_NODE: {
          updateState(state, ParseLocation.NODE_SELF_CLOSING, i);
          break;
        }
        case ParseLocation.AFTER_ATTRIBUTE_NAME: {
          (state.node as XmlElementNode).attributes[state.attribute] = "";
          updateState(state, ParseLocation.NODE_SELF_CLOSING, i);
          break;
        }
      }
      break;
    }
    case ">": {
      switch (state.location) {
        case ParseLocation.NODE_SELF_CLOSING: {
          updateState(state, ParseLocation.NONE, i, state.node.parent);
          break;
        }
        case ParseLocation.NODE_OPEN_NAME: {
          (state.node as XmlElementNode).tagName = content.substring(
            state.break,
            i
          );
          updateState(state, ParseLocation.NONE, i);
          break;
        }
        case ParseLocation.NODE_CLOSE_NAME: {
          // TODO: Check that the tagname matches
          updateState(state, ParseLocation.NONE, i, state.node.parent);
          break;
        }
        case ParseLocation.INSIDE_NODE: {
          // TODO: Handle other types of automatically self-closing nodes, like <link> in HTML
          if ((state.node as XmlElementNode).tagName.startsWith("?")) {
            state.node = state.node.parent;
          }
          updateState(state, ParseLocation.NONE, i);
          break;
        }
        case ParseLocation.ATTRIBUTE_NAME: {
          (state.node as XmlElementNode).attributes[
            content.substring(state.break, i)
          ] = "";
          updateState(state, ParseLocation.NONE, i);
          break;
        }
      }
      break;
    }
    case "=": {
      switch (state.location) {
        case ParseLocation.ATTRIBUTE_NAME: {
          state.attribute = content.substring(state.break, i);
          updateState(state, ParseLocation.BEFORE_ATTRIBUTE_VALUE, i);
          break;
        }
        case ParseLocation.AFTER_ATTRIBUTE_NAME: {
          updateState(state, ParseLocation.BEFORE_ATTRIBUTE_VALUE, i);
          break;
        }
      }
      break;
    }
    case '"':
    case "'": {
      // TODO: Support unquoted attribute values too
      switch (state.location) {
        case ParseLocation.BEFORE_ATTRIBUTE_VALUE: {
          state.quote = content[i];
          updateState(state, ParseLocation.ATTRIBUTE_VALUE, i + 1);
          break;
        }
        case ParseLocation.ATTRIBUTE_VALUE: {
          if (state.quote === content[i]) {
            (state.node as XmlElementNode).attributes[state.attribute] =
              content.substring(state.break, i);
            updateState(state, ParseLocation.INSIDE_NODE, i);
          }
          break;
        }
      }
      break;
    }
    case " ":
    case "\t":
    case "\r":
    case "\n": {
      switch (state.location) {
        case ParseLocation.NONE: {
          const child: XmlTextNode = {
            type: XmlNodeType.TEXT,
            parent: state.node,
            text: "",
          };
          (state.node as XmlElementNode).children.push(child);
          updateState(state, ParseLocation.INSIDE_TEXT, i, child);
          break;
        }
        case ParseLocation.NODE_OPEN_NAME: {
          (state.node as XmlElementNode).tagName = content.substring(
            state.break,
            i
          );
          updateState(state, ParseLocation.INSIDE_NODE, i);
          break;
        }
        case ParseLocation.ATTRIBUTE_NAME: {
          state.attribute = content.substring(state.break, i);
          updateState(state, ParseLocation.AFTER_ATTRIBUTE_NAME, i);
          break;
        }
        case ParseLocation.ATTRIBUTE_VALUE: {
          if (!state.quote) {
            (state.node as XmlElementNode).attributes[state.attribute] =
              content.substring(state.break, i);
            updateState(state, ParseLocation.INSIDE_NODE, i);
          }
          break;
        }
      }
      break;
    }
    case undefined: {
      switch (state.location) {
        case ParseLocation.INSIDE_TEXT: {
          (state.node as XmlTextNode).text = content.substring(state.break, i);
          updateState(state, ParseLocation.NODE_OPENED, i, state.node.parent);
          break;
        }
      }
      break;
    }
    case "?": {
      // Ignore this -- it's probably at the end of the xml definition node and shouldn't cause a
      // change in the parse state
      break;
    }
    default: {
      switch (state.location) {
        case ParseLocation.NONE: {
          const child: XmlTextNode = {
            type: XmlNodeType.TEXT,
            parent: state.node,
            text: "",
          };
          (state.node as XmlElementNode).children.push(child);
          updateState(state, ParseLocation.INSIDE_TEXT, i, child);
          break;
        }
        case ParseLocation.NODE_OPENED: {
          const child: XmlElementNode = {
            type: XmlNodeType.ELEMENT,
            parent: state.node,
            tagName: "",
            attributes: {},
            children: [],
          };
          (state.node as XmlElementNode).children.push(child);
          updateState(state, ParseLocation.NODE_OPEN_NAME, i, child);
          break;
        }
        case ParseLocation.NODE_CLOSING: {
          updateState(state, ParseLocation.NODE_CLOSE_NAME, i);
          break;
        }
        case ParseLocation.INSIDE_NODE: {
          updateState(state, ParseLocation.ATTRIBUTE_NAME, i);
          break;
        }
        case ParseLocation.AFTER_ATTRIBUTE_NAME: {
          (state.node as XmlElementNode).attributes[state.attribute] = "";
          updateState(state, ParseLocation.ATTRIBUTE_NAME, i);
          break;
        }
        case ParseLocation.BEFORE_ATTRIBUTE_VALUE: {
          state.quote = "";
          updateState(state, ParseLocation.ATTRIBUTE_VALUE, i);
          break;
        }
      }
    }
  }
}

function updateState(
  state: ParseState,
  location: ParseLocation,
  breakPos: number,
  node?: XmlNode
) {
  state.location = location;
  state.break = breakPos;
  if (node) {
    state.node = node;
  }
}
