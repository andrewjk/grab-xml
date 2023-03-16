const { grabXml } = require("../dist");
const fs = require("fs");

const fileName = __dirname + "/sample.xml";
const xmlData = fs.readFileSync(fileName).toString();

for (let i = 0; i < 100; i++) {
  grabXml(xmlData);
}
