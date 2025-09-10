const { build, context } = require('esbuild')
const { glsl } = require('esbuild-plugin-glsl')

const isDev = process.env.npm_lifecycle_event === 'start'

const buildConfig = {
	entryPoints: ['src/main.ts'],
	outfile: 'build/main.js',
	bundle: true,
    minify: !isDev,
	logLevel: 'debug',
    sourcemap: isDev,
	plugins: [ glsl({ minify: !isDev }) ],
	define: { DEBUG: isDev ? 'true' : 'false' }
}

const serveConfig = {
	servedir: '.',
	host: '0.0.0.0',
	port: 5500,
	onRequest: ({method, status, path, remoteAddress}) => console.log(`${status} ${method}: ${path} - ${remoteAddress}`)
}

async function serve() {
	const ctx = await context(buildConfig)
	await ctx.watch()
	await ctx.serve(serveConfig)
}

isDev ? serve() : build(buildConfig)
