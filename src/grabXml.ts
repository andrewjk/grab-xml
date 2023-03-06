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
  start: number;
  node: XmlNode;
  attribute: string;
  quote: string;
}

const openBracketCode = "<".charCodeAt(0);
const closeBracketCode = ">".charCodeAt(0);
const slashCode = "/".charCodeAt(0);
const equalsCode = "=".charCodeAt(0);
const singleQuoteCode = "'".charCodeAt(0);
const doubleQuoteCode = '"'.charCodeAt(0);
const spaceCode = " ".charCodeAt(0);
const tabCode = "\t".charCodeAt(0);
const carriageReturnCode = "\r".charCodeAt(0);
const newLineCode = "\n".charCodeAt(0);
const questionCode = "?".charCodeAt(0);

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
    start: 0,
    node: root,
    attribute: "",
    quote: "",
  };

  for (let i = 0; i < content.length; i++) {
    switch (state.location) {
      case ParseLocation.NONE: {
        switch (content.charCodeAt(i)) {
          case openBracketCode: {
            updateState(state, ParseLocation.NODE_OPENED, i);
            break;
          }
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            const child: XmlTextNode = {
              type: XmlNodeType.TEXT,
              parent: state.node,
              text: "",
            };
            (state.node as XmlElementNode).children.push(child);
            updateState(state, ParseLocation.INSIDE_TEXT, i, child);
            break;
          }
          default: {
            const child: XmlTextNode = {
              type: XmlNodeType.TEXT,
              parent: state.node,
              text: "",
            };
            (state.node as XmlElementNode).children.push(child);
            updateState(state, ParseLocation.INSIDE_TEXT, i, child);
            break;
          }
        }
        break;
      }
      case ParseLocation.NODE_OPENED: {
        switch (content.charCodeAt(i)) {
          case slashCode: {
            updateState(state, ParseLocation.NODE_CLOSING, i);
            break;
          }
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            break;
          }
          default: {
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
        }
        break;
      }
      case ParseLocation.NODE_CLOSING: {
        updateState(state, ParseLocation.NODE_CLOSE_NAME, i);
        break;
      }
      case ParseLocation.NODE_SELF_CLOSING: {
        switch (content.charCodeAt(i)) {
          case closeBracketCode: {
            updateState(state, ParseLocation.NONE, i, state.node.parent);
            break;
          }
        }
        break;
      }
      case ParseLocation.NODE_OPEN_NAME: {
        switch (content.charCodeAt(i)) {
          case closeBracketCode: {
            (state.node as XmlElementNode).tagName = content.substring(
              state.start,
              i
            );
            updateState(state, ParseLocation.NONE, i);
            break;
          }
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            (state.node as XmlElementNode).tagName = content.substring(
              state.start,
              i
            );
            updateState(state, ParseLocation.INSIDE_NODE, i);
            break;
          }
        }
        break;
      }
      case ParseLocation.NODE_CLOSE_NAME: {
        switch (content.charCodeAt(i)) {
          case closeBracketCode: {
            // TODO: Check that the tagname matches
            updateState(state, ParseLocation.NONE, i, state.node.parent);
            break;
          }
        }
        break;
      }
      case ParseLocation.INSIDE_NODE: {
        switch (content.charCodeAt(i)) {
          case slashCode: {
            updateState(state, ParseLocation.NODE_SELF_CLOSING, i);
            break;
          }
          case closeBracketCode: {
            // TODO: Handle other types of automatically self-closing nodes, like <link> in HTML
            if ((state.node as XmlElementNode).tagName.startsWith("?")) {
              state.node = state.node.parent;
            }
            updateState(state, ParseLocation.NONE, i);
            break;
          }
          case questionCode: {
            // Ignore this -- it's probably at the end of the xml definition node and shouldn't cause a
            // change in the parse state
            break;
          }
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            break;
          }
          default: {
            updateState(state, ParseLocation.ATTRIBUTE_NAME, i);
            break;
          }
        }
        break;
      }
      case ParseLocation.ATTRIBUTE_NAME: {
        switch (content.charCodeAt(i)) {
          case equalsCode: {
            state.attribute = content.substring(state.start, i);
            updateState(state, ParseLocation.BEFORE_ATTRIBUTE_VALUE, i);
            break;
          }
          case closeBracketCode: {
            (state.node as XmlElementNode).attributes[
              content.substring(state.start, i)
            ] = "";
            updateState(state, ParseLocation.NONE, i);
            break;
          }
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            state.attribute = content.substring(state.start, i);
            updateState(state, ParseLocation.AFTER_ATTRIBUTE_NAME, i);
            break;
          }
        }
        break;
      }
      case ParseLocation.AFTER_ATTRIBUTE_NAME: {
        switch (content.charCodeAt(i)) {
          case equalsCode: {
            updateState(state, ParseLocation.BEFORE_ATTRIBUTE_VALUE, i);
            break;
          }
          case slashCode: {
            (state.node as XmlElementNode).attributes[state.attribute] = "";
            updateState(state, ParseLocation.NODE_SELF_CLOSING, i);
            break;
          }
          default: {
            (state.node as XmlElementNode).attributes[state.attribute] = "";
            updateState(state, ParseLocation.ATTRIBUTE_NAME, i);
            break;
          }
        }
        break;
      }
      case ParseLocation.BEFORE_ATTRIBUTE_VALUE: {
        switch (content.charCodeAt(i)) {
          case singleQuoteCode:
          case doubleQuoteCode: {
            state.quote = content[i];
            updateState(state, ParseLocation.ATTRIBUTE_VALUE, i + 1);
            break;
          }
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            break;
          }
          default: {
            state.quote = "";
            updateState(state, ParseLocation.ATTRIBUTE_VALUE, i);
            break;
          }
        }
        break;
      }
      case ParseLocation.ATTRIBUTE_VALUE: {
        switch (content.charCodeAt(i)) {
          case singleQuoteCode:
          case doubleQuoteCode: {
            if (state.quote === content[i]) {
              (state.node as XmlElementNode).attributes[state.attribute] =
                content.substring(state.start, i);
              updateState(state, ParseLocation.INSIDE_NODE, i);
            }
            break;
          }
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            if (!state.quote) {
              (state.node as XmlElementNode).attributes[state.attribute] =
                content.substring(state.start, i);
              updateState(state, ParseLocation.INSIDE_NODE, i);
            }
            break;
          }
        }
        break;
      }
      case ParseLocation.INSIDE_TEXT: {
        switch (content.charCodeAt(i)) {
          case openBracketCode: {
            (state.node as XmlTextNode).text = content.substring(
              state.start,
              i
            );
            updateState(state, ParseLocation.NODE_OPENED, i, state.node.parent);
            break;
          }
        }
        break;
      }
    }
  }

  return root;
}

function updateState(
  state: ParseState,
  location: ParseLocation,
  breakPos: number,
  node?: XmlNode
) {
  state.location = location;
  state.start = breakPos;
  if (node) {
    state.node = node;
  }
}
