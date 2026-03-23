// lessons.js
// Clean, PIN-free, fully working version for the new HTML layout

import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.158.0/examples/jsm/loaders/GLTFLoader.js';

/* ------------------------------
   LESSON METADATA
------------------------------ */

const lessons = [
  { id:1, title:'Lesson 1 — Basic Scene & Spinning Cube', desc:'Create a scene, camera, renderer, add a cube and animate it.' },
  { id:2, title:'Lesson 2 — Lights & Materials', desc:'Add lights and use MeshStandardMaterial for realistic shading.' },
  { id:3, title:'Lesson 3 — Textures & UVs', desc:'Load textures, apply maps, and understand UVs.' },
  { id:4, title:'Lesson 4 — GLTF Loader & Models', desc:'Load a GLTF model, inspect the scene graph, and add animations.' },
  { id:5, title:'Lesson 5 — Controls & Interaction', desc:'Add OrbitControls, raycasting, and simple UI interaction.' },
  { id:6, title:'Lesson 6 — Performance & Instancing', desc:'Use InstancedMesh and tips to optimize draw calls.' }
];

/* ------------------------------
   STATE
------------------------------ */

const state = {
  current: null,
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  animId: null,
  container: null
};

function $(id){ return document.getElementById(id); }

/* ------------------------------
   BUILD LESSON NAV
------------------------------ */

function buildNav(){
  const nav = $('lessonNav');
  nav.innerHTML = '';
  lessons.forEach(l=>{
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = l.title;
    btn.onclick = ()=>selectLesson(l.id);
    nav.appendChild(btn);
  });
}

/* ------------------------------
   SELECT LESSON
------------------------------ */

function selectLesson(id){
  const lesson = lessons.find(x=>x.id===id);
  state.current = lesson;
  $('lessonTitle').textContent = lesson.title;
  $('lessonDesc').textContent = lesson.desc;
  renderCodeFor(lesson.id);
  setNotes(lesson.id);
}

/* ------------------------------
   NOTES
------------------------------ */

function setNotes(id){
  const notes = $('lessonNotes');
  notes.innerHTML = '';
  const tips = {
    1: ['Keep the animation loop simple: update, then render.', 'Always set camera.aspect on resize.'],
    2: ['Use MeshStandardMaterial for PBR-like results.', 'Combine AmbientLight + DirectionalLight for base lighting.'],
    3: ['Use power-of-two textures for mipmaps.', 'Use texture.encoding = THREE.sRGBEncoding for color maps.'],
    4: ['GLTF supports materials, animations, and compression.', 'Use DRACO for large models.'],
    5: ['OrbitControls are great for exploration.', 'Use Raycaster for click/hover interactions.'],
    6: ['InstancedMesh reduces draw calls dramatically.', 'Dispose geometries and materials when removing scenes.']
  };
  (tips[id]||[]).forEach(t=>{
    const li = document.createElement('li');
    li.textContent = t;
    notes.appendChild(li);
  });
}

/* ------------------------------
   CODE SNIPPETS
------------------------------ */

function renderCodeFor(id){
  const codeEl = $('code');
  const snippets = {
    1: `// Lesson 1: basic scene\nconst scene = new THREE.Scene();\nconst camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 1000);\nconst renderer = new THREE.WebGLRenderer({antialias:true});`,
    2: `// Lesson 2: lights & materials\nconst material = new THREE.MeshStandardMaterial({color:0x2194ce});\nscene.add(new THREE.AmbientLight(0x404040));`,
    3: `// Lesson 3: textures\nconst loader = new THREE.TextureLoader();\nloader.load('texture.jpg', tex => material.map = tex);`,
    4: `// Lesson 4: GLTF\nconst gltfLoader = new GLTFLoader();\ngltfLoader.load('model.gltf', gltf => scene.add(gltf.scene));`,
    5: `// Lesson 5: interaction\nconst ray = new THREE.Raycaster();\nconst mouse = new THREE.Vector2();`,
    6: `// Lesson 6: instancing\nconst inst = new THREE.InstancedMesh(geo, mat, count);\ninst.setMatrixAt(i, matrix);`
  };
  codeEl.textContent = snippets[id] || '// Select a lesson to see code';
}

