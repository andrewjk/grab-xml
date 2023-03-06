import { XmlNodeType, XmlNode } from "../types/XmlNode";

enum ParseLocation {
  /** Nothing interesting has been encountered yet */
  NONE,
  /** An element has been opened with an angled bracket */
  ELEMENT_OPENED,
  /** An element will close as we have encountered the start of a close tag */
  ELEMENT_CLOSING,
  /** An element will close itself, without any children */
  ELEMENT_SELF_CLOSING,
  /** Inside an element's opening tag name */
  ELEMENT_OPEN_NAME,
  /** Inside an element's closing tag name */
  ELEMENT_CLOSE_NAME,
  /** Inside an element node, between the attributes */
  INSIDE_ELEMENT,
  /** Inside an attribute's name */
  ATTRIBUTE_NAME,
  /** After an attribute's name, but before the equals sign (if applicable) */
  AFTER_ATTRIBUTE_NAME,
  /** After an attribute's equals sign, but before its value */
  BEFORE_ATTRIBUTE_VALUE,
  /** Inside an attribute's value */
  ATTRIBUTE_VALUE,
  /** Inside a text node */
  INSIDE_TEXT,
  /** Inside a comment node */
  INSIDE_COMMENT,
  /** Inside a CDATA node */
  INSIDE_CDATA,
  /** Inside a DOCTYPE node */
  INSIDE_DOCTYPE,
  /** Inside an instruction node, such as <?xml ... ?> */
  INSIDE_INSTRUCTION,
}

interface ParseState {
  /** The type of location we are currently parsing */
  location: ParseLocation;
  /** The index where the parsing location started */
  start: number;
  /** The node we are currently parsing */
  node: XmlNode;
}

// Character codes that we will need to check
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
const exclamationCode = "!".charCodeAt(0);
const dashCode = "-".charCodeAt(0);
const openSquareCode = "[".charCodeAt(0);
const closeSquareCode = "]".charCodeAt(0);

/**
 * Parses XML into a root element node with the XML's elements as children.
 * @param content The XML content to parse
 * @returns A root element node with the XML's elements as children
 */
