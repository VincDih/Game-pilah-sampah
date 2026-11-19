import * as THREE from 'three';
import { SceneLocation, WasteCategory } from '../data/wasteItems';
import {
  createBinLabelTexture,
  createChalkboardTexture,
  createClockFaceTexture,
  createGrassTexture,
  createRugPatternTexture,
  createWallArtTexture,
  createWoodFloorTexture,
} from './textures';

export interface WasteBinHandle {
  category: WasteCategory;
  group: THREE.Group;
  lidPivot: THREE.Group;
  hitMesh: THREE.Mesh;
  basePosition: THREE.Vector3;
  targetLidAngle: number;
  bouncePhase: number;
  shakePhase: number;
}

export interface CatTeacherHandle {
  group: THREE.Group;
  headGroup: THREE.Group;
  pawGroup: THREE.Group;
  tailGroup: THREE.Group;
  leftEarGroup: THREE.Group;
  rightEarGroup: THREE.Group;
  normalEyesGroup: THREE.Group;
  happyEyesGroup: THREE.Group;
  starEyesGroup: THREE.Group;
  oopsEyesGroup: THREE.Group;
  smileMouthGroup: THREE.Group;
  openMouthGroup: THREE.Group;
  oopsMouthGroup: THREE.Group;
  bubbleAnchor: THREE.Object3D;
  shadowMesh: THREE.Mesh;
  basePosition: THREE.Vector3;
}

export function createWasteBin3D(
  category: WasteCategory,
  anisotropy: number,
  shadowTex: THREE.CanvasTexture,
): WasteBinHandle {
  const palette = {
    organik: { body: 0x16a34a, lid: 0x22c55e, trim: 0x14532d },
    anorganik: { body: 0xf59e0b, lid: 0xfbbf24, trim: 0x78350f },
    b3: { body: 0xdc2626, lid: 0xef4444, trim: 0x7f1d1d },
  }[category];

  const group = new THREE.Group();

  // Contact shadow
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.75, 1.75),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
    }),
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.02;
  group.add(shadowPlane);

  const bodyMat = new THREE.MeshStandardMaterial({
    color: palette.body,
    roughness: 0.42,
    metalness: 0.08,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: palette.trim,
    roughness: 0.72,
    metalness: 0.12,
  });
  const lidMat = new THREE.MeshStandardMaterial({
    color: palette.lid,
    roughness: 0.25,
    metalness: 0.1,
  });

  // Base foot ring
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.49, 0.51, 0.1, 28), trimMat);
  foot.position.y = 0.05;
  foot.castShadow = true;
  foot.receiveShadow = true;
  group.add(foot);

  // Tapered bin body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.48, 1.15, 28), bodyMat);
  body.position.y = 0.67;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Top collar rim
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.055, 14, 32), trimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 1.24;
  rim.castShadow = true;
  group.add(rim);

  // Side handles
  [-1, 1].forEach((side) => {
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.28), trimMat);
    handle.position.set(side * 0.59, 0.92, 0);
    handle.castShadow = true;
    group.add(handle);
  });

  // Front label plaque (curved slightly forward on a tilted box)
  const labelTex = createBinLabelTexture(category, anisotropy);
  const labelMat = new THREE.MeshStandardMaterial({
    map: labelTex,
    roughness: 0.35,
    metalness: 0.02,
  });
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.68, 0.05), labelMat);
  plaque.position.set(0, 0.68, 0.54);
  plaque.rotation.x = -0.08;
  group.add(plaque);

  // Hinged Lid Pivot (rear hinge at z = -0.52, y = 1.27)
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 1.27, -0.52);

  const lidBase = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.61, 0.14, 28), lidMat);
  lidBase.position.set(0, 0.07, 0.52);
  lidBase.castShadow = true;
  lidPivot.add(lidBase);

  const lidDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.56, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.35),
    lidMat,
  );
  lidDome.position.set(0, 0.02, 0.52);
  lidDome.scale.set(1, 0.55, 1);
  lidDome.castShadow = true;
  lidPivot.add(lidDome);

  const lidHandle = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.09, 0.11), trimMat);
  lidHandle.position.set(0, 0.24, 0.52);
  lidHandle.castShadow = true;
  lidPivot.add(lidHandle);

  group.add(lidPivot);

  // Invisible generous raycast hitbox (layer 1) for effortless finger tapping
  const hitMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.76, 0.72, 1.75, 16),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitMesh.position.y = 0.88;
  hitMesh.layers.set(1);
  hitMesh.userData.category = category;
  group.add(hitMesh);

  return {
    category,
    group,
    lidPivot,
    hitMesh,
    basePosition: new THREE.Vector3(),
    targetLidAngle: 0,
    bouncePhase: 0,
    shakePhase: 0,
  };
}

