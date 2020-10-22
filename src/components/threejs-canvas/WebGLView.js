import 'three';
import { TweenLite } from 'gsap/TweenMax';

import InteractiveControls from './controls/InteractiveControls';
import Particles from './particles/Particles';

const glslify = require('glslify');

export default function WebGLView(props) {

        const app;
        const samples;

        const scene;
        const camera;
        
        const renderer;
        const clock; 

        const interactive; 

        const particles; 

        function initalize() {
            app = props.app

            // check samples
           samples = [
                './images/sample-01.png',
                './images/sample-02.png',
                './images/sample-03.png',
                './images/sample-04.png',
                './images/sample-05.png',
            ];

            initThree();
            initalizeParticles();
            initControls();
        }

        function initThree() {
            scene = new THREE.Scene();

            // camera
            camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
            camera.position.z = 300;
    
            // renderer
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
            // clock
            clock = new THREE.Clock(true);
        }

        function initControls() {
            // fix formatting 
            interactive = new InteractiveControls(this.camera, this.renderer.domElement);
        }

        function initalizeParticles() {
            particles = new Particles(this);
            scene.add(this.particles.container);
        }

        // public

        function update() {

        }

        function draw() {


        }

        function next() {


        }

        function goto() {


        }

}