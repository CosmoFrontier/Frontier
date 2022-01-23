import * as THREE from "three";

export default class Mercury{
    constructor(scene, camera, renderer, data){
        this.name = "mercury",
        this.camera  = camera,
        this.renderer = renderer,
        this.scene = scene,
        this.data = data;
        this.radius = 500 * this.data.data[0].radius;
        this.theta = this.data.data[0].angular_distance;
        this.inclination = 7 * (Math.PI / 180);
        this.y_distance = this.radius * Math.sin(this.data.data[0].inclination * (Math.PI / 180));

    }

    init(){
        const MercuryGeometry = new THREE.SphereGeometry(10 / 285, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0xD5D2D1,
            map: new THREE.TextureLoader().load("assets/mercury_main.jpeg")
        });
        this.mercurySphere = new THREE.Mesh(MercuryGeometry, material);
        this.mercurySphere.position.y = -90 * (Math.PI / 180);
        this.mercurySphere.position.set(
            Math.sin(this.theta) * this.radius,
            this.y_distance,
            this.radius * Math.cos(this.theta)
        );

        this.scene.add(this.mercurySphere);
        this.drawTrail();

    }
    drawTrail() {
        const ellipse = new THREE.EllipseCurve(
            0, 0, this.radius, this.radius,
            -(1.5*Math.PI + this.theta),
            -Math.PI * 1.5,
            false,
            0
        );

        const points = ellipse.getPoints(50);
        for(let i=0; i<points.length; i++) {
            points[i] = new THREE.Vector3(points[i].x, 0, points[i].y);

        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        const colors = [];
        const initialColor = 0xD5D2D1;
        for(let i=0; i<geometry.attributes.position.count; i++){
            var color = new THREE.Color(initialColor);
            color.r = color.r - (color.r / geometry.attributes.position.count) * i;
            color.g = color.g - (color.g / geometry.attributes.position.count) * i;
            color.b = color.b - (color.b / geometry.attributes.position.count) * i;
            colors.push(color.r, color.g, color.b);
        }

        geometry.setAttribute(
            "color",
            new THREE.BufferAttribute(new Float32Array(colors),3)

        );

        const Linematerial = new THREE.LineBasicMaterial({
            vertexColors: THREE.VertexColors,
            transparent: true,
        });

        const line = new THREE.Line(geometry, Linematerial);
        line.rotateX(-this.inclination);
        line.name = "mercuryTrail";
        this.trail = line;
        this.scene.add(line);

    }

    removeTrail() {
        var trail = this.scene.getObjectByName(this.trail.name);
        this.scene.remove(trail);
    }
    seconds = () =>
    new Date().getUTCHours() * 3600 +
    new Date().getUTCMinutes() * 60 +
    new Date().getUTCSeconds();

    render() {
        this.mercurySphere.position.set(
            Math.sin(this.theta) * this.radius,
            this.y_distance,
            this.radius * Math.cos(this.theta)
        );
        this.mercurySphere.rotation.y = 
        80 * (Math.PI / 180) + this.seconds() * ((2*Math.PI) / (24 * 3600));
    }
}