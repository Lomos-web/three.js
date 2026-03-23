// lessons.js
// ES module for Three.js Academy
// Save this file as lessons.js in the same folder as the HTML from Part 1.

import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.158.0/examples/jsm/loaders/GLTFLoader.js';

const lessons = [
  { id:1, title:'Lesson 1 — Basic Scene & Spinning Cube', desc:'Create a scene, camera, renderer, add a cube and animate it.' },
  { id:2, title:'Lesson 2 — Lights & Materials', desc:'Add lights and use MeshStandardMaterial for realistic shading.' },
  { id:3, title:'Lesson 3 — Textures & UVs', desc:'Load textures, apply maps, and understand UVs.' },
  { id:4, title:'Lesson 4 — GLTF Loader & Models', desc:'Load a GLTF model, inspect the scene graph, and add animations.' },
  { id:5, title:'Lesson 5 — Controls & Interaction', desc:'Add OrbitControls, raycasting, and simple UI interaction.' },
  { id:6, title:'Lesson 6 — Performance & Instancing', desc:'Use InstancedMesh and tips to optimize draw calls.' }
];

const APP_PIN = '1111';

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

function selectLesson(id){
  const lesson = lessons.find(x=>x.id===id);
  state.current = lesson;
  $('lessonTitle').textContent = lesson.title;
  $('lessonDesc').textContent = lesson.desc;
  renderCodeFor(lesson.id);
  setNotes(lesson.id);
}

function setNotes(id){
  const notes = $('lessonNotes');
  notes.innerHTML = '';
  const tips = {
    1: ['Keep the animation loop simple: update, then render.', 'Always set camera.aspect on resize.'],
    2: ['Use MeshStandardMaterial for PBR-like results.', 'Combine AmbientLight + DirectionalLight for base lighting.'],
    3: ['Use power-of-two textures for mipmaps.', 'Use texture.encoding = THREE.sRGBEncoding for color maps.'],
    4: ['GLTF is the recommended modern format; it supports materials and animations.', 'Use DRACO compression for large models.'],
    5: ['OrbitControls are great for exploration; disable when building game controls.', 'Use Raycaster for click/hover interactions.'],
    6: ['InstancedMesh reduces draw calls dramatically.', 'Dispose geometries, materials, and textures when removing scenes.']
  };
  (tips[id]||[]).forEach(t=>{
    const li = document.createElement('li'); li.textContent = t; notes.appendChild(li);
  });
}

function renderCodeFor(id){
  const codeEl = $('code');
  const snippets = {
    1: `// Lesson 1: basic scene\nconst scene = new THREE.Scene();\nconst camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 1000);\nconst renderer = new THREE.WebGLRenderer({antialias:true});\n// ... create cube, add light, animate`,
    2: `// Lesson 2: lights & materials\nconst material = new THREE.MeshStandardMaterial({color:0x2194ce, metalness:0.2, roughness:0.4});\nscene.add(new THREE.AmbientLight(0x404040, 0.6));\nconst dir = new THREE.DirectionalLight(0xffffff, 1); dir.position.set(5,5,5); scene.add(dir);`,
    3: `// Lesson 3: textures\nconst loader = new THREE.TextureLoader();\nloader.load('textures/wood.jpg', tex => { tex.encoding = THREE.sRGBEncoding; material.map = tex; material.needsUpdate = true; });`,
    4: `// Lesson 4: GLTF\nconst gltfLoader = new GLTFLoader();\ngltfLoader.load('models/scene.gltf', gltf => { scene.add(gltf.scene); });`,
    5: `// Lesson 5: controls & raycast\nconst controls = new OrbitControls(camera, renderer.domElement);\nconst ray = new THREE.Raycaster();\n// on click: ray.setFromCamera(mouse, camera); const hits = ray.intersectObjects(scene.children, true);`,
    6: `// Lesson 6: instancing\nconst geometry = new THREE.BoxGeometry(1,1,1);\nconst material = new THREE.MeshStandardMaterial({color:0x88ccff});\nconst count = 500;\nconst inst = new THREE.InstancedMesh(geometry, material, count);\nfor(let i=0;i<count;i++){ const m = new THREE.Matrix4(); m.setPosition((Math.random()-0.5)*50, (Math.random()-0.5)*50, (Math.random()-0.5)*50); inst.setMatrixAt(i,m); }\nscene.add(inst);`
  };
  codeEl.textContent = snippets[id] || '// Select a lesson to see code';
}

/* ---------- Renderer & cleanup helpers ---------- */

function clearScene(){
  cancelAnimationFrame(state.animId);
  if(state.controls){ try{ state.controls.dispose(); }catch(e){} state.controls = null; }
  if(state.renderer){
    try { state.renderer.forceContextLoss(); } catch(e){}
    try {
      if(state.renderer.domElement && state.renderer.domElement.parentNode){
        state.renderer.domElement.parentNode.removeChild(state.renderer.domElement);
      }
    } catch(e){}
    try { state.renderer.dispose(); } catch(e){}
    state.renderer = null;
  }
  state.scene = null;
  state.camera = null;
}

