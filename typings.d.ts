declare module '*.json' {
	const content: any;
	export default content;
}

declare module '*.frag' {
	const content: string;
	export default content;
}

declare module '*.vert' {
	const content: string;
	export default content;
}

declare const DEBUG: boolean;
