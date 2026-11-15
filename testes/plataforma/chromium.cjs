// Usa Chromium disponível no ambiente local ou o pacote Playwright instalado pelo CI.
const fs=require('fs');module.exports=function(options={}){const executablePath=process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);return{...options,...(executablePath?{executablePath}:{}),args:[...(options.args||[]),'--no-sandbox']}};
