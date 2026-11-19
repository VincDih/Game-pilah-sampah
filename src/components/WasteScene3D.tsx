import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { SceneLocation, WasteCategory } from '../data/wasteItems';
import {
  CatTeacherHandle,
  createCatTeacher3D,
  createCenterPedestal,
  createEnvironment3D,
  createTeacherDesk3D,
  createWasteBin3D,
  createWasteItem3D,
  WasteBinHandle,
} from '../three/models';
import { createContactShadowTexture } from '../three/textures';

export interface ActiveThrowEffect {
  id: number;
  targetCategory: WasteCategory;
  isCorrect: boolean;
}

interface WasteScene3DProps {
  location: SceneLocation;
  activeItemId: string | null;
  isPlaying: boolean;
  canInteract: boolean;
  catMood: 'welcome' | 'thinking' | 'cheering' | 'combo' | 'encouraging' | 'proud';
  catMessage: string;
  showCatBubble: boolean;
  throwEffect: ActiveThrowEffect | null;
  highlightCorrectBin: WasteCategory | null;
  onBinClick: (category: WasteCategory) => void;
}

// Pre-allocated math helpers outside the render loop (Zero GC)
const _pointer = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();
const _throwStart = new THREE.Vector3(0, 1.35, 0.4);
const _throwEnd = new THREE.Vector3();
const _bubbleVec = new THREE.Vector3();

function disposeObjectTree(root: THREE.Object3D) {
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      mesh.geometry?.dispose();
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (!m) return;
        const std = m as THREE.MeshStandardMaterial;
        std.map?.dispose();
        m.dispose();
      });
    }
  });
}

