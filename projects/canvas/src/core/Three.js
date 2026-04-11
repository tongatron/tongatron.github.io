import * as THREE from "three";
import Lenis from "lenis";
import WebGLContext from "./WebGLContext";
import Scene from "../scenes/Scene";

class Three {
	constructor(container) {
		this.container = container;
		this.context = null;
		this.clock = new THREE.Clock();
		this.lenis = null;
	}

	run() {
		this.context = new WebGLContext(this.container);
		this.context.init();
		this.scene = new Scene();
		this.#setupLenis();

		requestAnimationFrame((t) => this.#animate(t));
		this.#addResizeListener();
	}

	#setupLenis() {
		this.lenis = new Lenis({
			infinite: true,
			smoothWheel: true,
			syncTouch: true,
			lerp: 0.08,
		});
	}

	#animate(time) {
		const delta = this.clock.getDelta();
		const elapsed = this.clock.elapsedTime;

		this.lenis?.raf(time);
		const progress = this.#getLoopProgress();

		this.scene.animate(delta, elapsed, progress);
		this.#render();
		requestAnimationFrame((t) => this.#animate(t));
	}

	#getLoopProgress() {
		if (!this.lenis) return 0;
		const limit = this.lenis.limit;
		if (!limit) return 0;
		const raw = (this.lenis.scroll % limit) / limit;
		return raw < 0 ? raw + 1 : raw;
	}

	#render() {
		this.context.renderer &&
			this.context.renderer.render(this.scene.scene, this.scene.camera);
	}

	#addResizeListener() {
		window.addEventListener("resize", () => this.#onResize());
	}

	#onResize() {
		const { width, height } = this.context.getFullScreenDimensions();
		this.context.onResize(width, height);
		this.scene.onResize(width, height);
		this.lenis?.resize();
	}
}

export default Three;