function createRenderer(container, w, h){
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h);
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);
  return renderer;
}

/* ---------- Lessons implementations (1..6) ---------- */

function lesson1_run(container){
  clearScene();
  const w = container.clientWidth || 800, h = container.clientHeight || 600;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 1000);
  const renderer = createRenderer(container, w, h);

  // Basic geometry + material
  const geometry = new THREE.BoxGeometry(1,1,1);
  const material = new THREE.MeshStandardMaterial({color:0x2194ce});
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Ground plane for context
  const planeGeo = new THREE.PlaneGeometry(10,10);
  const planeMat = new THREE.MeshStandardMaterial({color:0x0b0b0d, roughness:1, metalness:0});
  const plane = new THREE.Mesh(planeGeo, planeMat);
  plane.rotation.x = -Math.PI/2;
  plane.position.y = -1.1;
  scene.add(plane);

  // Light
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5,5,5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));

  camera.position.set(0,0,3);

  // Resize handling
  function onResize(){
    const W = container.clientWidth || 800, H = container.clientHeight || 600;
    camera.aspect = W/H; camera.updateProjectionMatrix();
    renderer.setSize(W,H);
  }
  window.addEventListener('resize', onResize);

  // Simple animation loop
  function animate(){
    state.animId = requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();

  state.scene = scene; state.camera = camera; state.renderer = renderer;
}

function lesson2_run(container){
  clearScene();
  const w = container.clientWidth || 800, h = container.clientHeight || 600;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0b0d);
  const camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 1000);
  const renderer = createRenderer(container, w, h);

  // Geometry with PBR material
  const geo = new THREE.SphereGeometry(0.9, 64, 64);
  const mat = new THREE.MeshStandardMaterial({color:0xff7a59, metalness:0.3, roughness:0.35});
  const sphere = new THREE.Mesh(geo, mat);
  scene.add(sphere);

  // Lights: ambient + key + rim
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(5,5,5);
  scene.add(key);
  const rim = new THREE.PointLight(0x60a5fa, 0.6);
  rim.position.set(-4,2,3);
  scene.add(rim);

  camera.position.set(0,0,3);

  // Orbit controls for exploration
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  function animate(){
    state.animId = requestAnimationFrame(animate);
    sphere.rotation.y += 0.005;
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  state.scene = scene; state.camera = camera; state.renderer = renderer; state.controls = controls;
}

function lesson3_run(container){
  clearScene();
  const w = container.clientWidth || 800, h = container.clientHeight || 600;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 1000);
  const renderer = createRenderer(container, w, h);

  // Texture demo: UV grid applied to a box
  const loader = new THREE.TextureLoader();
  const material = new THREE.MeshStandardMaterial({color:0xffffff});
  loader.load('https://threejs.org/examples/textures/uv_grid_opengl.jpg', tex=>{
    tex.encoding = THREE.sRGBEncoding;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    material.map = tex;
    material.needsUpdate = true;
  });

  const geo = new THREE.BoxGeometry(1.6,1.6,1.6);
  const mesh = new THREE.Mesh(geo, material);
  scene.add(mesh);

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const dir = new THREE.DirectionalLight(0xffffff, 0.8); dir.position.set(3,3,3); scene.add(dir);

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

  state.scene = scene; state.camera = camera; state.renderer = renderer; state.controls = controls;
}

function lesson4_run(container){
  clearScene();
  const w = container.clientWidth || 800, h = container.clientHeight || 600;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, w/h, 0.1, 1000);
  const renderer = createRenderer(container, w, h);

  // Grid for reference
  const grid = new THREE.GridHelper(10, 10, 0x222222, 0x111111);
  scene.add(grid);

  // GLTF loader demo (public example model)
  const loader = new GLTFLoader();
  const modelUrl = 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf';
  loader.load(modelUrl, gltf=>{
    const model = gltf.scene;
    model.scale.set(2,2,2);
    model.position.set(0,0,0);
    scene.add(model);
  }, undefined, err=>{
    console.warn('GLTF load error', err);
  });

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dir = new THREE.DirectionalLight(0xffffff, 1); dir.position.set(5,10,7); scene.add(dir);

  camera.position.set(0,1.5,5);
  const controls = new OrbitControls(camera, renderer.domElement);

  function animate(){
    state.animId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  state.scene = scene; state.camera = camera; state.renderer = renderer; state.controls = controls;
}