export function createCatTeacher3D(shadowTex: THREE.CanvasTexture): CatTeacherHandle {
  const group = new THREE.Group();

  // Ground contact shadow
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.45, 1.45),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.6,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  group.add(shadow);

  const furOrange = new THREE.MeshStandardMaterial({ color: 0xfb923c, roughness: 0.65 });
  const furLight = new THREE.MeshStandardMaterial({ color: 0xfdba74, roughness: 0.68 });
  const furCream = new THREE.MeshStandardMaterial({ color: 0xfff7ed, roughness: 0.7 });
  const scarfMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.55 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, metalness: 0.35 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.25, metalness: 0.4 });
  const pinkMat = new THREE.MeshStandardMaterial({ color: 0xfb7185, roughness: 0.5 });

  // Body
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.42, 10, 20), furOrange);
  body.position.y = 0.54;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Cream belly patch
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), furCream);
  belly.position.set(0, 0.5, 0.16);
  belly.scale.set(0.95, 1.15, 0.65);
  group.add(belly);

  // Feet
  [-0.16, 0.16].forEach((x) => {
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 12), furCream);
    foot.position.set(x, 0.1, 0.14);
    foot.scale.set(1, 0.72, 1.25);
    foot.castShadow = true;
    group.add(foot);
  });

  // Green Teacher Scarf Collar + Leaf Pin
  const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.07, 12, 24), scarfMat);
  scarf.rotation.x = Math.PI / 2;
  scarf.position.y = 0.88;
  scarf.castShadow = true;
  group.add(scarf);

  const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.04, 16), goldMat);
  pin.rotation.x = Math.PI / 2;
  pin.position.set(0, 0.85, 0.31);
  group.add(pin);

  // Head Group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.18, 0);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 22, 18), furLight);
  head.scale.set(1.08, 0.95, 0.95);
  head.castShadow = true;
  headGroup.add(head);

  // Ears with independent wiggle pivots
  const leftEarGroup = new THREE.Group();
  leftEarGroup.position.set(-0.24, 0.25, 0);
  const rightEarGroup = new THREE.Group();
  rightEarGroup.position.set(0.24, 0.25, 0);

  [
    { side: -1, earParent: leftEarGroup },
    { side: 1, earParent: rightEarGroup },
  ].forEach(({ side, earParent }) => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 4), furOrange);
    ear.position.set(0, 0.08, 0);
    ear.rotation.z = -side * 0.32;
    ear.rotation.y = Math.PI / 4;
    ear.castShadow = true;
    earParent.add(ear);

    const innerEar = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.17, 4), pinkMat);
    innerEar.position.set(-side * 0.01, 0.06, 0.045);
    innerEar.rotation.z = -side * 0.32;
    innerEar.rotation.y = Math.PI / 4;
    earParent.add(innerEar);

    headGroup.add(earParent);
  });

  // Teacher Glasses (always visible)
  [-0.13, 0.13].forEach((x) => {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.018, 10, 20), darkMat);
    rim.position.set(x, 0.03, 0.33);
    headGroup.add(rim);
  });

  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.018, 0.018), darkMat);
  bridge.position.set(0, 0.035, 0.34);
  headGroup.add(bridge);

  // Rosy Blush Cheeks
  [-0.22, 0.22].forEach((x) => {
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), pinkMat);
    blush.scale.set(1.2, 0.7, 0.4);
    blush.position.set(x, -0.06, 0.27);
    headGroup.add(blush);
  });

  // Expression 1: Normal cute shiny eyes
  const normalEyesGroup = new THREE.Group();
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  [-0.13, 0.13].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 12), darkMat);
    eye.position.set(x, 0.03, 0.31);
    normalEyesGroup.add(eye);
    const sparkle = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), whiteMat);
    sparkle.position.set(x + 0.016, 0.048, 0.348);
    normalEyesGroup.add(sparkle);
  });
  headGroup.add(normalEyesGroup);

  // Expression 2: Happy crescent eyes (^ ^)
  const happyEyesGroup = new THREE.Group();
  [-0.13, 0.13].forEach((x) => {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.016, 8, 16, Math.PI), darkMat);
    arch.position.set(x, 0.02, 0.325);
    happyEyesGroup.add(arch);
  });
  happyEyesGroup.visible = false;
  headGroup.add(happyEyesGroup);

  // Expression 3: Star eyes for Combo!
  const starEyesGroup = new THREE.Group();
  [-0.13, 0.13].forEach((x) => {
    const starA = new THREE.Mesh(new THREE.OctahedronGeometry(0.055, 0), goldMat);
    starA.scale.set(1, 1, 0.4);
    starA.position.set(x, 0.03, 0.325);
    starEyesGroup.add(starA);
  });
  starEyesGroup.visible = false;
  headGroup.add(starEyesGroup);

  // Expression 4: Cute > < encouraging eyes
  const oopsEyesGroup = new THREE.Group();
  [-0.13, 0.13].forEach((x, idx) => {
    const dir = idx === 0 ? 1 : -1;
    const bar1 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.018, 0.02), darkMat);
    bar1.position.set(x, 0.045, 0.325);
    bar1.rotation.z = -dir * 0.42;
    oopsEyesGroup.add(bar1);

    const bar2 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.018, 0.02), darkMat);
    bar2.position.set(x, 0.015, 0.325);
    bar2.rotation.z = dir * 0.42;
    oopsEyesGroup.add(bar2);
  });
  oopsEyesGroup.visible = false;
  headGroup.add(oopsEyesGroup);

  // Muzzle cheeks & Nose
  [-0.055, 0.055].forEach((x) => {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 12), furCream);
    cheek.position.set(x, -0.075, 0.29);
    headGroup.add(cheek);
  });

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), pinkMat);
  nose.position.set(0, -0.04, 0.35);
  headGroup.add(nose);

  // Mouths: Smile (:3), Open Cheer (:D), Surprised (:o)
  const smileMouthGroup = new THREE.Group();
  [-0.035, 0.035].forEach((x) => {
    const curve = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.012, 8, 14, Math.PI), darkMat);
    curve.position.set(x, -0.1, 0.332);
    curve.rotation.z = Math.PI;
    smileMouthGroup.add(curve);
  });
  headGroup.add(smileMouthGroup);

  const openMouthGroup = new THREE.Group();
  const mouthCavity = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), pinkMat);
  mouthCavity.scale.set(1.2, 1.0, 0.5);
  mouthCavity.position.set(0, -0.125, 0.325);
  openMouthGroup.add(mouthCavity);
  openMouthGroup.visible = false;
  headGroup.add(openMouthGroup);

  const oopsMouthGroup = new THREE.Group();
  const oMouth = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.014, 8, 16), darkMat);
  oMouth.position.set(0, -0.125, 0.335);
  oopsMouthGroup.add(oMouth);
  oopsMouthGroup.visible = false;
  headGroup.add(oopsMouthGroup);

  group.add(headGroup);

  // Speech bubble world-to-screen anchor right above Guru Kucing's ears
  const bubbleAnchor = new THREE.Object3D();
  bubbleAnchor.position.set(0.15, 1.82, 0);
  group.add(bubbleAnchor);

  // Waving Right Arm / Paw Group
  const pawGroup = new THREE.Group();
  pawGroup.position.set(0.32, 0.72, 0.04);
  const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.26, 8, 12), furOrange);
  arm.position.set(0.08, 0.1, 0);
  arm.rotation.z = -0.55;
  arm.castShadow = true;
  pawGroup.add(arm);

  const pawTip = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 12), furCream);
  pawTip.position.set(0.18, 0.23, 0.02);
  pawGroup.add(pawTip);
  group.add(pawGroup);

  // Left Arm resting
  const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.24, 8, 12), furOrange);
  leftArm.position.set(-0.34, 0.58, 0.05);
  leftArm.rotation.z = 0.35;
  leftArm.castShadow = true;
  group.add(leftArm);

  // Curved Tail Group
  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, 0.28, -0.26);
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-0.12, 0.16, -0.22),
    new THREE.Vector3(-0.22, 0.42, -0.18),
    new THREE.Vector3(-0.14, 0.56, -0.08),
  ]);
  const tailMesh = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 16, 0.065, 10, false), furOrange);
  tailMesh.castShadow = true;
  tailGroup.add(tailMesh);
  group.add(tailGroup);

  return {
    group,
    headGroup,
    pawGroup,
    tailGroup,
    leftEarGroup,
    rightEarGroup,
    normalEyesGroup,
    happyEyesGroup,
    starEyesGroup,
    oopsEyesGroup,
    smileMouthGroup,
    openMouthGroup,
    oopsMouthGroup,
    bubbleAnchor,
    shadowMesh: shadow,
    basePosition: new THREE.Vector3(),
  };
}

