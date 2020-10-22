import * as THREE from 'three'
import ReactDOM from 'react-dom'
import React, { useCallback, useEffect, useRef, useMemo } from 'react'

import TouchTexture from './TouchTexture';

export default function Particles(props) {

    const webgl;
    const container; 

    const loader; 
    const texture;
    
    const width;
    const height;
    const numPoints; 

    const hitArea;
    const object3D; 

    const handlerInteractiveMove;
    const touch; 


    function intialize(){
        webgl = props.webgl;
        container = new THREE.Object3D();
    }

    function init() {
        loader = new THREE.TextureLoader();

        loader.load(src, (texture) => {
			texture = texture;
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;
			texture.format = THREE.RGBFormat;

			width = texture.image.width;
			height = texture.image.height;

			initPoints(true);
		    initHitArea();
			initTouch();
			resize();
			show();
		});
    }

    function initPoints(discard) {
		numPoints = width * height;

		let numVisible = numPoints;
		let threshold = 0;
		let originalColors;

		if (discard) {
			// discard pixels darker than threshold #22
			numVisible = 0;
			threshold = 34;

			const img = texture.image;
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			canvas.width = width;
			canvas.height = height;
			ctx.scale(1, -1);
			ctx.drawImage(img, 0, 0, width, height * -1);

			const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			originalColors = Float32Array.from(imgData.data);

			for (let i = 0; i < this.numPoints; i++) {
				if (originalColors[i * 4 + 0] > threshold) numVisible++;
			}

        setUpMesh();
    }

    function initTouch() {
        if (!touch) touch = new TouchTexture(this);
		this.object3D.material.uniforms.uTouch.value = this.touch.texture;
    }

    function initHitArea() {
        const geometry = new THREE.PlaneGeometry(this.width, this.height, 1, 1);
		const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true, depthTest: false });
        material.visible = false;
        
		hitArea = new THREE.Mesh(geometry, material);
		container.add(this.hitArea);
    }

    
    function setUpMesh() {

        const uniforms = {
			uTime: { value: 0 },
			uRandom: { value: 1.0 },
			uDepth: { value: 2.0 },
			uSize: { value: 0.0 },
			uTextureSize: { value: new THREE.Vector2(this.width, this.height) },
			uTexture: { value: this.texture },
			uTouch: { value: null },
		};

		const material = new THREE.RawShaderMaterial({
			uniforms,
			vertexShader: glslify(require('../../../shaders/particle.vert')),
			fragmentShader: glslify(require('../../../shaders/particle.frag')),
			depthTest: false,
			transparent: true,
			// blending: THREE.AdditiveBlending
		});

        const geometry = new THREE.InstancedBufferGeometry();

		// positions
		const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3);
		positions.setXYZ(0, -0.5,  0.5,  0.0);
		positions.setXYZ(1,  0.5,  0.5,  0.0);
		positions.setXYZ(2, -0.5, -0.5,  0.0);
		positions.setXYZ(3,  0.5, -0.5,  0.0);
		geometry.addAttribute('position', positions);

		// uvs
		const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2);
		uvs.setXYZ(0,  0.0,  0.0);
		uvs.setXYZ(1,  1.0,  0.0);
		uvs.setXYZ(2,  0.0,  1.0);
		uvs.setXYZ(3,  1.0,  1.0);
		geometry.addAttribute('uv', uvs);

		// index
		geometry.setIndex(new THREE.BufferAttribute(new Uint16Array([ 0, 2, 1, 2, 3, 1 ]), 1));

		const indices = new Uint16Array(numVisible);
		const offsets = new Float32Array(numVisible * 3);
		const angles = new Float32Array(numVisible);

		for (let i = 0, j = 0; i < this.numPoints; i++) {
			if (discard && originalColors[i * 4 + 0] <= threshold) continue;

			offsets[j * 3 + 0] = i % this.width;
			offsets[j * 3 + 1] = Math.floor(i / this.width);

			indices[j] = i;

			angles[j] = Math.random() * Math.PI;

			j++;
		}

		geometry.addAttribute('pindex', new THREE.InstancedBufferAttribute(indices, 1, false));
		geometry.addAttribute('offset', new THREE.InstancedBufferAttribute(offsets, 3, false));
		geometry.addAttribute('angle', new THREE.InstancedBufferAttribute(angles, 1, false));

		object3D = new THREE.Mesh(geometry, material);
		container.add(object3D);
    }

    function setupListeners() {
        handlerInteractiveMove = onInteractiveMove.bind(this);

		webgl.interactive.addListener('interactive-move', this.handlerInteractiveMove);
		webgl.interactive.objects.push(this.hitArea);
		webgl.interactive.enable();

    }

    function removeListeners() {
        webgl.interactive.removeListener('interactive-move', this.handlerInteractiveMove);
		
		const index = this.webgl.interactive.objects.findIndex(obj => obj === this.hitArea);
		webgl.interactive.objects.splice(index, 1);
		webgl.interactive.disable();
    }

    /// public /////////////////////////////

    function update() {
        if (!object3D) return;
		if (touch) touch.update();

		object3D.material.uniforms.uTime.value += delta;

    }

    function show(time = 1.0) {
		TweenLite.fromTo(this.object3D.material.uniforms.uSize, time, { value: 0.5 }, { value: 1.5 });
		TweenLite.to(this.object3D.material.uniforms.uRandom, time, { value: 2.0 });
		TweenLite.fromTo(this.object3D.material.uniforms.uDepth, time * 1.5, { value: 40.0 }, { value: 4.0 });

		addListeners();
    }

    function hide(_destroy, time = 0.8) {
		return new Promise((resolve, reject) => {
			TweenLite.to(this.object3D.material.uniforms.uRandom, time, { value: 5.0, onComplete: () => {
				if (_destroy) this.destroy();
				resolve();
			} });
			TweenLite.to(this.object3D.material.uniforms.uDepth, time, { value: -20.0, ease: Quad.easeIn });
			TweenLite.to(this.object3D.material.uniforms.uSize, time * 0.8, { value: 0.0 });

			this.removeListeners();
		});
	}

    
    // event handlers

    
    function resize() {
        if (!object3D) return;

		const scale = this.webgl.fovHeight / this.height;
		object3D.scale.set(scale, scale, 1);
		hitArea.scale.set(scale, scale, 1);
    }


	function destroy() {
		if (!this.object3D) return;

		this.object3D.parent.remove(this.object3D);
		this.object3D.geometry.dispose();
		this.object3D.material.dispose();
		this.object3D = null;

		if (!this.hitArea) return;

		this.hitArea.parent.remove(this.hitArea);
		this.hitArea.geometry.dispose();
		this.hitArea.material.dispose();
		this.hitArea = null;
	}



    function onInteractiveMove(e) {
		const uv = e.intersectionData.uv;
		if (touch) this.touch.addTouch(uv);
	}

}