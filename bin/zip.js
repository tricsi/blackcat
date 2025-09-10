const fs = require('fs');
const ect = require('ect-bin');
const { execFile } = require('child_process');

const outFile = 'index.html.zip'

fs.stat(outFile, err => err || fs.unlinkSync(outFile))

execFile(ect, ['-zip', '-9', 'index.html'], err => {
    const stat = fs.statSync(outFile);
    console.log(stat.size);
});