export default function grabXml(content: string) {
  const root: XmlNode = {
    type: XmlNodeType.ELEMENT,
    parent: null,
    tag: "#root",
    attributes: {},
    children: [],
    text: "",
  };

  const state: ParseState = {
    location: ParseLocation.NONE,
    start: 0,
    node: root,
  };

  let attribute = "";
  let quote = "";
  let insideEntities = false;

  for (let i = 0; i < content.length; i++) {
    switch (state.location) {
      case ParseLocation.NONE: {
        // Check for opening brackets to start a comment or element, or chars to start a text element
        switch (content.charCodeAt(i)) {
          case openBracketCode: {
            updateState(state, ParseLocation.ELEMENT_OPENED, i);
            break;
          }
          default: {
            const child: XmlNode = {
              type: XmlNodeType.TEXT,
              parent: state.node,
              tag: "",
              attributes: {},
              children: [],
              text: "",
            };
            state.node.children.push(child);
            updateState(state, ParseLocation.INSIDE_TEXT, i, child);
            break;
          }
        }
        break;
      }
      case ParseLocation.ELEMENT_OPENED: {
        // Check for a slash to indicate a closing element, an exclamation mark to indicate a
        // comment or doctype, or chars to start the element's name
        switch (content.charCodeAt(i)) {
          case slashCode: {
            updateState(state, ParseLocation.ELEMENT_CLOSING, i);
            break;
          }
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            // Ignore spaces
            break;
          }
          case exclamationCode: {
            if (content.charCodeAt(i + 1) === dashCode && content.charCodeAt(i + 2) === dashCode) {
              const child: XmlNode = {
                type: XmlNodeType.COMMENT,
                parent: state.node,
                tag: "",
                attributes: {},
                children: [],
                text: "",
              };
              state.node.children.push(child);
              updateState(state, ParseLocation.INSIDE_COMMENT, i + 3, child);
              i += 2;
              break;
            } else if (
              content.charCodeAt(i + 1) === openSquareCode &&
              content.charCodeAt(i + 7) === openSquareCode &&
              content.substring(i + 2, i + 7).toLowerCase() === "cdata"
            ) {
              const child: XmlNode = {
                type: XmlNodeType.TEXT,
                parent: state.node,
                tag: "",
                attributes: {},
                children: [],
                text: "",
              };
              state.node.children.push(child);
              updateState(state, ParseLocation.INSIDE_CDATA, i + 8, child);
              i += 7;
              break;
            }
            // Fallthrough to default processing to include the exclamation mark in the tag
          }
          default: {
            const child: XmlNode = {
              type: XmlNodeType.ELEMENT,
              parent: state.node,
              tag: "",
              attributes: {},
              children: [],
              text: "",
            };
            state.node.children.push(child);
            updateState(state, ParseLocation.ELEMENT_OPEN_NAME, i, child);
            break;
          }
        }
        break;
      }
      case ParseLocation.ELEMENT_CLOSING: {
        // Check for chars to start the element's closing name
        switch (content.charCodeAt(i)) {
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            // Ignore spaces
            break;
          }
          default: {
            updateState(state, ParseLocation.ELEMENT_CLOSE_NAME, i);
            break;
          }
        }
        break;
      }
      case ParseLocation.ELEMENT_SELF_CLOSING: {
        // Check for a closing bracket to move onto the next thing
        switch (content.charCodeAt(i)) {
          case closeBracketCode: {
            updateState(state, ParseLocation.NONE, i, state.node.parent);
            break;
          }
        }
        break;
      }
      case ParseLocation.ELEMENT_OPEN_NAME: {
        // Check for a closing bracket to move onto the next thing, or spaces to start gathering attributes
        switch (content.charCodeAt(i)) {
          case closeBracketCode: {
            state.node.tag = content.substring(state.start, i);
            updateState(state, ParseLocation.NONE, i);
            break;
          }
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            state.node.tag = content.substring(state.start, i);
            switch (state.node.tag.charCodeAt(0)) {
              case exclamationCode: {
                state.node.type = XmlNodeType.INSTRUCTION;
                updateState(state, ParseLocation.INSIDE_DOCTYPE, i);
                break;
              }
              case questionCode: {
                state.node.type = XmlNodeType.INSTRUCTION;
                updateState(state, ParseLocation.INSIDE_INSTRUCTION, i);
                break;
              }
              default: {
                updateState(state, ParseLocation.INSIDE_ELEMENT, i);
                break;
              }
            }
            break;
          }
        }
        break;
      }
      case ParseLocation.ELEMENT_CLOSE_NAME: {
        // Check for a closing bracket to move onto the next thing
        switch (content.charCodeAt(i)) {
          case closeBracketCode: {
            // TODO: Check that the tagname matches
            updateState(state, ParseLocation.NONE, i, state.node.parent);
            break;
          }
        }
        break;
      }
      case ParseLocation.INSIDE_ELEMENT: {
        // Check for a slash or a close bracket to start closing the element, or chars to start an attribute's name
        switch (content.charCodeAt(i)) {
          case slashCode: {
            updateState(state, ParseLocation.ELEMENT_SELF_CLOSING, i);
            break;
          }
          case closeBracketCode: {
            // TODO: Handle other types of automatically self-closing nodes, like <link> in HTML
            if (state.node.tag.startsWith("?")) {
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
            // Ignore spaces
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
        // Check for an equals to start the attribute's value, a close bracket to close the element,
        // or spaces to ignore if it turns out the attribute has no value after a bit more processing
        switch (content.charCodeAt(i)) {
          case equalsCode: {
            attribute = content.substring(state.start, i);
            updateState(state, ParseLocation.BEFORE_ATTRIBUTE_VALUE, i);
            break;
          }
          case closeBracketCode: {
            state.node.attributes[content.substring(state.start, i)] = "";
            updateState(state, ParseLocation.NONE, i);
            break;
          }
          case slashCode: {
            state.node.attributes[content.substring(state.start, i)] = "";
            updateState(state, ParseLocation.ELEMENT_CLOSING, i);
            break;
          }
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            attribute = content.substring(state.start, i);
            updateState(state, ParseLocation.AFTER_ATTRIBUTE_NAME, i);
            break;
          }
        }
        break;
      }
      case ParseLocation.AFTER_ATTRIBUTE_NAME: {
        // Check for an equals to start the attribute's value, a slash to close the element,
        // or chars to start a new attribute
        switch (content.charCodeAt(i)) {
          case equalsCode: {
            updateState(state, ParseLocation.BEFORE_ATTRIBUTE_VALUE, i);
            break;
          }
          case slashCode: {
            state.node.attributes[attribute] = "";
            updateState(state, ParseLocation.ELEMENT_SELF_CLOSING, i);
            break;
          }
          default: {
            state.node.attributes[attribute] = "";
            updateState(state, ParseLocation.ATTRIBUTE_NAME, i);
            break;
          }
        }
        break;
      }
      case ParseLocation.BEFORE_ATTRIBUTE_VALUE: {
        // Check for quotes or chars to start the attribute's value
        switch (content.charCodeAt(i)) {
          case singleQuoteCode:
          case doubleQuoteCode: {
            quote = content[i];
            updateState(state, ParseLocation.ATTRIBUTE_VALUE, i + 1);
            break;
          }
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            // Ignore spaces
            break;
          }
          default: {
            quote = "";
            updateState(state, ParseLocation.ATTRIBUTE_VALUE, i);
            break;
          }
        }
        break;
      }
      case ParseLocation.ATTRIBUTE_VALUE: {
        // Check for quotes or spaces to end the attribute's value
        switch (content.charCodeAt(i)) {
          case singleQuoteCode:
          case doubleQuoteCode: {
            if (quote === content[i]) {
              state.node.attributes[attribute] = content.substring(state.start, i);
              updateState(state, ParseLocation.INSIDE_ELEMENT, i);
            }
            break;
          }
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            if (!quote) {
              state.node.attributes[attribute] = content.substring(state.start, i);
              updateState(state, ParseLocation.INSIDE_ELEMENT, i);
            }
            break;
          }
        }
        break;
      }
      case ParseLocation.INSIDE_TEXT: {
        // Check for an open bracket to start a comment or an element
        switch (content.charCodeAt(i)) {
          case openBracketCode: {
            state.node.text = content.substring(state.start, i);
            updateState(state, ParseLocation.ELEMENT_OPENED, i, state.node.parent);
            break;
          }
        }
        break;
      }
      case ParseLocation.INSIDE_COMMENT: {
        // Check for the comment end chars to close the comment and move on
        if (
          content.charCodeAt(i) === dashCode &&
          content.charCodeAt(i + 1) === dashCode &&
          content.charCodeAt(i + 2) === closeBracketCode
        ) {
          // Just trim comments, I don't think the surrounding whitespace is ever going to be interesting
          state.node.text = content.substring(state.start, i).trim();
          updateState(state, ParseLocation.NONE, i + 3, state.node.parent);
          i += 2;
        }
        break;
      }
      case ParseLocation.INSIDE_CDATA: {
        // Check for the CDATA end chars to close the text and move on
        if (
          content.charCodeAt(i) === closeSquareCode &&
          content.charCodeAt(i + 1) === closeSquareCode &&
          content.charCodeAt(i + 2) === closeBracketCode
        ) {
          // Just trim CDATA
          state.node.text = content.substring(state.start, i).trim();
          updateState(state, ParseLocation.NONE, i + 3, state.node.parent);
          i += 2;
        }
        break;
      }
      case ParseLocation.INSIDE_DOCTYPE: {
        // Check for the entities start char, or DOCTYPE end chars to close the text and move on
        switch (content.charCodeAt(i)) {
          case openSquareCode: {
            insideEntities = true;
            break;
          }
          case closeSquareCode: {
            insideEntities = false;
            break;
          }
          case closeBracketCode: {
            if (!insideEntities) {
              // Just trim DOCTYPE
              state.node.text = content.substring(state.start, i).trim();
              updateState(state, ParseLocation.NONE, i, state.node.parent);
            }
            break;
          }
        }
        break;
      }
      case ParseLocation.INSIDE_INSTRUCTION: {
        // Check for the comment end chars to close the comment and move on
        if (
          content.charCodeAt(i) === questionCode &&
          content.charCodeAt(i + 1) === closeBracketCode
        ) {
          // Just trim instructions
          state.node.text = content.substring(state.start, i).trim();
          updateState(state, ParseLocation.NONE, i + 2, state.node.parent);
          i += 1;
        }
        break;
      }
    }
  }

  return root;
}

function updateState(state: ParseState, location: ParseLocation, breakPos: number, node?: XmlNode) {
  state.location = location;
  state.start = breakPos;
  if (node) {
    state.node = node;
  }
}