export function createWasteItem3D(itemId: string): THREE.Group {
  const g = new THREE.Group();

  const std = (color: number, roughness = 0.45, metalness = 0.05) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });

  switch (itemId) {
    case 'kulit-pisang': {
      const yellow = std(0xfacc15, 0.4);
      const stem = std(0x78350f, 0.8);
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.14, 10), stem);
      top.position.y = 0.32;
      g.add(top);
      [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((ang) => {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0.26, 0),
          new THREE.Vector3(Math.cos(ang) * 0.22, 0.14, Math.sin(ang) * 0.22),
          new THREE.Vector3(Math.cos(ang) * 0.38, -0.18, Math.sin(ang) * 0.38),
        ]);
        const peel = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.075, 8, false), yellow);
        peel.castShadow = true;
        g.add(peel);
      });
      break;
    }

    case 'sisa-apel': {
      const red = std(0xef4444, 0.35);
      const flesh = std(0xfef3c7, 0.7);
      const leafMat = std(0x22c55e, 0.5);
      const core = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.34, 14), flesh);
      g.add(core);
      const capTop = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), red);
      capTop.position.y = 0.12;
      g.add(capTop);
      const capBot = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5), red);
      capBot.position.y = -0.12;
      g.add(capBot);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.18, 8), std(0x78350f, 0.8));
      stem.position.y = 0.4;
      g.add(stem);
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), leafMat);
      leaf.position.set(0.11, 0.42, 0);
      leaf.scale.set(1.4, 0.35, 0.7);
      g.add(leaf);
      break;
    }

    case 'daun-kering': {
      const amber = std(0xd97706, 0.72);
      const gold = std(0xf59e0b, 0.65);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.55, 8), std(0x78350f, 0.85));
      stem.rotation.z = 0.6;
      g.add(stem);
      const leaf1 = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 10), amber);
      leaf1.scale.set(1.5, 0.14, 0.85);
      leaf1.rotation.z = 0.35;
      leaf1.position.set(0.05, 0.08, 0);
      g.add(leaf1);
      const leaf2 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), gold);
      leaf2.scale.set(1.3, 0.12, 0.75);
      leaf2.rotation.y = 0.7;
      leaf2.rotation.z = -0.25;
      leaf2.position.set(-0.14, -0.06, 0.12);
      g.add(leaf2);
      break;
    }

    case 'sisa-nasi': {
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.28, 0.09, 24), std(0xf8fafc, 0.25));
      plate.position.y = -0.14;
      g.add(plate);
      const rice = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), std(0xfef9c3, 0.8));
      rice.position.set(-0.04, -0.1, 0);
      g.add(rice);
      const veggie = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), std(0x22c55e, 0.6));
      veggie.position.set(0.18, -0.04, 0.08);
      g.add(veggie);
      const carrot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 12), std(0xf97316, 0.5));
      carrot.position.set(-0.16, -0.04, 0.15);
      g.add(carrot);
      break;
    }

    case 'tulang-ikan': {
      const boneMat = std(0xf1f5f9, 0.45);
      const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.78, 10), boneMat);
      spine.rotation.z = Math.PI / 2;
      g.add(spine);
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.22, 12), boneMat);
      head.rotation.z = Math.PI / 2;
      head.position.x = -0.4;
      g.add(head);
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.18, 4), boneMat);
      tail.rotation.z = -Math.PI / 2;
      tail.scale.set(1, 1, 0.2);
      tail.position.x = 0.4;
      g.add(tail);
      [-0.18, 0, 0.18].forEach((x) => {
        const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.34, 8), boneMat);
        rib.position.x = x;
        g.add(rib);
      });
      break;
    }

    case 'cangkang-telur': {
      const shell = std(0xfef3c7, 0.6);
      const half1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 16, 12, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55),
        shell,
      );
      half1.position.set(-0.15, -0.02, 0);
      half1.rotation.z = -0.25;
      g.add(half1);
      const half2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
        shell,
      );
      half2.position.set(0.2, 0.06, 0.06);
      half2.rotation.z = 0.4;
      g.add(half2);
      break;
    }

    case 'kulit-jeruk': {
      const orange = std(0xfb923c, 0.55);
      const peel1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 16, 14, 0, Math.PI * 1.25, 0.2, Math.PI * 0.75),
        orange,
      );
      peel1.rotation.y = 0.5;
      g.add(peel1);
      const peel2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 14, 12, 0, Math.PI, 0.4, Math.PI * 0.6),
        std(0xf97316, 0.55),
      );
      peel2.position.set(0.18, -0.1, 0.12);
      peel2.rotation.z = 0.8;
      g.add(peel2);
      break;
    }

    case 'potongan-sayur': {
      const green1 = std(0x22c55e, 0.55);
      const green2 = std(0x15803d, 0.6);
      for (let i = 0; i < 4; i += 1) {
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), i % 2 === 0 ? green1 : green2);
        leaf.scale.set(1.3, 0.18, 0.85);
        leaf.position.set((i - 1.5) * 0.13, (i % 2) * 0.08, (i % 3) * 0.08 - 0.06);
        leaf.rotation.set(0.3 * i, 0.6 * i, 0.2);
        g.add(leaf);
      }
      break;
    }

    // ANORGANIK
    case 'botol-plastik': {
      const plastic = new THREE.MeshStandardMaterial({
        color: 0xbae6fd,
        roughness: 0.15,
        metalness: 0.05,
        transparent: true,
        opacity: 0.78,
      });
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.54, 20), plastic);
      body.position.y = -0.08;
      g.add(body);
      const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, 0.16, 20), plastic);
      shoulder.position.y = 0.27;
      g.add(shoulder);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.1, 16), std(0x0284c7, 0.35));
      cap.position.y = 0.4;
      g.add(cap);
      const label = new THREE.Mesh(new THREE.CylinderGeometry(0.206, 0.206, 0.22, 20), std(0x38bdf8, 0.4));
      label.position.y = -0.05;
      g.add(label);
      break;
    }

    case 'kaleng-minuman': {
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.58, 24),
        std(0xef4444, 0.25, 0.75),
      );
      g.add(body);
      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(0.224, 0.224, 0.2, 24),
        std(0xfde047, 0.3, 0.6),
      );
      g.add(band);
      const topRim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.21, 0.22, 0.05, 24),
        std(0xe2e8f0, 0.2, 0.85),
      );
      topRim.position.y = 0.31;
      g.add(topRim);
      break;
    }

    case 'kardus-bekas': {
      const cardboard = std(0xd97706, 0.82);
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.44, 0.46), cardboard);
      g.add(box);
      const tape = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.04, 0.14), std(0xfef3c7, 0.4));
      tape.position.y = 0.22;
      g.add(tape);
      const flapL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.03, 0.45), std(0xf59e0b, 0.8));
      flapL.position.set(-0.24, 0.3, 0);
      flapL.rotation.z = 0.65;
      g.add(flapL);
      const flapR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.03, 0.45), std(0xf59e0b, 0.8));
      flapR.position.set(0.24, 0.3, 0);
      flapR.rotation.z = -0.65;
      g.add(flapR);
      break;
    }

    case 'gelas-plastik': {
      const cupMat = new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        roughness: 0.18,
        transparent: true,
        opacity: 0.8,
      });
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.16, 0.5, 22), cupMat);
      cup.position.y = -0.05;
      g.add(cup);
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.05, 22), std(0x7dd3fc, 0.3));
      lid.position.y = 0.21;
      g.add(lid);
      const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.46, 10), std(0xf97316, 0.35));
      straw.position.set(0.06, 0.28, 0);
      straw.rotation.z = -0.22;
      g.add(straw);
      break;
    }

    case 'koran-bekas': {
      const paper1 = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.06, 0.42), std(0xf8fafc, 0.8));
      paper1.position.y = -0.05;
      g.add(paper1);
      const paper2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.38), std(0xe2e8f0, 0.82));
      paper2.position.set(0.03, 0.02, -0.02);
      paper2.rotation.y = 0.2;
      g.add(paper2);
      const headline = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.015, 0.08), std(0x334155, 0.7));
      headline.position.set(0.03, 0.06, -0.08);
      headline.rotation.y = 0.2;
      g.add(headline);
      break;
    }

    case 'botol-kaca': {
      const glass = std(0x34d399, 0.12, 0.15);
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.46, 22), glass);
      body.position.y = -0.12;
      g.add(body);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, 0.24, 20), glass);
      neck.position.y = 0.22;
      g.add(neck);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.09, 16), std(0xf59e0b, 0.3, 0.6));
      cap.position.y = 0.38;
      g.add(cap);
      const label = new THREE.Mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.2, 20), std(0xfef3c7, 0.5));
      label.position.y = -0.1;
      g.add(label);
      break;
    }

    case 'kantong-plastik': {
      const bagMat = std(0x7dd3fc, 0.3);
      const bagBody = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.44, 0.22), bagMat);
      bagBody.position.y = -0.06;
      g.add(bagBody);
      [-0.14, 0.14].forEach((x) => {
        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.028, 10, 18, Math.PI), std(0x0284c7, 0.35));
        handle.position.set(x, 0.17, 0);
        g.add(handle);
      });
      break;
    }

    case 'kotak-susu': {
      const carton = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.5, 0.32), std(0xffffff, 0.4));
      carton.position.y = -0.04;
      g.add(carton);
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.24, 0.33), std(0x3b82f6, 0.4));
      band.position.y = -0.04;
      g.add(band);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.2, 4), std(0x60a5fa, 0.45));
      roof.position.y = 0.31;
      roof.rotation.y = Math.PI / 4;
      g.add(roof);
      break;
    }

    // B3
    case 'baterai-bekas': {
      const redTop = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.28, 20), std(0xdc2626, 0.35, 0.2));
      redTop.position.y = 0.14;
      g.add(redTop);
      const darkBot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.32, 20), std(0x1e293b, 0.4, 0.3));
      darkBot.position.y = -0.16;
      g.add(darkBot);
      const terminal = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.09, 16), std(0x94a3b8, 0.25, 0.85));
      terminal.position.y = 0.32;
      g.add(terminal);
      const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.07, 20), std(0xfacc15, 0.3));
      stripe.position.y = 0.02;
      g.add(stripe);
      break;
    }

    case 'lampu-bohlam': {
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 16), std(0xfef08a, 0.18));
      bulb.position.y = 0.12;
      g.add(bulb);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.18, 16), std(0xfef08a, 0.2));
      neck.position.y = -0.1;
      g.add(neck);
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.11, 0.2, 16), std(0x94a3b8, 0.3, 0.8));
      screw.position.y = -0.28;
      g.add(screw);
      break;
    }

    case 'obat-kedaluwarsa': {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.36), std(0xe2e8f0, 0.3, 0.6));
      strip.rotation.x = 0.45;
      g.add(strip);
      [
        [-0.14, -0.08],
        [0.14, -0.08],
        [-0.14, 0.08],
        [0.14, 0.08],
      ].forEach(([px, pz], idx) => {
        const pill = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 12, 10),
          std(idx === 2 ? 0xffffff : 0xef4444, 0.35),
        );
        pill.position.set(px, 0.06, pz);
        pill.scale.y = 0.7;
        strip.add(pill);
      });
      break;
    }

    case 'semprot-nyamuk': {
      const can = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.56, 22), std(0xf97316, 0.35, 0.35));
      can.position.y = -0.04;
      g.add(can);
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 16), std(0xf8fafc, 0.35));
      nozzle.position.y = 0.3;
      g.add(nozzle);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 10), std(0xdc2626, 0.3));
      dot.position.set(0, 0.31, 0.08);
      g.add(dot);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.18, 22), std(0xfef08a, 0.4));
      band.position.y = 0.02;
      g.add(band);
      break;
    }

    case 'termometer-rusak': {
      const tube = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.56, 8, 14), std(0xf8fafc, 0.2));
      tube.rotation.z = -0.55;
      g.add(tube);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 14), std(0xdc2626, 0.25, 0.2));
      bulb.position.set(-0.18, -0.26, 0);
      g.add(bulb);
      const merc = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 10), std(0xdc2626, 0.2));
      merc.rotation.z = -0.55;
      g.add(merc);
      break;
    }

    case 'charger-rusak': {
      const brick = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.32, 0.22), std(0xffffff, 0.3));
      brick.position.y = 0.08;
      g.add(brick);
      [-0.08, 0.08].forEach((px) => {
        const prong = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.16, 10), std(0x94a3b8, 0.25, 0.85));
        prong.position.set(px, 0.3, 0);
        g.add(prong);
      });
      const cordCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.08, 0),
        new THREE.Vector3(-0.18, -0.22, 0.12),
        new THREE.Vector3(0.15, -0.32, -0.06),
        new THREE.Vector3(0.32, -0.22, 0.14),
      ]);
      const cord = new THREE.Mesh(new THREE.TubeGeometry(cordCurve, 14, 0.032, 8, false), std(0x1e293b, 0.6));
      g.add(cord);
      break;
    }

    case 'masker-medis': {
      const maskMat = std(0x38bdf8, 0.7);
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.34, 0.06), maskMat);
      pad.rotation.x = -0.25;
      g.add(pad);
      [-0.28, 0.28].forEach((x) => {
        const strap = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 8, 16), std(0xf8fafc, 0.6));
        strap.position.set(x, 0, 0);
        strap.rotation.y = Math.PI / 2;
        pad.add(strap);
      });
      break;
    }

    case 'cairan-pembersih':
    default: {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.48, 0.24), std(0xc084fc, 0.35));
      body.position.y = -0.08;
      g.add(body);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.14, 14), std(0xdc2626, 0.35));
      cap.position.y = 0.23;
      g.add(cap);
      const badge = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.18, 3), std(0xfacc15, 0.4));
      badge.position.set(0, -0.06, 0.13);
      badge.scale.set(1, 1, 0.2);
      g.add(badge);
      break;
    }
  }

  return g;
}

