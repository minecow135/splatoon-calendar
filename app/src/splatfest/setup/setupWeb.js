const fs = require("fs");

const errorSend = require('../../common/errorSend.js');

if (!process.env.BASE_DIR) {
  throw "env variable BASE_DIR not set"
}
if (!process.env.BASE_DIR_WEB) {
  throw "env variable BASE_DIR_WEB not set"
}

function createWeb() {
  if (!process.env.WEB_NO_TEMPLATE || process.env.WEB_NO_TEMPLATE == "false") {
    webDirTemplate = process.env.BASE_DIR + "/webTemplate";
    webDir = process.env.BASE_DIR_WEB;

    console.log("copying web template");

    try {
      if (!fs.existsSync(webDir)){
        fs.mkdirSync(webDir, { recursive: true });
        console.log("create dir web");
      }
    } catch (error) {
      console.error(error);
      let element = "Splatfest";
      let category = "Setup web";
      let part = "create folder";
      errorSend({ element, category, part, error });
    }

    fs.cp(webDirTemplate, webDir, { recursive: true }, (error) => {
      if (error) {
        console.error(error);
        let element = "Splatfest";
        let category = "Setup web";
        let part = "copy folder";
        errorSend({ element, category, part, error });
      }
    });
  }
}

module.exports = createWeb;
