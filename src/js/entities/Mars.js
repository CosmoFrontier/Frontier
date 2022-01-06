import * as THREE from "three";

export default class Mars{
    constructor(scene, camera, renderer){
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
    }

    init(){
        const MarsGeometry = new THREE.SphereGeometry(0.2, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x9C2E35,
            map: new THREE.TextureLoader().load("assets/mars_main.jpg"),

        });
        this.marsSphere = new THREE.Mesh(MarsGeometry, material);
        this.marsSphere.rotation.y = -90 * (Math.PI / 180);
        this.scene.add(this.marsSphere);
    }
    seconds = () =>
    new Date().getUTCHours() * 3600 +
    new Date().getUTCMinutes() * 60 +
    new Date().getUTCSeconds();

    

    render(){
        this.marsSphere.rotation.y = 
        80 * (Math.PI / 180) + this.seconds() * ((2 * Math.PI)/ (24*3600));
    }


}