export function createEnvironment3D(
  location: SceneLocation,
  anisotropy: number,
): { group: THREE.Group; skyHex: number; fogDensity: number } {
  const env = new THREE.Group();
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.65 });

  if (location === 'lapangan') {
    // Outdoor extended lawn (NO indoor walls!)
    const grassTex = createGrassTexture(anisotropy);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(55, 55),
      new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.92 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    env.add(ground);

    // Sunny garden pathway + stepping stones
    const path = new THREE.Mesh(
      new THREE.BoxGeometry(12.5, 0.04, 3.6),
      new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.88 }),
    );
    path.position.set(0, 0.02, -0.5);
    path.receiveShadow = true;
    env.add(path);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.85 });
    [-4.2, -2.5, 2.5, 4.2].forEach((sx, i) => {
      const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.05, 10), stoneMat);
      stone.position.set(sx, 0.03, -2.45 + (i % 2) * 0.25);
      env.add(stone);
    });

    // White Picket Fence across the park background (z = -3.7)
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 });
    const railTop = new THREE.Mesh(new THREE.BoxGeometry(14.5, 0.09, 0.07), fenceMat);
    railTop.position.set(0, 0.78, -3.7);
    env.add(railTop);
    const railBot = new THREE.Mesh(new THREE.BoxGeometry(14.5, 0.09, 0.07), fenceMat);
    railBot.position.set(0, 0.34, -3.7);
    env.add(railBot);
    for (let px = -7.0; px <= 7.0; px += 0.65) {
      const picket = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.96, 0.06), fenceMat);
      picket.position.set(px, 0.48, -3.7);
      picket.castShadow = true;
      env.add(picket);
    }

    // Colorful Flower Beds & Bushes along the park border
    const bushMat1 = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 });
    const bushMat2 = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.8 });
    const flowerCols = [0xef4444, 0xfacc15, 0xec4899, 0xa855f7, 0xf97316];
    [
      [-5.2, -3.2],
      [-3.7, -3.35],
      [3.7, -3.35],
      [5.2, -3.2],
      [-4.8, 1.3],
      [4.8, 1.3],
    ].forEach(([bx, bz], idx) => {
      const bush = new THREE.Group();
      bush.position.set(bx, 0, bz);
      const b1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.46, 12, 10),
        idx % 2 === 0 ? bushMat1 : bushMat2,
      );
      b1.position.y = 0.32;
      b1.scale.set(1.25, 0.85, 1.0);
      b1.castShadow = true;
      bush.add(b1);

      const b2 = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), bushMat2);
      b2.position.set(0.32, 0.24, 0.12);
      bush.add(b2);

      // Blossoms on bush
      for (let f = 0; f < 4; f += 1) {
        const blossom = new THREE.Mesh(
          new THREE.SphereGeometry(0.075, 8, 8),
          new THREE.MeshStandardMaterial({
            color: flowerCols[(idx + f) % flowerCols.length],
            roughness: 0.4,
          }),
        );
        blossom.position.set((f - 1.5) * 0.22, 0.52 + (f % 2) * 0.1, 0.26);
        bush.add(blossom);
      }
      env.add(bush);
    });

    // Playground Slide on back-left lawn
    const slide = new THREE.Group();
    slide.position.set(-4.3, 0, -4.9);
    slide.rotation.y = 0.45;
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    const slideYellow = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 });
    [-0.35, 0.35].forEach((lx) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.75, 10), poleMat);
      post.position.set(lx, 0.875, -0.3);
      post.castShadow = true;
      slide.add(post);
    });
    const plat = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.1, 0.7), poleMat);
    plat.position.set(0, 1.45, -0.15);
    slide.add(plat);
    const chute = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.08, 1.85), slideYellow);
    chute.position.set(0, 0.78, 0.85);
    chute.rotation.x = 0.68;
    chute.castShadow = true;
    slide.add(chute);
    env.add(slide);

    // Festive Park Bunting Garland strung between 2 wooden poles
    const flagCols = [0xef4444, 0xfacc15, 0x22c55e, 0x38bdf8, 0xf97316];
    const poleWood = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    [-4.8, 4.8].forEach((px) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 3.7, 10), poleWood);
      pole.position.set(px, 1.85, -4.4);
      pole.castShadow = true;
      env.add(pole);
    });
    for (let i = 0; i < 11; i += 1) {
      const t = i / 10;
      const fx = THREE.MathUtils.lerp(-4.3, 4.3, t);
      const fy = 3.55 - Math.sin(t * Math.PI) * 0.45;
      const flag = new THREE.Mesh(
        new THREE.ConeGeometry(0.18, 0.36, 3),
        new THREE.MeshStandardMaterial({ color: flagCols[i % flagCols.length], roughness: 0.5 }),
      );
      flag.rotation.x = Math.PI;
      flag.position.set(fx, fy, -4.4);
      env.add(flag);
    }

    // Perimeter 3D Multi-part Trees (with colorful blossoms/fruits)
    const treePositions = [
      [-6.8, -5.8],
      [6.8, -5.6],
      [-8.5, -1.8],
      [8.5, -2.0],
      [-2.2, -7.8],
      [2.4, -7.5],
    ];
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const leafMat1 = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.78 });
    const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.78 });

    treePositions.forEach(([tx, tz], idx) => {
      const tree = new THREE.Group();
      tree.position.set(tx, 0, tz);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 2.2, 10), trunkMat);
      trunk.position.y = 1.1;
      trunk.castShadow = true;
      tree.add(trunk);

      const crown1 = new THREE.Mesh(
        new THREE.SphereGeometry(1.18, 14, 12),
        idx % 2 === 0 ? leafMat1 : leafMat2,
      );
      crown1.position.y = 2.65;
      crown1.castShadow = true;
      tree.add(crown1);

      const crown2 = new THREE.Mesh(new THREE.SphereGeometry(0.86, 12, 10), leafMat2);
      crown2.position.set(0.45, 3.25, 0.25);
      tree.add(crown2);

      const crown3 = new THREE.Mesh(new THREE.SphereGeometry(0.75, 12, 10), leafMat1);
      crown3.position.set(-0.45, 3.05, -0.2);
      tree.add(crown3);
      env.add(tree);
    });

    // Wooden Park Bench + Classic Lamp Post on Back-Right
    const bench = new THREE.Group();
    bench.position.set(3.8, 0, -4.5);
    bench.rotation.y = -0.35;
    const benchWood = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.75 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 0.6), benchWood);
    seat.position.y = 0.55;
    seat.castShadow = true;
    bench.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.55, 0.1), benchWood);
    back.position.set(0, 0.9, -0.25);
    bench.add(back);
    [-0.8, 0.8].forEach((lx) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 0.55), trunkMat);
      leg.position.set(lx, 0.275, 0);
      bench.add(leg);
    });
    env.add(bench);

    const lampPost = new THREE.Group();
    lampPost.position.set(2.3, 0, -4.6);
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.6 });
    const postShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 2.7, 12), ironMat);
    postShaft.position.y = 1.35;
    lampPost.add(postShaft);
    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 14, 12),
      new THREE.MeshBasicMaterial({ color: 0xfef08a }),
    );
    lantern.position.y = 2.82;
    lampPost.add(lantern);
    env.add(lampPost);

    // Bright Sun & Fluffy 3D Clouds in Sky
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(0.75, 18, 16),
      new THREE.MeshBasicMaterial({ color: 0xfde047 }),
    );
    sun.position.set(5.5, 5.2, -11);
    env.add(sun);

    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [
      [-4.2, 4.9, -10.5],
      [0.6, 5.3, -11.5],
      [4.5, 4.5, -12.0],
    ].forEach(([cx, cy, cz]) => {
      const cloud = new THREE.Group();
      cloud.position.set(cx, cy, cz);
      [
        [0, 0, 0, 0.65],
        [-0.55, -0.1, 0, 0.48],
        [0.55, -0.08, 0, 0.5],
      ].forEach(([ox, oy, oz, r]) => {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), cloudMat);
        puff.position.set(ox, oy, oz);
        cloud.add(puff);
      });
      env.add(cloud);
    });

    return { group: env, skyHex: 0xbae6fd, fogDensity: 0.018 };
  }

  // INDOOR LOCATIONS: SEKOLAH (Default) & RUMAH
  const isSchool = location === 'sekolah';
  const woodTex = createWoodFloorTexture(anisotropy, isSchool ? '#D29B63' : '#C68A53');
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 18),
    new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.68 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  env.add(floor);

  // Back wall & Side walls
  const wallMat = new THREE.MeshStandardMaterial({
    color: isSchool ? 0xfef3c7 : 0xffedd5,
    roughness: 0.88,
  });
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(22, 8.5, 0.3), wallMat);
  backWall.position.set(0, 4.25, -5.2);
  backWall.receiveShadow = true;
  env.add(backWall);

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8.5, 16), wallMat);
  leftWall.position.set(-8.5, 4.25, 1.5);
  leftWall.receiveShadow = true;
  env.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8.5, 16), wallMat);
  rightWall.position.set(8.5, 4.25, 1.5);
  rightWall.receiveShadow = true;
  env.add(rightWall);

  // Lower wall wainscoting + wooden rail trim on back & side walls (prevents flat walls!)
  const wainscotMat = new THREE.MeshStandardMaterial({
    color: isSchool ? 0xd9f99d : 0xfed7aa,
    roughness: 0.82,
  });
  const backWainscot = new THREE.Mesh(new THREE.BoxGeometry(22, 1.25, 0.33), wainscotMat);
  backWainscot.position.set(0, 0.625, -5.18);
  env.add(backWainscot);

  const backChairRail = new THREE.Mesh(new THREE.BoxGeometry(22, 0.1, 0.38), trimMat);
  backChairRail.position.set(0, 1.28, -5.16);
  env.add(backChairRail);

  const baseboard = new THREE.Mesh(new THREE.BoxGeometry(22, 0.24, 0.38), trimMat);
  baseboard.position.set(0, 0.12, -5.16);
  env.add(baseboard);

  // Ceiling Pendant Lamps
  [-2.6, 2.6].forEach((lx) => {
    const cord = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 1.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x334155 }),
    );
    cord.position.set(lx, 5.5, -2.5);
    env.add(cord);

    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.42, 0.34, 18, 1, true),
      new THREE.MeshStandardMaterial({
        color: isSchool ? 0xfbbf24 : 0xfef3c7,
        roughness: 0.35,
        side: THREE.DoubleSide,
      }),
    );
    shade.position.set(lx, 4.75, -2.5);
    env.add(shade);
  });

  // Sunny Window with Crossbar Mullions on Left Wall
  const winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.38, 2.7, 3.4), trimMat);
  winFrame.position.set(-8.42, 3.2, -1.2);
  env.add(winFrame);
  const winGlass = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 2.4, 3.1),
    new THREE.MeshBasicMaterial({ color: 0xbae6fd }),
  );
  winGlass.position.set(-8.4, 3.2, -1.2);
  env.add(winGlass);
  const winBarH = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.08, 3.15), trimMat);
  winBarH.position.set(-8.38, 3.2, -1.2);
  env.add(winBarH);
  const winBarV = new THREE.Mesh(new THREE.BoxGeometry(0.44, 2.45, 0.08), trimMat);
  winBarV.position.set(-8.38, 3.2, -1.2);
  env.add(winBarV);

  if (isSchool) {
    // SCHOOL PROPS: Chalkboard + Chalk Tray, Posters, Clock, Flag, Bookshelf + Globe, Student Desks, Bunting
    const chalkTex = createChalkboardTexture(anisotropy);
    const boardFrame = new THREE.Mesh(new THREE.BoxGeometry(6.2, 2.8, 0.18), trimMat);
    boardFrame.position.set(0, 3.1, -5.0);
    boardFrame.castShadow = true;
    env.add(boardFrame);

    const boardFace = new THREE.Mesh(
      new THREE.PlaneGeometry(5.85, 2.48),
      new THREE.MeshStandardMaterial({ map: chalkTex, roughness: 0.78 }),
    );
    boardFace.position.set(0, 3.1, -4.9);
    env.add(boardFace);

    // Chalk tray + colorful chalk sticks + board eraser
    const chalkTray = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.1, 0.24), trimMat);
    chalkTray.position.set(0, 1.72, -4.84);
    env.add(chalkTray);
    const eraser = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.1, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 }),
    );
    eraser.position.set(-1.1, 1.81, -4.82);
    env.add(eraser);

    // Left Poster: Jadwal Piket
    const piketTex = createWallArtTexture('piket', anisotropy);
    const piketFrame = new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.35, 0.1), trimMat);
    piketFrame.position.set(-4.35, 3.05, -5.0);
    env.add(piketFrame);
    const piketFace = new THREE.Mesh(
      new THREE.PlaneGeometry(1.55, 1.15),
      new THREE.MeshStandardMaterial({ map: piketTex, roughness: 0.55 }),
    );
    piketFace.position.set(-4.35, 3.05, -4.94);
    env.add(piketFace);

    // Right Poster: Kelas Hijau 3R
    const ecoTex = createWallArtTexture('eco', anisotropy);
    const ecoFrame = new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.35, 0.1), trimMat);
    ecoFrame.position.set(4.35, 2.6, -5.0);
    env.add(ecoFrame);
    const ecoFace = new THREE.Mesh(
      new THREE.PlaneGeometry(1.55, 1.15),
      new THREE.MeshStandardMaterial({ map: ecoTex, roughness: 0.55 }),
    );
    ecoFace.position.set(4.35, 2.6, -4.94);
    env.add(ecoFace);

    // Detailed Wall Clock above right poster
    const clockTex = createClockFaceTexture(anisotropy);
    const clockRim = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.1, 24), trimMat);
    clockRim.rotation.x = Math.PI / 2;
    clockRim.position.set(4.35, 4.1, -5.0);
    env.add(clockRim);
    const clockFace = new THREE.Mesh(
      new THREE.CircleGeometry(0.38, 24),
      new THREE.MeshStandardMaterial({ map: clockTex, roughness: 0.35 }),
    );
    clockFace.position.set(4.35, 4.1, -4.94);
    env.add(clockFace);

    // Festive Classroom Pennant Banner across top back wall
    const buntingCols = [0x22c55e, 0xfacc15, 0x38bdf8, 0xf97316, 0xec4899];
    for (let i = 0; i < 13; i += 1) {
      const t = i / 12;
      const fx = THREE.MathUtils.lerp(-5.6, 5.6, t);
      const fy = 4.95 - Math.sin(t * Math.PI) * 0.32;
      const flag = new THREE.Mesh(
        new THREE.ConeGeometry(0.18, 0.35, 3),
        new THREE.MeshStandardMaterial({ color: buntingCols[i % buntingCols.length], roughness: 0.5 }),
      );
      flag.rotation.x = Math.PI;
      flag.position.set(fx, fy, -4.82);
      env.add(flag);
    }

    // Back-Left Bookshelf with colorful books & Globe
    const shelf = createBookshelf3D(-5.1, -4.25);
    env.add(shelf);

    // Indonesian Red-White Classroom Flag in back-left beside chalkboard
    const flagStand = new THREE.Group();
    flagStand.position.set(-3.65, 0, -4.4);
    const fBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.08, 16), trimMat);
    fBase.position.y = 0.04;
    flagStand.add(fBase);
    const fPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 2.35, 10),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35, metalness: 0.4 }),
    );
    fPole.position.y = 1.2;
    flagStand.add(fPole);
    const fRed = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.22, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.6 }),
    );
    fRed.position.set(0.35, 2.2, 0);
    fRed.rotation.y = -0.15;
    flagStand.add(fRed);
    const fWhite = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.22, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }),
    );
    fWhite.position.set(0.35, 1.98, 0);
    fWhite.rotation.y = -0.15;
    flagStand.add(fWhite);
    env.add(flagStand);

    // Back-Right Classroom Locker Cabinet + Potted Plant
    const locker = createClassroomLocker3D(5.2, -4.25);
    env.add(locker);
    env.add(createPottedPlant(3.75, -4.2));

    // Side Student Desks on far left & right aisles
    env.add(createMiniStudentDesk3D(-4.6, -1.65, 0.25));
    env.add(createMiniStudentDesk3D(4.6, -1.65, -0.25));
  } else {
    // HOME PROPS: Cozy Living Room & Kitchen Corner
    const rugTex = createRugPatternTexture(anisotropy);
    const rug = new THREE.Mesh(
      new THREE.BoxGeometry(6.8, 0.04, 4.4),
      new THREE.MeshStandardMaterial({ map: rugTex, roughness: 0.9 }),
    );
    rug.position.set(0, 0.02, -0.4);
    rug.receiveShadow = true;
    env.add(rug);

    // Back Wall Window with Curtains on left + Twin Detailed Paintings + Clock
    const bWinFrame = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.9, 0.14), trimMat);
    bWinFrame.position.set(-3.9, 3.25, -5.0);
    env.add(bWinFrame);
    const bWinGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(2.0, 1.6),
      new THREE.MeshBasicMaterial({ color: 0xbae6fd }),
    );
    bWinGlass.position.set(-3.9, 3.25, -4.92);
    env.add(bWinGlass);
    const curtainMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.78 });
    [-4.88, -2.92].forEach((cx) => {
      const curtain = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 2.25, 12), curtainMat);
      curtain.position.set(cx, 3.2, -4.85);
      env.add(curtain);
    });

    // Twin Landscape Wall Paintings
    const hillsTex = createWallArtTexture('hills', anisotropy);
    const sunnyTex = createWallArtTexture('sunny', anisotropy);
    [
      [-0.9, hillsTex],
      [1.3, sunnyTex],
    ].forEach(([fx, tex]) => {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.35, 0.1), trimMat);
      frame.position.set(fx as number, 3.35, -5.0);
      env.add(frame);
      const art = new THREE.Mesh(
        new THREE.PlaneGeometry(1.52, 1.12),
        new THREE.MeshStandardMaterial({ map: tex as THREE.CanvasTexture, roughness: 0.55 }),
      );
      art.position.set(fx as number, 3.35, -4.94);
      env.add(art);
    });

    // Wall Clock on right
    const clockTex = createClockFaceTexture(anisotropy);
    const hClockRim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 24), trimMat);
    hClockRim.rotation.x = Math.PI / 2;
    hClockRim.position.set(4.1, 3.85, -5.0);
    env.add(hClockRim);
    const hClockFace = new THREE.Mesh(
      new THREE.CircleGeometry(0.35, 24),
      new THREE.MeshStandardMaterial({ map: clockTex, roughness: 0.35 }),
    );
    hClockFace.position.set(4.1, 3.85, -4.94);
    env.add(hClockFace);

    // Cozy Sofa with Cushions on Back-Left
    const sofa = new THREE.Group();
    sofa.position.set(-4.0, 0, -3.95);
    sofa.rotation.y = 0.28;
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.78 });
    const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.52, 1.05), sofaMat);
    sofaBase.position.y = 0.32;
    sofaBase.castShadow = true;
    sofa.add(sofaBase);
    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.78, 0.28), sofaMat);
    sofaBack.position.set(0, 0.8, -0.38);
    sofaBack.castShadow = true;
    sofa.add(sofaBack);
    [-1.08, 1.08].forEach((ax) => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.65, 1.05), sofaMat);
      arm.position.set(ax, 0.45, 0);
      sofa.add(arm);
    });
    [
      [-0.65, 0xfacc15],
      [0.65, 0xfb7185],
    ].forEach(([px, pcol]) => {
      const pillow = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.38, 0.18),
        new THREE.MeshStandardMaterial({ color: pcol as number, roughness: 0.7 }),
      );
      pillow.position.set(px as number, 0.72, -0.14);
      pillow.rotation.z = (px as number) * -0.18;
      sofa.add(pillow);
    });
    env.add(sofa);

    // Standing Warm Floor Lamp beside sofa
    const floorLamp = new THREE.Group();
    floorLamp.position.set(-5.6, 0, -4.1);
    const lampMetal = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.45 });
    const lBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.06, 16), lampMetal);
    lBase.position.y = 0.03;
    floorLamp.add(lBase);
    const lPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.9, 10), lampMetal);
    lPole.position.y = 0.95;
    floorLamp.add(lPole);
    const lShade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.42, 0.48, 18),
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xfef08a,
        emissiveIntensity: 0.22,
        roughness: 0.4,
      }),
    );
    lShade.position.y = 2.02;
    floorLamp.add(lShade);
    env.add(floorLamp);

    // Center Back Bookshelf / TV Console under the paintings
    const consoleCabinet = new THREE.Group();
    consoleCabinet.position.set(0.2, 0, -4.5);
    const cabBody = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.95, 0.72), trimMat);
    cabBody.position.y = 0.475;
    cabBody.castShadow = true;
    consoleCabinet.add(cabBody);
    [0xef4444, 0x3b82f6, 0x22c55e, 0xfacc15].forEach((bCol, idx) => {
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.36, 0.26),
        new THREE.MeshStandardMaterial({ color: bCol, roughness: 0.55 }),
      );
      book.position.set(-0.9 + idx * 0.14, 1.13, 0);
      consoleCabinet.add(book);
    });
    const tablePlant = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.1, 0.2, 12),
      new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.65 }),
    );
    tablePlant.position.set(0.85, 1.05, 0);
    consoleCabinet.add(tablePlant);
    const tableLeaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 }),
    );
    tableLeaf.position.set(0.85, 1.24, 0);
    consoleCabinet.add(tableLeaf);
    env.add(consoleCabinet);

    // Kitchenette Side Counter with Fruit Bowl & Kettle on Back-Right
    const counter = new THREE.Group();
    counter.position.set(4.35, 0, -4.15);
    counter.rotation.y = -0.3;
    const counterBase = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 1.02, 0.85),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45 }),
    );
    counterBase.position.y = 0.51;
    counterBase.castShadow = true;
    counter.add(counterBase);
    const counterTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 0.92), trimMat);
    counterTop.position.y = 1.04;
    counter.add(counterTop);
    const bowl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.16, 0.14, 16),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35 }),
    );
    bowl.position.set(-0.42, 1.15, 0.05);
    counter.add(bowl);
    [
      [-0.5, 1.24, 0xef4444],
      [-0.36, 1.24, 0xf97316],
      [-0.43, 1.32, 0x22c55e],
    ].forEach(([fx, fy, fcol]) => {
      const fruit = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 10, 10),
        new THREE.MeshStandardMaterial({ color: fcol as number, roughness: 0.4 }),
      );
      fruit.position.set(fx as number, fy as number, 0.05);
      counter.add(fruit);
    });
    const kettle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.18, 0.28, 16),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.25, metalness: 0.35 }),
    );
    kettle.position.set(0.45, 1.22, 0);
    counter.add(kettle);
    env.add(counter);

    env.add(createPottedPlant(5.6, -2.5));
    env.add(createPottedPlant(-5.6, -1.6));
  }

  return { group: env, skyHex: isSchool ? 0xfef3c7 : 0xffedd5, fogDensity: 0.012 };
}