/* ------------------------------
   CLEANUP
------------------------------ */

function clearScene(){
  cancelAnimationFrame(state.animId);

  if(state.controls){
    try{ state.controls.dispose(); }catch(e){}
    state.controls = null;
  }

  if(state.renderer){
    try{ state.renderer.forceContextLoss(); }catch(e){}
    try{
      if(state.renderer.domElement && state.renderer.domElement.parentNode){
        state.renderer.domElement.parentNode.removeChild(state.renderer.domElement);
      }
    }catch(e){}
    try{ state.renderer.dispose(); }catch(e){}
    state.renderer = null;
  }

  state.scene = null;
  state.camera = null;
}

/* ------------------------------
   RENDERER CREATION
------------------------------ */

function createRenderer(container, w, h){
  const renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h);
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);
  return renderer;
}

/* ------------------------------
   LESSON 1 — BASIC SCENE
------------------------------ */

function lesson1_run(container){
  clearScene();

  const w = container.clientWidth, h = container.clientHeight;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 1000);
  const renderer = createRenderer(container, w, h);

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshStandardMaterial({color:0x2194ce})
  );
  scene.add(cube);

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5,5,5);
  scene.add(light);

  camera.position.set(0,0,3);

  function animate(){
    state.animId = requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();

  state.scene = scene;
  state.camera = camera;
  state.renderer = renderer;
}

/* ------------------------------
   LESSON 2 — LIGHTS & MATERIALS
------------------------------ */

function lesson2_run(container){
  clearScene();

  const w = container.clientWidth, h = container.clientHeight;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 1000);
  const renderer = createRenderer(container, w, h);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.9, 64, 64),
    new THREE.MeshStandardMaterial({color:0xff7a59, metalness:0.3, roughness:0.35})
  );
  scene.add(sphere);

  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const key = new THREE.DirectionalLight(0xffffff, 1);
  key.position.set(5,5,5);
  scene.add(key);

  camera.position.set(0,0,3);

  const controls = new OrbitControls(camera, renderer.domElement);

  function animate(){
    state.animId = requestAnimationFrame(animate);
    sphere.rotation.y += 0.005;
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  state.scene = scene;
  state.camera = camera;
  state.renderer = renderer;
  state.controls = controls;
}

/* ------------------------------
   LESSON 3 — TEXTURES
------------------------------ */

function lesson3_run(container){
  clearScene();

  const w = container.clientWidth, h = container.clientHeight;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 1000);
  const renderer = createRenderer(container, w, h);

  const material = new THREE.MeshStandardMaterial({color:0xffffff});
  const loader = new THREE.TextureLoader();

  loader.load('https://threejs.org/examples/textures/uv_grid_opengl.jpg', tex=>{
    tex.encoding = THREE.sRGBEncoding;
    material.map = tex;
    material.needsUpdate = true;
  });

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.6,1.6,1.6),
    material
  );
  scene.add(mesh);

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(3,3,3);
  scene.add(dir);

  camera.position.set(0,0,3);

  const controls = new OrbitControls(camera, renderer.domElement);

  function animate(){
    state.animId = requestAnimationFrame(animate);
    mesh.rotation.x += 0.006;
    mesh.rotation.y += 0.008;
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  state.scene = scene;
  state.camera = camera;
  state.renderer = renderer;
  state.controls = controls;
}

/* ------------------------------
   LESSON 4 — GLTF LOADING
------------------------------ */

function lesson4_run(container){
  clearScene();

  const w = container.clientWidth, h = container.clientHeight;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, w/h, 0.1, 1000);
  const renderer = createRenderer(container, w, h);

  const grid = new THREE.GridHelper(10, 10, 0x222222, 0x111111);
  scene.add(grid);

  const loader = new GLTFLoader();
  loader.load(
    'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
    gltf => {
      const model = gltf.scene;
      model.scale.set(2,2,2);
      scene.add(model);
    }
  );

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dir = new THREE.DirectionalLight(0xffffff, 1);
  dir.position.set(5,10,7);
  scene.add(dir);

  camera.position.set(0,1.5,5);

  const controls = new OrbitControls(camera, renderer.domElement);

  function animate(){
    state.animId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  state.scene = scene;
  state.camera = camera;
  state.renderer = renderer;
  state.controls = controls;
}

