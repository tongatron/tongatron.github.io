/**
 * Collects every stylesheet currently attached to the document and
 * returns it as a single CSS string that can be injected into an SVG
 * <foreignObject>.
 *
 * Why this exists: when HtmlToCanvas serializes the page into a data-URL
 * SVG, that SVG is loaded as an <img> and runs in "restricted mode" — it
 * cannot see the parent document's stylesheets or @font-face rules. So
 * anything class-driven (Tailwind utilities) or font-driven (Google
 * Fonts) silently falls back to browser defaults unless we embed the
 * styles directly inside the foreignObject.
 *
 * Same-origin sheets (Vite-served CSS, inline <style>): read via the
 *   CSSOM — cssRules is accessible, cssText is authoritative.
 * Cross-origin sheets (fonts.googleapis.com): reading cssRules throws a
 *   SecurityError, so we fetch the href instead. For font CSS we then
 *   rewrite every remote woff2 URL to a base64 data URI, because the
 *   sandboxed SVG can't reach the network for font file requests either.
 */
export async function collectDocumentCss() {
	const chunks = await Promise.all(
		Array.from(document.styleSheets).map((sheet) => readSheet(sheet)),
	);
	return chunks.filter(Boolean).join("\n");
}

async function readSheet(sheet) {
	try {
		// Same-origin path: CSSOM exposes the parsed rules directly.
		const rules = sheet.cssRules;
		if (rules) {
			return Array.from(rules)
				.map((r) => r.cssText)
				.join("\n");
		}
	} catch {
		// Fall through to network fetch for cross-origin sheets.
	}

	if (!sheet.href) return "";

	try {
		const res = await fetch(sheet.href);
		const css = await res.text();
		return await inlineFontUrls(css);
	} catch {
		return "";
	}
}

/**
 * Finds every `url(https://...)` inside a CSS string, fetches each one,
 * and replaces it with a base64 data URI. Used for Google Fonts woff2
 * binaries so the SVG can render them without network access.
 */
async function inlineFontUrls(css) {
	const urlRegex = /url\((https:\/\/[^)"']+)\)/g;
	const urls = Array.from(
		new Set(Array.from(css.matchAll(urlRegex), (m) => m[1])),
	);
	if (urls.length === 0) return css;

	const pairs = await Promise.all(
		urls.map(async (url) => {
			try {
				const r = await fetch(url);
				const blob = await r.blob();
				const dataUri = await blobToDataUri(blob);
				return [url, dataUri];
			} catch {
				return [url, null];
			}
		}),
	);

	let out = css;
	for (const [orig, dataUri] of pairs) {
		if (!dataUri) continue;
		// Split-and-join instead of regex so we don't have to escape the
		// original URL for the RegExp parser.
		out = out.split(orig).join(dataUri);
	}
	return out;
}

function blobToDataUri(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}