function createBookshelf3D(x: number, z: number): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = 0.22;

  const wood = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.65 });
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.55, 2.05, 0.48), wood);
  frame.position.y = 1.025;
  frame.castShadow = true;
  g.add(frame);

  const bookCols = [0xef4444, 0x3b82f6, 0x22c55e, 0xfacc15, 0xa855f7, 0xf97316];
  [0.52, 1.05, 1.58].forEach((sy, rowIdx) => {
    const shelfBoard = new THREE.Mesh(
      new THREE.BoxGeometry(1.42, 0.06, 0.52),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 }),
    );
    shelfBoard.position.set(0, sy, 0.02);
    g.add(shelfBoard);

    for (let b = 0; b < 6; b += 1) {
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.34 + (b % 2) * 0.06, 0.28),
        new THREE.MeshStandardMaterial({ color: bookCols[(b + rowIdx) % bookCols.length], roughness: 0.55 }),
      );
      book.position.set(-0.5 + b * 0.18, sy + 0.2, 0.12);
      g.add(book);
    }
  });

  // Cute Classroom Globe on top of bookshelf
  const globeStand = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.14, 12), wood);
  globeStand.position.set(0.32, 2.12, 0);
  g.add(globeStand);
  const globeBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 16, 14),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4 }),
  );
  globeBall.position.set(0.32, 2.4, 0);
  g.add(globeBall);
  const globeLand = new THREE.Mesh(
    new THREE.SphereGeometry(0.245, 12, 10, 0, Math.PI * 0.7, 0.5, 1.1),
    new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 }),
  );
  globeLand.position.set(0.32, 2.4, 0);
  g.add(globeLand);

  return g;
}

