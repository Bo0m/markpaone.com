import {
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
	Raycaster,
	Vector2,
	Shape,
	ExtrudeBufferGeometry,
	TextureLoader,
	RepeatWrapping,
	Mesh,
	MeshPhongMaterial,
	FontLoader,
	TextGeometry,
	BufferGeometry,
	Color,
	PointLight
} from 'three';
import EmailTile from './assets/tiles/email.png';
import PhoneTile from './assets/tiles/phone.png';
import ResumeTile from './assets/tiles/resume.png';
import LinkedInTile from './assets/tiles/linkedin.png';
import FacebookTile from './assets/tiles/facebook.png';
import GitHubTile from './assets/tiles/github.png';
import MarkPaoneText from './assets/prosto_regular_markpaone.typeface.json';
import ResumeFile from './assets/MarkPaoneResumeJan2020.pdf';

const tiles = [
	{
		name: 'Email',
		url: 'mailto:mark@paone.co',
		texture: EmailTile,
		color: 0xf2f2f2,
		defaultMeshPosition: { x: -75, y: 225, z: 0 }
	},
	{
		name: 'Phone',
		url: 'tel:7329034123',
		texture: PhoneTile,
		color: 0xffffff,
		defaultMeshPosition: { x: 0, y: 225, z: 0 }
	},
	{
		name: 'Resume',
		url: ResumeFile,
		texture: ResumeTile,
		color: 0xffffff,
		defaultMeshPosition: { x: 75, y: 225, z: 0 }
	},
	{
		name: 'LinkedIn',
		url: 'https://linkedin.com/in/mpaone',
		texture: LinkedInTile,
		color: 0x2867b2,
		defaultMeshPosition: { x: -75, y: 100, z: 0 }
	},
	{
		name: 'Facebook',
		url: 'https://facebook.com/mpaone',
		texture: FacebookTile,
		color: 0x1877f2,
		defaultMeshPosition: { x: 0, y: 100, z: 0 }
	},
	{
		name: 'GitHub',
		url: 'https://github.com/Bo0m',
		texture: GitHubTile,
		color: 0x171516,
		defaultMeshPosition: { x: 75, y: 100, z: 0 }
	}
];

function getFOV(screenSize) {
	if (screenSize < 500) {
		return Math.round((500 - screenSize) / 10 + 45);
	}

	return 40;
}

const threeSupported = Modernizr.canvas && Modernizr.webgl;
const container = document.getElementById('container');
const camera = threeSupported
	? new PerspectiveCamera(
			getFOV(Math.min(window.innerWidth, window.innerHeight)),
			window.innerWidth / window.innerHeight,
			1,
			1000
	  )
	: null;
const scene = threeSupported ? new Scene() : null;
const renderer = threeSupported ? new WebGLRenderer({ antialias: true }) : null;
const raycaster = threeSupported ? new Raycaster() : null;
const mouse = threeSupported ? new Vector2() : null;