function lesson5_run(container){
  clearScene();
  const w = container.clientWidth || 800, h = container.clientHeight || 600;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 1000);
  const renderer = createRenderer(container, w, h);

  // Interactive cube
  const geo = new THREE.BoxGeometry(1,1,1);
  const mat = new THREE.MeshStandardMaterial({color:0x88ccff});
  const cube = new THREE.Mesh(geo, mat);
  cube.name = 'interactiveCube';
  scene.add(cube);

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const dir = new THREE.DirectionalLight(0xffffff, 0.8); dir.position.set(3,3,3); scene.add(dir);

  camera.position.set(0,0,4);
  const controls = new OrbitControls(camera, renderer.domElement);

  // Raycasting for click interaction
  const ray = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onClick(e){
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    ray.setFromCamera(mouse, camera);
    const hits = ray.intersectObjects(scene.children, true);
    if(hits.length){
      const obj = hits[0].object;
      if(obj.material) obj.material.color.setHex(Math.random()*0xffffff);
    }
  }
  renderer.domElement.addEventListener('click', onClick);

  function animate(){
    state.animId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  state.scene = scene; state.camera = camera; state.renderer = renderer; state.controls = controls;
}

function lesson6_run(container){
  clearScene();
  const w = container.clientWidth || 800, h = container.clientHeight || 600;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 1000);
  const renderer = createRenderer(container, w, h);

  // InstancedMesh demo
  const count = 1000;
  const geo = new THREE.BoxGeometry(0.2,0.2,0.2);
  const mat = new THREE.MeshStandardMaterial({color:0x88ff88});
  const inst = new THREE.InstancedMesh(geo, mat, count);
  const dummy = new THREE.Object3D();
  for(let i=0;i<count;i++){
    dummy.position.set((Math.random()-0.5)*40, (Math.random()-0.5)*40, (Math.random()-0.5)*40);
    dummy.updateMatrix();
    inst.setMatrixAt(i, dummy.matrix);
  }
  scene.add(inst);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dir = new THREE.DirectionalLight(0xffffff, 0.8); dir.position.set(5,10,7); scene.add(dir);

  camera.position.set(0,0,60);
  const controls = new OrbitControls(camera, renderer.domElement);

  function animate(){
    state.animId = requestAnimationFrame(animate);
    // rotate the whole instanced mesh by updating a parent transform
    inst.rotation && (inst.rotation.y += 0.001);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  state.scene = scene; state.camera = camera; state.renderer = renderer; state.controls = controls;
}

/* ---------- Run / Reset / UI ---------- */

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

/* ---------- PIN logic & UI locking ---------- */

function setLocked(locked){
  const runBtn = $('runBtn');
  const resetBtn = $('resetBtn');
  const unlockBtn = $('unlockBtn');
  const pinInput = $('pinInput');
  const attributionEl = document.getElementById('attribution');

  runBtn.disabled = locked;
  resetBtn.disabled = locked;
  pinInput.disabled = !locked ? true : false;
  unlockBtn.textContent = locked ? 'Unlock' : 'Locked';
  unlockBtn.setAttribute('aria-pressed', String(!locked));
  if(!locked){
    attributionEl.classList.add('unlocked');
    attributionEl.setAttribute('aria-hidden', 'false');
  } else {
    attributionEl.classList.remove('unlocked');
    attributionEl.setAttribute('aria-hidden', 'true');
  }
}

function unlockWithPin(){
  const pin = $('pinInput').value.trim();
  if(pin === APP_PIN){
    setLocked(false);
    $('pinInput').value = '';
    const notes = $('lessonNotes');
    const li = document.createElement('li');
    li.textContent = 'This learning site was created by AI for Lomos tech to learn Three.js.';
    if(!Array.from(notes.children).some(n=>n.textContent === li.textContent)){
      notes.insertBefore(li, notes.firstChild);
    }
    const attributionEl = document.getElementById('attribution');
    attributionEl.classList.add('unlocked');
    alert('Unlocked. You can now run lessons.');
  } else {
    // subtle feedback without exposing the PIN
    alert('Incorrect PIN.');
  }
}

/* ---------- Wire UI ---------- */

function wireUI(){
  buildNav();
  $('runBtn').addEventListener('click', runCurrentLesson);
  $('resetBtn').addEventListener('click', resetCanvas);
  $('copyCode').addEventListener('click', ()=>{
    navigator.clipboard.writeText($('code').textContent).then(()=>{ alert('Code copied'); }).catch(()=>{ alert('Copy failed'); });
  });
  $('toggleCode').addEventListener('click', ()=>{
    const el = $('code');
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  });

  $('unlockBtn').addEventListener('click', unlockWithPin);
  $('pinInput').addEventListener('keydown', (e)=>{
    if(e.key === 'Enter') unlockWithPin();
  });

  // default select lesson 1
  selectLesson(1);

  // start locked
  setLocked(true);
}

/* ---------- Initialize ---------- */

window.addEventListener('DOMContentLoaded', ()=>{
  state.container = $('canvas-wrap');
  wireUI();
});