function createClassroomLocker3D(x: number, z: number): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = -0.22;

  const cabMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.5 });
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.45 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.95, 0.55), cabMat);
  body.position.y = 0.975;
  body.castShadow = true;
  g.add(body);

  [-0.34, 0.34].forEach((dx) => {
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.78, 0.04), doorMat);
    door.position.set(dx, 0.975, 0.28);
    g.add(door);
    const knob = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 }),
    );
    knob.position.set(dx + (dx < 0 ? 0.2 : -0.2), 1.0, 0.32);
    g.add(knob);
  });

  return g;
}

function createMiniStudentDesk3D(x: number, z: number, rotY: number): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;

  const wood = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.5 });
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.07, 0.72), wood);
  top.position.y = 0.72;
  top.castShadow = true;
  g.add(top);

  [
    [-0.48, -0.28],
    [0.48, -0.28],
    [-0.48, 0.28],
    [0.48, 0.28],
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8), steel);
    leg.position.set(lx, 0.35, lz);
    g.add(leg);
  });

  const notebook = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.03, 0.26),
    new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 }),
  );
  notebook.position.set(-0.1, 0.77, 0.05);
  notebook.rotation.y = 0.15;
  g.add(notebook);

  return g;
}

export function createCenterPedestal(woodHex: number): THREE.Group {
  const desk = new THREE.Group();
  desk.position.set(0, 0, 0.4);

  const woodMat = new THREE.MeshStandardMaterial({ color: woodHex, roughness: 0.6 });
  const topMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.45 });

  // Tabletop
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.12, 32), woodMat);
  top.position.y = 0.72;
  top.castShadow = true;
  top.receiveShadow = true;
  desk.add(top);

  // Soft cream mat on top
  const mat = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.03, 28), topMat);
  mat.position.y = 0.795;
  mat.receiveShadow = true;
  desk.add(mat);

  // Sturdy central column + base
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.68, 18), woodMat);
  pillar.position.y = 0.34;
  pillar.castShadow = true;
  desk.add(pillar);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.62, 0.08, 24), woodMat);
  base.position.y = 0.04;
  base.receiveShadow = true;
  desk.add(base);

  return desk;
}