function updateMouseLocation(mouseX, mouseY) {
	mouse.x = (mouseX / window.innerWidth) * 2 - 1;
	mouse.y = -(mouseY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.fov = getFOV(Math.min(window.innerWidth, window.innerHeight));
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentClick(event) {
	event.preventDefault();
	updateMouseLocation(event.clientX, event.clientY);

	raycaster.setFromCamera(mouse, camera);
	const meshIntersects = raycaster.intersectObjects(scene.children);
	if (meshIntersects.length > 0) {
		meshIntersects[0].object.callback();
	}
}

function onDocumentMouseMove(event) {
	event.preventDefault();
	updateMouseLocation(event.clientX, event.clientY);
}

function onDocumentTouchMove(event) {
	if (event.touches.length == 1) {
		updateMouseLocation(event.touches[0].clientX, event.touches[0].clientY);
	}
}

function buildTileMesh(tileData) {
	// Build tile shape
	const tileShape = new Shape();
	tileShape.moveTo(-25, -15);
	tileShape.lineTo(-25, 15);
	tileShape.quadraticCurveTo(-25, 25, -15, 25);
	tileShape.lineTo(15, 25);
	tileShape.quadraticCurveTo(25, 25, 25, 15);
	tileShape.lineTo(25, -15);
	tileShape.quadraticCurveTo(25, -25, 15, -25);
	tileShape.lineTo(-15, -25);
	tileShape.quadraticCurveTo(-25, -25, -25, -15);

	// Build geometry
	const tileShapeGeometry = new ExtrudeBufferGeometry(tileShape, {
		depth: 10,
		bevelEnabled: true,
		bevelSegments: 2,
		steps: 1,
		bevelSize: 1,
		bevelThickness: 1
	});

	// Load texture
	const textureLoader = new TextureLoader();
	const tileTexture = textureLoader.load(tileData.texture);
	tileTexture.wrapS = tileTexture.wrapT = RepeatWrapping;
	tileTexture.repeat.set(0.02, 0.02);
	tileTexture.offset.set(0.5, 0.5);

	// Build mesh
	const tileMesh = new Mesh(tileShapeGeometry, [
		new MeshPhongMaterial({ map: tileTexture }),
		new MeshPhongMaterial({ color: tileData.color })
	]);
	tileMesh.position.set(
		tileData.defaultMeshPosition.x,
		tileData.defaultMeshPosition.y,
		tileData.defaultMeshPosition.z
	);
	tileMesh.name = tileData.name;
	tileMesh.animation = function() {
		this.rotation.y =
			this.rotation.y >= 6.3 ? 0.025 : this.rotation.y + 0.025;
	};
	tileMesh.callback = function() {
		window.open(tileData.url, '_blank');
	};

	// Return new mesh
	return tileMesh;
}

function buildTextMesh(text) {
	const fontLoader = new FontLoader();
	const parsedFont = fontLoader.parse(MarkPaoneText);
	const textGeometry = new TextGeometry(text, {
		font: parsedFont,
		size: 25,
		height: 20,
		curveSegments: 4,
		bevelThickness: 2,
		bevelSize: 1.5,
		bevelEnabled: true
	});
	textGeometry.computeBoundingBox();
	textGeometry.computeVertexNormals();

	const textGeo = new BufferGeometry().fromGeometry(textGeometry);

	const textMesh = new Mesh(textGeo, [
		new MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
		new MeshPhongMaterial({ color: 0xffffff }) // side
	]);

	textMesh.position.x =
		-0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
	textMesh.position.y = 150;

	textMesh.animating = false;
	textMesh.animiationStep = 0;

	textMesh.animation = function() {
		const stepX = 0.015;
		const maxX = 0.25;
		switch (this.animiationStep) {
			case 0:
				this.animiationStep = this.animating ? 1 : 0;
				break;
			case 1:
				this.rotation.x -= stepX;
				if (
					Math.abs(this.rotation.x) > maxX ||
					(!this.animating && this.rotation.x < 0)
				) {
					this.animiationStep = 2;
				}

				if (!this.animating && this.rotation.x - stepX < 0) {
					this.animiationStep = -1;
				}
				break;

			case 2:
				this.rotation.x += stepX;
				if (
					Math.abs(this.rotation.x) > maxX ||
					(!this.animating && this.rotation.x > 0)
				) {
					this.animiationStep = 1;
				}
				if (!this.animating && this.rotation.x + stepX > 0) {
					this.animiationStep = -1;
				}
				break;

			default:
				this.rotation.x = 0;
				this.animiationStep = this.animating ? 1 : 0;
		}
	};

	textMesh.callback = function() {
		this.animating = !this.animating;
	};

	return textMesh;
}

function init() {
	scene.background = new Color(0xf0f0f0);
	camera.position.set(0, 150, 500);
	scene.add(camera);

	const light = new PointLight(0xffffff, 0.8);
	camera.add(light);

	tiles.forEach(function(tile) {
		scene.add(buildTileMesh(tile));
	});
	scene.add(buildTextMesh('Mark Paone'));

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.replaceChild(
		renderer.domElement,
		document.getElementById('preload')
	);

	window.addEventListener('resize', onWindowResize, false);
	document.addEventListener('touchmove', onDocumentTouchMove, false);
	document.addEventListener('mousemove', onDocumentMouseMove, false);
	document.addEventListener('click', onDocumentClick, false);
	animate();
}

function animate() {
	requestAnimationFrame(animate);
	scene.children
		.filter(function(child) {
			return Object.prototype.hasOwnProperty.call(child, 'animation');
		})
		.forEach(function(tile) {
			tile.animation();
		});
	// Darken background once loaded
	if (scene.background.getHex() > 0x6d6d6d) {
		scene.background.setHex(scene.background.getHex() - 65793);
	}
	render();
}

function render() {
	raycaster.setFromCamera(mouse, camera);
	const meshIntersects = raycaster.intersectObjects(scene.children);
	document.body.style.cursor = meshIntersects.length > 0 ? 'pointer' : '';
	renderer.render(scene, camera);
}

document.addEventListener(
	'DOMContentLoaded',
	function() {
		if (Modernizr.canvas && Modernizr.webgl) {
			// document.getElementById("preload").className = "hidden";
			init();
		}
	},
	false
);