export const WasteScene3D: React.FC<WasteScene3DProps> = ({
  location,
  activeItemId,
  isPlaying,
  canInteract,
  catMood,
  catMessage,
  showCatBubble,
  throwEffect,
  highlightCorrectBin,
  onBinClick,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const [contextLost, setContextLost] = useState(false);

  // Mutable bridge refs so React state updates never recreate the WebGL context
  const propsRef = useRef({
    location,
    activeItemId,
    isPlaying,
    canInteract,
    catMood,
    throwEffect,
    highlightCorrectBin,
    onBinClick,
  });
  propsRef.current = {
    location,
    activeItemId,
    isPlaying,
    canInteract,
    catMood,
    throwEffect,
    highlightCorrectBin,
    onBinClick,
  };

  const sceneSyncRef = useRef<{
    setLocation?: (loc: SceneLocation) => void;
    setItem?: (itemId: string | null) => void;
    triggerThrow?: (effect: ActiveThrowEffect) => void;
  }>({});

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL probe (renderer string only, never UA)
    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const initW = Math.max(container.clientWidth, 320);
    const initH = Math.max(container.clientHeight, 240);
    renderer.setSize(initW, initH);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'manipulation';
    container.appendChild(renderer.domElement);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    const scene = new THREE.Scene();

    // Studio environment reflection via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(44, initW / initH, 0.1, 80);

    const updateCameraFraming = (w: number, h: number) => {
      const aspect = w / Math.max(h, 1);
      camera.aspect = aspect;
      // Pull back gracefully on narrower portrait screens so all 3 bins & Guru Kucing stay visible
      if (aspect < 1.05) {
        camera.fov = 56;
        camera.position.set(0, 3.6, 7.6);
        camera.lookAt(0, 1.0, -0.8);
      } else if (aspect < 1.45) {
        camera.fov = 48;
        camera.position.set(0, 3.15, 6.45);
        camera.lookAt(0, 1.05, -0.9);
      } else {
        camera.fov = 42;
        camera.position.set(0, 2.95, 5.95);
        camera.lookAt(0, 1.08, -1.0);
      }
      camera.updateProjectionMatrix();
    };
    updateCameraFraming(initW, initH);

    // 3-Point Warm/Cool Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0xfef3c7, 0.95);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.65);
    keyLight.position.set(4.5, 8.5, 5.5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -7;
    keyLight.shadow.camera.right = 7;
    keyLight.shadow.camera.top = 7;
    keyLight.shadow.camera.bottom = -7;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xbae6fd, 0.65);
    rimLight.position.set(-5, 4, -5);
    scene.add(rimLight);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const shadowTex = createContactShadowTexture();

    // Environment Container + Center Sorting Pedestal (for gameplay)
    let envGroup: THREE.Group | null = null;
    let centerPedestalGroup: THREE.Group | null = null;
    const applyEnvironment = (loc: SceneLocation) => {
      if (envGroup) {
        scene.remove(envGroup);
        disposeObjectTree(envGroup);
      }
      if (centerPedestalGroup) {
        scene.remove(centerPedestalGroup);
        disposeObjectTree(centerPedestalGroup);
      }
      const built = createEnvironment3D(loc, maxAniso);
      envGroup = built.group;
      scene.add(envGroup);

      const pedestalHex = loc === 'rumah' ? 0x9a3412 : 0xb45309;
      centerPedestalGroup = createCenterPedestal(pedestalHex);
      centerPedestalGroup.visible = propsRef.current.isPlaying;
      scene.add(centerPedestalGroup);

      scene.background = new THREE.Color(built.skyHex);
      scene.fog = new THREE.FogExp2(built.skyHex, built.fogDensity);
    };
    applyEnvironment(propsRef.current.location);

    // Teacher's Desk & Chair (shown before gameplay starts so Guru Kucing sits at Meja Guru)
    const teacherDeskGroup = createTeacherDesk3D(shadowTex);
    teacherDeskGroup.visible = !propsRef.current.isPlaying;
    scene.add(teacherDeskGroup);

    // 3 Interactive Waste Bins (Organik Left, Anorganik Center, B3 Right — only appear when playing!)
    const binOrder: WasteCategory[] = ['organik', 'anorganik', 'b3'];
    const binXPositions: Record<WasteCategory, number> = {
      organik: -2.05,
      anorganik: 0,
      b3: 2.05,
    };
    const binZPositions: Record<WasteCategory, number> = {
      organik: -1.65,
      anorganik: -1.95,
      b3: -1.65,
    };

    const bins: Record<WasteCategory, WasteBinHandle> = {
      organik: createWasteBin3D('organik', maxAniso, shadowTex),
      anorganik: createWasteBin3D('anorganik', maxAniso, shadowTex),
      b3: createWasteBin3D('b3', maxAniso, shadowTex),
    };
    const hitMeshes: THREE.Mesh[] = [];

    binOrder.forEach((cat) => {
      const b = bins[cat];
      b.basePosition.set(binXPositions[cat], 0, binZPositions[cat]);
      b.group.position.copy(b.basePosition);
      // Slight inward toe-in toward camera for friendly stage framing
      b.group.rotation.y = cat === 'organik' ? 0.16 : cat === 'b3' ? -0.16 : 0;
      b.group.visible = propsRef.current.isPlaying;
      b.group.scale.setScalar(propsRef.current.isPlaying ? 1 : 0.001);
      scene.add(b.group);
      hitMeshes.push(b.hitMesh);
    });

    // 3D Guru Kucing Companion (Sits at Meja Guru before playing, stands left during gameplay)
    const catTeacher: CatTeacherHandle = createCatTeacher3D(shadowTex);
    const seatedPos = new THREE.Vector3(0, 0.36, -0.93);
    const standingPos = new THREE.Vector3(-2.35, 0, 0.35);
    catTeacher.basePosition.copy(propsRef.current.isPlaying ? standingPos : seatedPos);
    catTeacher.group.position.copy(catTeacher.basePosition);
    catTeacher.group.rotation.y = propsRef.current.isPlaying ? 0.48 : 0;
    catTeacher.shadowMesh.visible = propsRef.current.isPlaying;
    scene.add(catTeacher.group);

    // Active 3D Waste Item floating on the center desk
    const itemAnchor = new THREE.Group();
    itemAnchor.position.set(0, 1.32, 0.4);
    scene.add(itemAnchor);

    let currentItemGroup: THREE.Group | null = null;
    const applyActiveItem = (itemId: string | null) => {
      if (currentItemGroup) {
        itemAnchor.remove(currentItemGroup);
        disposeObjectTree(currentItemGroup);
        currentItemGroup = null;
      }
      if (itemId) {
        currentItemGroup = createWasteItem3D(itemId);
        currentItemGroup.scale.setScalar(1.22);
        itemAnchor.add(currentItemGroup);
      }
    };
    applyActiveItem(propsRef.current.activeItemId);

    // 3D Celebration Star Particles (pooled meshes, zero runtime alloc)
    const burstParticles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];
    const burstGeom = new THREE.OctahedronGeometry(0.08, 0);
    const burstColors = [0x22c55e, 0xfacc15, 0x38bdf8, 0xfb923c];
    for (let i = 0; i < 16; i += 1) {
      const pMesh = new THREE.Mesh(
        burstGeom,
        new THREE.MeshStandardMaterial({
          color: burstColors[i % burstColors.length],
          roughness: 0.3,
          metalness: 0.2,
        }),
      );
      pMesh.visible = false;
      scene.add(pMesh);
      burstParticles.push({
        mesh: pMesh,
        vel: new THREE.Vector3(),
        life: 0,
      });
    }

    const spawnBurst = (origin: THREE.Vector3) => {
      burstParticles.forEach((p, idx) => {
        p.mesh.position.copy(origin);
        p.mesh.position.y += 1.3;
        p.mesh.visible = true;
        const ang = (idx / burstParticles.length) * Math.PI * 2;
        const speed = 1.6 + (idx % 3) * 0.55;
        p.vel.set(Math.cos(ang) * speed, 2.8 + (idx % 4) * 0.45, Math.sin(ang) * speed);
        p.life = 0.85;
      });
    };

    // Throw flight state
    let throwState: {
      active: boolean;
      elapsed: number;
      duration: number;
      target: WasteCategory;
      isCorrect: boolean;
    } = {
      active: false,
      elapsed: 0,
      duration: 0.42,
      target: 'organik',
      isCorrect: true,
    };

    sceneSyncRef.current.setLocation = applyEnvironment;
    sceneSyncRef.current.setItem = applyActiveItem;
    sceneSyncRef.current.triggerThrow = (effect: ActiveThrowEffect) => {
      throwState = {
        active: true,
        elapsed: 0,
        duration: 0.42,
        target: effect.targetCategory,
        isCorrect: effect.isCorrect,
      };
      const bin = bins[effect.targetCategory];
      if (effect.isCorrect) {
        bin.bouncePhase = 1;
        spawnBurst(bin.basePosition);
      } else {
        bin.shakePhase = 1;
      }
    };

    // Raycasting on Layer 1 for direct 3D bin click/hover
    let hoveredBin: WasteCategory | null = null;
    _raycaster.layers.set(1);

    const updatePointerFromClient = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      _pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    let lastMoveCheck = 0;
    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastMoveCheck < 50) return;
      lastMoveCheck = now;

      if (!propsRef.current.canInteract || !propsRef.current.isPlaying) {
        if (hoveredBin) {
          hoveredBin = null;
          renderer.domElement.style.cursor = 'default';
        }
        return;
      }

      updatePointerFromClient(e.clientX, e.clientY);
      _raycaster.setFromCamera(_pointer, camera);
      const hits = _raycaster.intersectObjects(hitMeshes, false);
      if (hits.length > 0) {
        hoveredBin = hits[0].object.userData.category as WasteCategory;
        renderer.domElement.style.cursor = 'pointer';
      } else {
        hoveredBin = null;
        renderer.domElement.style.cursor = 'default';
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!propsRef.current.canInteract || !propsRef.current.isPlaying) return;
      updatePointerFromClient(e.clientX, e.clientY);
      _raycaster.setFromCamera(_pointer, camera);
      const hits = _raycaster.intersectObjects(hitMeshes, false);
      if (hits.length > 0) {
        const cat = hits[0].object.userData.category as WasteCategory;
        propsRef.current.onBinClick(cat);
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    // ResizeObserver
    const resizeObs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          updateCameraFraming(width, height);
          renderer.setSize(width, height);
        }
      }
    });
    resizeObs.observe(container);

    // Pre-compile shaders on hardware GPUs
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Animation loop with Software-WebGL afterDraw pacing
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const poll = () => {
        if (disposed) return;
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    let playTransition = propsRef.current.isPlaying ? 1 : 0;

    const tick = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.08);
      const elapsed = clock.getElapsedTime();
      const { isPlaying: playingNow, canInteract: interactNow, catMood: moodNow, highlightCorrectBin: correctHighlight } =
        propsRef.current;

      // Smoothly transition between Intro (Teacher Desk + Seated Cat, NO Bins) and Active Play (Bins + Pedestal + Standing Cat)
      playTransition = THREE.MathUtils.damp(playTransition, playingNow ? 1 : 0, 8, delta);
      const showBins = playTransition > 0.03;
      const showTeacherDesk = playTransition < 0.97;

      teacherDeskGroup.visible = showTeacherDesk;
      if (showTeacherDesk) {
        const deskScale = Math.max(0.01, 1 - playTransition);
        teacherDeskGroup.scale.setScalar(deskScale);
      }

      if (centerPedestalGroup) {
        centerPedestalGroup.visible = showBins;
        if (showBins) {
          centerPedestalGroup.scale.setScalar(Math.max(0.01, playTransition));
        }
      }

      // Animate Bins (pop-in scale, lid opening via damping, bounce, shake)
      binOrder.forEach((cat) => {
        const bin = bins[cat];
        bin.group.visible = showBins;
        if (!showBins) return;

        const shouldOpen =
          (interactNow && hoveredBin === cat) ||
          (throwState.active && throwState.target === cat) ||
          correctHighlight === cat;
        bin.targetLidAngle = shouldOpen ? -0.95 : 0;
        bin.lidPivot.rotation.x = THREE.MathUtils.damp(
          bin.lidPivot.rotation.x,
          bin.targetLidAngle,
          12,
          delta,
        );

        const baseScale = Math.max(0.01, playTransition);

        // Bounce celebration
        if (bin.bouncePhase > 0) {
          bin.bouncePhase = Math.max(0, bin.bouncePhase - delta * 2.1);
          const s = 1 + Math.sin(bin.bouncePhase * Math.PI) * 0.12;
          bin.group.scale.set(baseScale * s, baseScale * (2 - s * 0.92), baseScale * s);
          bin.group.position.y = Math.sin(bin.bouncePhase * Math.PI) * 0.22;
        } else {
          bin.group.scale.setScalar(baseScale);
          bin.group.position.y = 0;
        }

        // Shake on wrong
        if (bin.shakePhase > 0) {
          bin.shakePhase = Math.max(0, bin.shakePhase - delta * 2.4);
          bin.group.position.x =
            bin.basePosition.x + Math.sin(bin.shakePhase * Math.PI * 6) * 0.14 * bin.shakePhase;
        } else {
          bin.group.position.x = bin.basePosition.x;
        }
      });

      // Animate Active Waste Item (gentle float + spin OR parabolic throw arc into bin)
      if (currentItemGroup) {
        if (throwState.active) {
          throwState.elapsed += delta;
          const t = Math.min(throwState.elapsed / throwState.duration, 1);
          const targetBin = bins[throwState.target];
          _throwEnd.set(targetBin.basePosition.x, 1.15, targetBin.basePosition.z);

          itemAnchor.position.lerpVectors(_throwStart, _throwEnd, t);
          itemAnchor.position.y += Math.sin(t * Math.PI) * 1.15;
          const shrink = Math.max(0.2, 1 - t * 0.72);
          itemAnchor.scale.setScalar(shrink);
          currentItemGroup.rotation.y += delta * 10;

          if (t >= 1) {
            throwState.active = false;
            itemAnchor.visible = false;
          }
        } else if (playingNow && interactNow) {
          itemAnchor.visible = true;
          itemAnchor.scale.setScalar(1);
          itemAnchor.position.set(0, 1.32 + Math.sin(elapsed * 2.4) * 0.08, 0.4);
          currentItemGroup.rotation.y = elapsed * 0.85;
        } else {
          itemAnchor.visible = false;
        }
      }

      // Animate Guru Kucing Companion + Funny 3D Expressions
      const isCombo = moodNow === 'combo';
      const isCheering = moodNow === 'cheering' || moodNow === 'proud' || isCombo;
      const isEncouraging = moodNow === 'encouraging';

      // Swap visible 3D expression groups
      catTeacher.normalEyesGroup.visible = !isCheering && !isEncouraging;
      catTeacher.happyEyesGroup.visible = (moodNow === 'cheering' || moodNow === 'proud');
      catTeacher.starEyesGroup.visible = isCombo;
      catTeacher.oopsEyesGroup.visible = isEncouraging;

      catTeacher.smileMouthGroup.visible = !isCheering && !isEncouraging;
      catTeacher.openMouthGroup.visible = isCheering;
      catTeacher.oopsMouthGroup.visible = isEncouraging;

      // Smoothly position Guru Kucing: seated at Meja Guru before play, standing beside desk during play
      catTeacher.basePosition.lerpVectors(seatedPos, standingPos, playTransition);
      catTeacher.group.position.x = catTeacher.basePosition.x;
      catTeacher.group.position.z = catTeacher.basePosition.z;
      catTeacher.group.rotation.y = THREE.MathUtils.lerp(0, 0.48, playTransition);
      catTeacher.shadowMesh.visible = playTransition > 0.65;

      const jump = playingNow && isCheering
        ? Math.abs(Math.sin(elapsed * 7.2)) * 0.18
        : Math.sin(elapsed * 2) * 0.022;
      catTeacher.group.position.y = catTeacher.basePosition.y + jump;
      catTeacher.headGroup.rotation.z = isEncouraging
        ? Math.sin(elapsed * 4.5) * 0.15
        : isCheering
          ? Math.sin(elapsed * 6) * 0.1
          : Math.sin(elapsed * 1.8) * 0.06;

      // Playful ear wiggles
      const earWiggle = isCheering ? Math.sin(elapsed * 11) * 0.18 : Math.sin(elapsed * 3.4) * 0.06;
      catTeacher.leftEarGroup.rotation.z = earWiggle;
      catTeacher.rightEarGroup.rotation.z = -earWiggle;

      // Spin star eyes slightly on combo
      if (isCombo) {
        catTeacher.starEyesGroup.children.forEach((star) => {
          star.rotation.z = elapsed * 4;
        });
      }

      catTeacher.pawGroup.rotation.z = isCheering
        ? Math.sin(elapsed * 10) * 0.42
        : Math.sin(elapsed * 3.2) * 0.18;
      catTeacher.tailGroup.rotation.y = Math.sin(elapsed * 3.8) * 0.28;

      // Update 3D burst particles
      burstParticles.forEach((p) => {
        if (p.life > 0) {
          p.life -= delta;
          p.vel.y -= delta * 6.5;
          p.mesh.position.addScaledVector(p.vel, delta);
          p.mesh.rotation.x += delta * 6;
          p.mesh.rotation.y += delta * 6;
          const s = Math.max(0.01, p.life);
          p.mesh.scale.setScalar(s);
          if (p.life <= 0) {
            p.mesh.visible = false;
          }
        }
      });

      renderer.render(scene, camera);

      // Project Guru Kucing's speech bubble anchor directly to screen coordinates
      if (bubbleRef.current && container) {
        catTeacher.group.updateMatrixWorld(true);
        catTeacher.bubbleAnchor.getWorldPosition(_bubbleVec);
        _bubbleVec.project(camera);
        const w = container.clientWidth;
        const h = container.clientHeight;
        const rawX = (_bubbleVec.x * 0.5 + 0.5) * w;
        const rawY = (-_bubbleVec.y * 0.5 + 0.5) * h;
        const clampedX = Math.max(145, Math.min(w - 145, rawX));
        const clampedY = Math.max(145, Math.min(h - 190, rawY));
        bubbleRef.current.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0) translate(-50%, -100%)`;
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObs.disconnect();
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      disposeObjectTree(scene);
      envTex.dispose();
      shadowTex.dispose();
      burstGeom.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Sync Location changes without remounting WebGL
  useEffect(() => {
    sceneSyncRef.current.setLocation?.(location);
  }, [location]);

  // Sync Active Waste Item changes without remounting WebGL
  useEffect(() => {
    sceneSyncRef.current.setItem?.(activeItemId);
  }, [activeItemId]);

  // Trigger 3D Throw effect
  useEffect(() => {
    if (throwEffect) {
      sceneSyncRef.current.triggerThrow?.(throwEffect);
    }
  }, [throwEffect]);

  const bubbleTone = {
    welcome: 'border-amber-400 bg-white text-slate-900',
    thinking: 'border-sky-400 bg-white text-slate-900',
    cheering: 'border-emerald-500 bg-emerald-50 text-emerald-950',
    combo: 'border-orange-500 bg-orange-50 text-orange-950',
    encouraging: 'border-amber-500 bg-amber-50 text-slate-900',
    proud: 'border-emerald-500 bg-emerald-50 text-emerald-950',
  }[catMood];

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={mountRef} className="h-full w-full" />

      {/* Floating Comic Speech Bubble anchored directly above the 3D Guru Kucing model */}
      {showCatBubble && catMessage && (
        <div
          ref={bubbleRef}
          className="pointer-events-none absolute left-0 top-0 z-10 w-[230px] sm:w-[270px]"
          style={{ willChange: 'transform' }}
        >
          <div
            className={`relative rounded-2xl border-2 px-3.5 py-2.5 shadow-md ${bubbleTone}`}
          >
            <div className="font-display text-xs font-bold text-amber-700">
              Mr.Meow
            </div>
            <p className="mt-0.5 text-xs font-bold leading-snug sm:text-sm">
              “{catMessage}”
            </p>
            {/* Speech Bubble Pointer Tail */}
            <div
              className={`absolute -bottom-2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-b-2 border-r-2 ${bubbleTone}`}
              style={{ borderTopColor: 'transparent', borderLeftColor: 'transparent' }}
            />
          </div>
        </div>
      )}

      {contextLost && (
        <div className="absolute inset-0 flex items-center justify-center bg-amber-50 p-6 text-center">
          <div className="rounded-2xl border-2 border-amber-300 bg-white p-6 shadow-sm">
            <p className="font-display text-lg font-bold text-slate-900">
              Tampilan 3D sedang dimuat ulang...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