export function createTeacherDesk3D(shadowTex: THREE.CanvasTexture): THREE.Group {
  const group = new THREE.Group();
  group.position.set(0, 0, -0.35);

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.0, 2.0),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.58,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  group.add(shadow);

  const woodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.58 });
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.68 });
  const creamMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.5 });

  // Desk Tabletop
  const tabletop = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.1, 1.05), woodMat);
  tabletop.position.y = 0.78;
  tabletop.castShadow = true;
  tabletop.receiveShadow = true;
  group.add(tabletop);

  // Front modesty panel + decorative nameplate
  const frontPanel = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.54, 0.07), darkWoodMat);
  frontPanel.position.set(0, 0.46, 0.43);
  frontPanel.castShadow = true;
  group.add(frontPanel);

  const nameplate = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.24, 0.03), creamMat);
  nameplate.position.set(0, 0.5, 0.47);
  group.add(nameplate);

  const leafBadge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.035, 16),
    new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.45 }),
  );
  leafBadge.rotation.x = Math.PI / 2;
  leafBadge.position.set(0, 0.5, 0.48);
  group.add(leafBadge);

  // Desk 4 legs
  [
    [-0.98, 0.42],
    [0.98, 0.42],
    [-0.98, -0.42],
    [0.98, -0.42],
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.74, 0.11), darkWoodMat);
    leg.position.set(lx, 0.37, lz);
    leg.castShadow = true;
    group.add(leg);
  });

  // Teacher Props on Desk: Stack of colorful books (left)
  const bookBlue = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.08, 0.34),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.55 }),
  );
  bookBlue.position.set(-0.68, 0.87, 0.08);
  bookBlue.rotation.y = 0.14;
  bookBlue.castShadow = true;
  group.add(bookBlue);

  const bookYellow = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.07, 0.3),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.55 }),
  );
  bookYellow.position.set(-0.66, 0.945, 0.07);
  bookYellow.rotation.y = -0.08;
  bookYellow.castShadow = true;
  group.add(bookYellow);

  // Cute Red Apple on top of desk
  const apple = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 14, 12),
    new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 }),
  );
  apple.position.set(-0.34, 0.93, 0.18);
  apple.castShadow = true;
  group.add(apple);

  const appleLeaf = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 }),
  );
  appleLeaf.scale.set(1.3, 0.3, 0.6);
  appleLeaf.position.set(-0.3, 1.05, 0.18);
  group.add(appleLeaf);

  // Open notebook in center of desk
  const notebook = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.03, 0.38),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.65 }),
  );
  notebook.position.set(0.05, 0.845, 0.16);
  group.add(notebook);

  // Pencil cup + pencils on right
  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.09, 0.22, 16),
    new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.45 }),
  );
  cup.position.set(0.72, 0.94, 0.12);
  cup.castShadow = true;
  group.add(cup);

  [
    [-0.02, 0xfacc15, 0.15],
    [0.03, 0xf97316, -0.18],
  ].forEach(([ox, pCol, rot]) => {
    const pencil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.28, 8),
      new THREE.MeshStandardMaterial({ color: pCol as number, roughness: 0.5 }),
    );
    pencil.position.set(0.72 + (ox as number), 1.06, 0.12);
    pencil.rotation.z = rot as number;
    group.add(pencil);
  });

  // Teacher Chair behind the desk (z = -0.58)
  const chairZ = -0.58;
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.08, 0.62), woodMat);
  seat.position.set(0, 0.44, chairZ);
  seat.castShadow = true;
  group.add(seat);

  const cushion = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.06, 0.52),
    new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.7 }),
  );
  cushion.position.set(0, 0.5, chairZ);
  group.add(cushion);

  const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.72, 0.08), woodMat);
  backrest.position.set(0, 0.86, chairZ - 0.27);
  backrest.castShadow = true;
  group.add(backrest);

  [
    [-0.28, chairZ - 0.24],
    [0.28, chairZ - 0.24],
    [-0.28, chairZ + 0.24],
    [0.28, chairZ + 0.24],
  ].forEach(([cx, cz]) => {
    const cLeg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.44, 0.08), darkWoodMat);
    cLeg.position.set(cx, 0.22, cz);
    cLeg.castShadow = true;
    group.add(cLeg);
  });

  return group;
}

function createPottedPlant(x: number, z: number): THREE.Group {
  const plant = new THREE.Group();
  plant.position.set(x, 0, z);

  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.3, 0.68, 16),
    new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.7 }),
  );
  pot.position.y = 0.34;
  pot.castShadow = true;
  plant.add(pot);

  const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.65 });
  for (let i = 0; i < 6; i += 1) {
    const ang = (i * Math.PI * 2) / 6;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), leafMat);
    leaf.scale.set(1.4, 0.25, 0.65);
    leaf.position.set(Math.cos(ang) * 0.28, 0.85 + (i % 2) * 0.14, Math.sin(ang) * 0.28);
    leaf.rotation.y = -ang;
    leaf.rotation.z = 0.35;
    leaf.castShadow = true;
    plant.add(leaf);
  }
  return plant;
}
