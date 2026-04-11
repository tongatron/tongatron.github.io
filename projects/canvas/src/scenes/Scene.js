import * as THREE from "three";
import WebGLContext from "../core/WebGLContext";
import HtmlToCanvas from "../utils/HtmlToCanvas";
import { collectDocumentCss } from "../utils/collectDocumentCss";
import { createProjector } from "../utils/ProjectedMaterial";
import ImportGltf from "../utils/ImportGltf";
import { keyframeValue, smoothstep } from "../utils/utils";

const CAMERA_FOV = 45;
const REST_POSITION = new THREE.Vector3(0, 0, 15);
const LOOK_TARGET = new THREE.Vector3(0, -1, -4);

export default class Scene {
	constructor() {
		this.context = null;
		this.camera = null;
		this.width = 0;
		this.height = 0;
		this.aspectRatio = 0;
		this.scene = null;
		this.envMap = null;
		this.projector = null;
		this.htmlToCanvas = null;
		this.projectedMeshes = [];
		this.#init();
	}

	#init() {
		this.#setContext();
		this.#setupScene();
		this.#setupCamera();
		this.#addLights();
		this.#addObjects();
	}

	#setContext() {
		this.context = new WebGLContext();
	}

	#setupScene() {
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0xffffff);
	}

	#setupCamera() {
		this.#calculateAspectRatio();
		this.camera = new THREE.PerspectiveCamera(
			CAMERA_FOV,
			this.aspectRatio,
			1,
			100,
		);
		this.camera.position.copy(REST_POSITION);
		this.camera.lookAt(LOOK_TARGET);
	}

	#addLights() {
		const ambient = new THREE.AmbientLight(0xffffff, 1.0);
		this.scene.add(ambient);

		const key = new THREE.DirectionalLight(0xffffff, 2.6);
		key.position.set(5, 8, 6);
		key.castShadow = true;
		key.shadow.mapSize.set(2048, 2048);
		key.shadow.camera.near = 0.5;
		key.shadow.camera.far = 50;
		key.shadow.camera.left = -15;
		key.shadow.camera.right = 15;
		key.shadow.camera.top = 15;
		key.shadow.camera.bottom = -15;

		key.shadow.bias = -0.0001;
		key.shadow.normalBias = 0.02;
		this.scene.add(key);
	}

	#addObjects() {
		this.projectedMeshes = [];
		const standardMaterial = new THREE.MeshStandardMaterial({
			color: 0xffffff,
		});

		const basicMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

		new ImportGltf(`${import.meta.env.BASE_URL}model.glb`, {
			onLoad: (model) => {
				this.model = model;
				model.traverse((c) => {
					if (!c.isMesh) return;

					if (c.userData.name == "bg") {
						c.material = basicMaterial;
						c.castShadow = false;
						c.receiveShadow = true;
					} else {
						c.material = standardMaterial;
						c.castShadow = true;
						c.receiveShadow = true;
					}

					this.projectedMeshes.push(c);
				});

				this.scene.add(this.model);
				this.#setupProjection();
			},
		});
	}

	#setupProjection() {
		const projectorCamera = new THREE.PerspectiveCamera(
			CAMERA_FOV,
			this.aspectRatio,
			this.camera.near,
			this.camera.far,
		);
		projectorCamera.position.copy(REST_POSITION);
		projectorCamera.lookAt(LOOK_TARGET);
		projectorCamera.updateMatrixWorld();

		const pageElement = document.getElementById("page");
		this.htmlToCanvas = new HtmlToCanvas(pageElement, {
			width: this.width,
			height: this.height,
			pixelRatio: Math.min(window.devicePixelRatio, 2),
		});

		this.projector = createProjector({
			camera: projectorCamera,
			texture: this.htmlToCanvas.texture,
		});

		for (const mesh of this.projectedMeshes) {
			this.projector.applyTo(mesh);
		}
		this.projector.update();

		// Kick off the first rasterization once fonts are ready so layout
		// measurements and glyph outlines are final.
		this.#rasterizePage();
	}

	async #rasterizePage() {
		if (document.fonts && document.fonts.ready) {
			await document.fonts.ready;
		}

		if (!this.htmlToCanvas.extraCss) {
			this.htmlToCanvas.extraCss = await collectDocumentCss();
		}
		await this.htmlToCanvas.update();
	}

	#calculateAspectRatio() {
		const { width, height } = this.context.getFullScreenDimensions();
		this.width = width;
		this.height = height;
		this.aspectRatio = this.width / this.height;
	}

	animate(delta, elapsed, progress = 0) {
		const kf = keyframeValue(progress);
		this.camera.position.set(
			REST_POSITION.x + kf.x,
			REST_POSITION.y + kf.y,
			REST_POSITION.z + kf.z,
		);
		this.camera.lookAt(LOOK_TARGET);
		this.camera.rotateZ(kf.roll);

		if (this.projector) {
			const distFromRest = Math.min(progress, 1 - progress) * 2;
			const t = Math.min(distFromRest / 1, 1);
			this.projector.uniforms.uLitness.value = smoothstep(t);
		}
	}

	onResize(width, height) {
		this.width = width;
		this.height = height;
		this.aspectRatio = width / height;

		this.camera.aspect = this.aspectRatio;
		this.camera.updateProjectionMatrix();

		if (this.projector) {
			this.projector.camera.aspect = this.aspectRatio;
			this.projector.camera.updateProjectionMatrix();
			this.projector.update();
		}

		if (this.htmlToCanvas) {
			this.htmlToCanvas.resize(width, height);
			this.#rasterizePage();
		}
	}
}
