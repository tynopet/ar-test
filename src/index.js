import * as THREE from 'three';
import * as THREEx from '@ar-js-org/ar.js/three.js/build/ar-threex-location-only';

function main() {
  const canvas = document.getElementById('canvas1');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1.33, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas });

  const arjs = new THREEx.LocationBased(scene, camera);
  const cam = new THREEx.WebcamRenderer(renderer);

  const geom = new THREE.BoxGeometry(20, 20, 20);
  const mtl = new THREE.MeshBasicMaterial({ color: 0xff0000 });

  const deviceOrientationControls = new THREEx.DeviceOrientationControls(camera);

  let fetched = false;

  arjs.on("gpsupdate", async(pos) => {
    if(!fetched) {
      const response = await fetch(`https://hikar.org/webapp/map?bbox=${pos.coords.longitude-0.01},${pos.coords.latitude-0.01},${pos.coords.longitude+0.01},${pos.coords.latitude+0.01}&layers=poi&outProj=4326`);

      const geojson = await response.json();

      geojson.features.forEach(feature => {
        const box = new THREE.Mesh(geom, mtl);
        arjs.add(box, feature.geometry.coordinates[0], feature.geometry.coordinates[1]);            
      });

      fetched = true;
    }
});

  arjs.startGps();

  function render() {
    if (canvas.width != canvas.clientWidth || canvas.height != canvas.clientHeight) {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

      const aspect = canvas.clientWidth / canvas.clientHeight;

      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    }

    deviceOrientationControls.update();

    cam.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();