# grab-xml

A simple XML parser.

## Installation

Use `npm` (or `yarn`, or `pnpm`) to add grab-xml to your project:

```bash
npm install grab-xml
```

grab-xml contains CommonJS and ESM modules for use in Node, in the browser and at the edge.

## Usage

### grabXml

Parses XML into a root node with all of the XML's nodes as children.

```ts
import { grabXml } from 'grab-xml';
const xml = '<xml></xml>';
const doc = grabXml(xml);
```

### XmlNode

Each XmlNode has the following properties and functions:

| Property | Type | Description |
| --- | --- | --- |
| type | XmlNodeType | The type of node |
| parent | XmlNode | The parent node |
| tag | string | The tag name of the node, if applicable for the node type |
| attributes | object | Any attributes that were set on the node, if applicable for the node type |
| children | XmlNode[] | The child nodes, if applicable for the node type |
| text | string | The text content, if applicable for the node type |
| selfClosing | boolean | undefined | Whether this node is self-closing |

| Function | Description |
| --- | --- |
| content | Returns a string containing the text content of the node and its children |
| outerXml | Returns a string containing the XML of the node and its children, including the node itself |
| innerXml | Returns a string containing the XML of the node's children |
| json | Returns a string containing a JSON representation of the node and its children, excluding the circular parent references |

### Options

You can pass an options object into grabXml with the following optional properties:

| Property | Type | Description |
| --- | --- | --- |
| trimWhitespace | boolean | Whether to trim whitespace from text elements and omit text elements that contain only whitespace |
| ignoreComments | boolean | Whether to ignore comment nodes |
| ignoreInstructions | boolean | Whether to ignore processing instruction nodes |
| voidElements | string[] | The tags of elements that do not have any children, such as &lt;input> and &lt;br> in HTML documents |
| literalElements | string[] | The tags of elements that should be extracted with their unprocessed text content, such as &lt;script> and &lt;style> in HTML documents |

### grabHtml

Parses HTML into a root node with all of the HTML's nodes as children. Basically, it calls `grabXml` with the `voidElements` and `literalElements` options set to values that work for HTML.

```ts
import { grabHtml } from 'grab-xml';
const html = '<html></html>';
const doc = grabHtml(html);
```

### Benchmarks

There is a benchmark available in the `bench` directory that compares grab-xml with some other options. Use the following commands to run it:

```bash
cd bench
npm install
npm run bench
```

Note that grab-xml does a lot less than some of the slower options.