/* ------------------------------
   LESSON 5 — INTERACTION
------------------------------ */

function lesson5_run(container){
  clearScene();

  const w = container.clientWidth, h = container.clientHeight;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 1000);
  const renderer = createRenderer(container, w, h);

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshStandardMaterial({color:0x88ccff})
  );
  cube.name = 'interactiveCube';
  scene.add(cube);

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(3,3,3);
  scene.add(dir);

  camera.position.set(0,0,4);

  const controls = new OrbitControls(camera, renderer.domElement);

  const ray = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  renderer.domElement.addEventListener('click', e=>{
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    ray.setFromCamera(mouse, camera);
    const hits = ray.intersectObjects(scene.children, true);

    if(hits.length){
      const obj = hits[0].object;
      if(obj.material){
        obj.material.color.setHex(Math.random()*0xffffff);
      }
    }
  });

  function animate(){
    state.animId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  state.scene = scene;
  state.camera = camera;
  state.renderer = renderer;
  state.controls = controls;
}

/* ------------------------------
   LESSON 6 — INSTANCING
------------------------------ */

function lesson6_run(container){
  clearScene();

  const w = container.clientWidth, h = container.clientHeight;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 1000);
  const renderer = createRenderer(container, w, h);

  const count = 1000;
  const geo = new THREE.BoxGeometry(0.2,0.2,0.2);
  const mat = new THREE.MeshStandardMaterial({color:0x88ff88});
  const inst = new THREE.InstancedMesh(geo, mat, count);

  const dummy = new THREE.Object3D();
  for(let i=0;i<count;i++){
    dummy.position.set(
      (Math.random()-0.5)*40,
      (Math.random()-0.5)*40,
      (Math.random()-0.5)*40
    );
    dummy.updateMatrix();
    inst.setMatrixAt(i, dummy.matrix);
  }

  scene.add(inst);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5,10,7);
  scene.add(dir);

  camera.position.set(0,0,60);

  const controls = new OrbitControls(camera, renderer.domElement);

  function animate(){
    state.animId = requestAnimationFrame(animate);
    inst.rotation.y += 0.001;
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  state.scene = scene;
  state.camera = camera;
  state.renderer = renderer;
  state.controls = controls;
}

/* ------------------------------
   RUN / RESET
------------------------------ */

function runCurrentLesson(){
  const container = $('canvas-wrap');
  if(!state.current) return;

  const id = state.current.id;
  const size = $('canvasSize').value;

  if(size !== 'auto'){
    const [w,h] = size.split('x').map(Number);
    container.style.width = w + 'px';
    container.style.height = h + 'px';
  } else {
    container.style.width = '';
    container.style.height = '';
  }

  if(id===1) lesson1_run(container);
  if(id===2) lesson2_run(container);
  if(id===3) lesson3_run(container);
  if(id===4) lesson4_run(container);
  if(id===5) lesson5_run(container);
  if(id===6) lesson6_run(container);
}

function resetCanvas(){
  clearScene();
  const wrap = $('canvas-wrap');
  wrap.innerHTML = '<div class="canvas-overlay-note">Canvas</div>';
  wrap.style.width = '';
  wrap.style.height = '';
}

/* ------------------------------
   UI WIRING
------------------------------ */

function wireUI(){
  buildNav();

  $('runBtn').addEventListener('click', runCurrentLesson);
  $('resetBtn').addEventListener('click', resetCanvas);

  $('copyCode').addEventListener('click', ()=>{
    navigator.clipboard.writeText($('code').textContent)
      .then(()=>alert('Code copied'))
      .catch(()=>alert('Copy failed'));
  });

  $('toggleCode').addEventListener('click', ()=>{
    const el = $('code');
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  });

  selectLesson(1);
}

/* ------------------------------
   INIT
------------------------------ */

window.addEventListener('DOMContentLoaded', ()=>{
  state.container = $('canvas-wrap');
  wireUI();
});
