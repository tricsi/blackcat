const fs = require('fs')
const { Packer } = require('roadroller')
const { minify } = require('html-minifier')

const code = fs.readFileSync('./build/main.js', 'utf8')
const html = fs.readFileSync('./build/dev.html', 'utf8')

async function run() {
    const packer = new Packer([{ data: code, type: 'js', action: 'eval' }], {})
    await packer.optimize()
    const { firstLine, secondLine } = packer.makeDecoder()
    const min = minify(html, { removeTagWhitespace: true, collapseWhitespace: true, minifyCSS: true })
    const out = min.replace(' src="main.js">', `>${firstLine}\n${secondLine}`)
    fs.writeFileSync('./build/index.html', out)
}

run()