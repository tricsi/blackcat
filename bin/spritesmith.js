const fs = require('fs')
const ect = require('ect-bin')
const glob = require('glob')
const Spritesmith = require('spritesmith')
const { execFile } = require('child_process')

const files = glob.sync('./sprite/*.png')
const out = './src/asset/texture.png'
const dot = 'ptc'

function getSpritesheetData(properties, coordinates, imgData) {
    const { width, height } = properties
    const data = { 
        size: [width, height, 1], 
        frames: {},
        src: `data:image/png;base64,${imgData}`
    }
    for (const path in coordinates) {
        if (Object.hasOwnProperty.call(coordinates, path)) {
            const { x, y, width, height } = coordinates[path]
            const name = path.match(/sprite[/\\](.+)\.png$/)
            if (name) {
                data.frames[name[1]] = [x, y, width, height]
            }
        }
    }
    if (data.frames[dot]) {
        let [UX, UY] = data.frames[dot]
        let [UW, UH] = data.size 
        data.dot = [
            Math.round((UX + 1.5) / UW * 1000) / 1000,
            Math.round((UY + 1.5) / UH * 1000) / 1000
        ]
    }
    return data
}

Spritesmith.run({src: files, padding: 1}, (_, result) => {
    const { image, properties, coordinates } = result
    fs.writeFileSync(out, image)
    execFile(ect, ['-strip', '-9', '--allfilters', out], () => {
        const stat = fs.statSync(out);
        const binaryData = fs.readFileSync(out)
        const base64String = binaryData.toString('base64')
        const spritesheedData = getSpritesheetData(properties, coordinates, base64String)
        fs.writeFileSync('./src/asset/texture.json', JSON.stringify(spritesheedData))
        console.log(stat.size)
    })
})
