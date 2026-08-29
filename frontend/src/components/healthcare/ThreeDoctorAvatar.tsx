"use client";

import * as React from "react";
import * as THREE from "three";

interface ThreeDoctorAvatarProps {
  speaking: boolean;
  audioLevel?: number;
  className?: string;
  avatarGender?: "male" | "female";
}

export function ThreeDoctorAvatar({
  speaking,
  audioLevel = 0,
  className = "",
  avatarGender = "male",
}: ThreeDoctorAvatarProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const stateRef = React.useRef({
    speaking: false,
    audioLevel: 0,
    mouse: { x: 0, y: 0 },
    blink: 0,
    nod: 0,
    mouthOpen: 0,
    mouthWide: 0,
    eyeLook: { x: 0, y: 0 },
    time: 0,
  });

  React.useEffect(() => {
    stateRef.current.speaking = speaking;
  }, [speaking]);

  React.useEffect(() => {
    stateRef.current.audioLevel = audioLevel;
  }, [audioLevel]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.45, 2.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 2. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xfff5ea, 1.6);
    mainKeyLight.position.set(2, 3, 2.5);
    scene.add(mainKeyLight);

    const cyanRimLight = new THREE.DirectionalLight(0x06b6d4, 1.4);
    cyanRimLight.position.set(-2.5, 2, -1.5);
    scene.add(cyanRimLight);

    const softFillLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
    softFillLight.position.set(0, -1.5, 2);
    scene.add(softFillLight);

    // 3. Materials
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: avatarGender === "male" ? 0xdcb295 : 0xe4be9e,
      roughness: 0.58,
      metalness: 0.05,
    });

    const lipsMaterial = new THREE.MeshStandardMaterial({
      color: avatarGender === "male" ? 0xb86b62 : 0xc75c62,
      roughness: 0.35,
      metalness: 0.08,
    });

    const teethMaterial = new THREE.MeshStandardMaterial({
      color: 0xfdfdfd,
      roughness: 0.15,
      metalness: 0.1,
    });

    const mouthInsideMaterial = new THREE.MeshBasicMaterial({
      color: 0x3d0b0f,
    });

    const eyesWhiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xf4f8fa,
      roughness: 0.1,
      metalness: 0.05,
    });

    const irisMaterial = new THREE.MeshStandardMaterial({
      color: 0x244252, // Deep intelligent hazel/blue
      roughness: 0.15,
      metalness: 0.15,
    });

    const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x080808 });

    const hairMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e1e24, // Neat dark styled hair
      roughness: 0.75,
      metalness: 0.1,
    });

    const suitMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Slate Executive Navy Suit
      roughness: 0.7,
      metalness: 0.15,
    });

    const shirtMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Crisp White Doctor Shirt
      roughness: 0.6,
      metalness: 0.05,
    });

    const tieMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Medical Cyan / Blue Silk Tie
      roughness: 0.4,
      metalness: 0.25,
    });

    const stethoscopeMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.8,
    });

    // 4. Character Hierarchy Groups
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);

    const bodyGroup = new THREE.Group();
    avatarGroup.add(bodyGroup);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.42, 0);
    avatarGroup.add(headGroup);

    // --- Head & Face Base Mesh ---
    const headGeom = new THREE.SphereGeometry(0.44, 32, 32);
    headGeom.scale(0.88, 1.15, 0.95);
    const headMesh = new THREE.Mesh(headGeom, skinMaterial);
    headGroup.add(headMesh);

    // --- Neck ---
    const neckGeom = new THREE.CylinderGeometry(0.18, 0.22, 0.35, 24);
    const neckMesh = new THREE.Mesh(neckGeom, skinMaterial);
    neckMesh.position.set(0, -0.4, -0.05);
    headGroup.add(neckMesh);

    // --- Hair ---
    const hairGeom = new THREE.SphereGeometry(0.46, 24, 24);
    hairGeom.scale(0.92, 1.05, 0.98);
    const hairMesh = new THREE.Mesh(hairGeom, hairMaterial);
    hairMesh.position.set(0, 0.12, -0.06);
    headGroup.add(hairMesh);

    // Hair styling top quiff
    const quiffGeom = new THREE.BoxGeometry(0.48, 0.18, 0.45);
    const quiffMesh = new THREE.Mesh(quiffGeom, hairMaterial);
    quiffMesh.position.set(0, 0.44, 0.08);
    quiffMesh.rotation.x = 0.15;
    headGroup.add(quiffMesh);

    // --- Eyes Assembly (Left & Right) ---
    const createEye = (isRight: boolean) => {
      const eyeGroup = new THREE.Group();
      const posX = isRight ? 0.16 : -0.16;
      eyeGroup.position.set(posX, 0.08, 0.34);

      // Eye White Ball
      const eyeWhiteGeom = new THREE.SphereGeometry(0.082, 20, 20);
      const eyeWhiteMesh = new THREE.Mesh(eyeWhiteGeom, eyesWhiteMaterial);
      eyeGroup.add(eyeWhiteMesh);

      // Iris
      const irisGeom = new THREE.CylinderGeometry(0.046, 0.046, 0.02, 20);
      irisGeom.rotateX(Math.PI / 2);
      const irisMesh = new THREE.Mesh(irisGeom, irisMaterial);
      irisMesh.position.set(0, 0, 0.075);
      eyeGroup.add(irisMesh);

      // Pupil
      const pupilGeom = new THREE.CylinderGeometry(0.022, 0.022, 0.022, 16);
      pupilGeom.rotateX(Math.PI / 2);
      const pupilMesh = new THREE.Mesh(pupilGeom, pupilMaterial);
      pupilMesh.position.set(0, 0, 0.082);
      eyeGroup.add(pupilMesh);

      // Upper Eyelid for Blinking
      const eyelidGeom = new THREE.SphereGeometry(0.086, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2);
      const upperEyelid = new THREE.Mesh(eyelidGeom, skinMaterial);
      upperEyelid.rotation.x = -Math.PI / 2; // Open by default
      eyeGroup.add(upperEyelid);

      // Eyebrow
      const browGeom = new THREE.BoxGeometry(0.13, 0.024, 0.04);
      const browMesh = new THREE.Mesh(browGeom, hairMaterial);
      browMesh.position.set(0, 0.11, 0.06);
      browMesh.rotation.z = isRight ? -0.1 : 0.1;
      eyeGroup.add(browMesh);

      return { eyeGroup, upperEyelid, irisMesh, pupilMesh, browMesh };
    };

    const leftEye = createEye(false);
    const rightEye = createEye(true);
    headGroup.add(leftEye.eyeGroup);
    headGroup.add(rightEye.eyeGroup);

    // --- Nose ---
    const noseGeom = new THREE.ConeGeometry(0.06, 0.16, 16);
    noseGeom.rotateX(-Math.PI / 8);
    const noseMesh = new THREE.Mesh(noseGeom, skinMaterial);
    noseMesh.position.set(0, -0.04, 0.42);
    headGroup.add(noseMesh);

    // --- Dynamic Mouth & Lips Structure ---
    const mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, -0.21, 0.35);
    headGroup.add(mouthGroup);

    // Mouth cavity interior
    const mouthCavityGeom = new THREE.BoxGeometry(0.18, 0.12, 0.1);
    const mouthCavity = new THREE.Mesh(mouthCavityGeom, mouthInsideMaterial);
    mouthCavity.position.set(0, 0, -0.04);
    mouthGroup.add(mouthCavity);

    // Teeth upper & lower
    const upperTeethGeom = new THREE.BoxGeometry(0.14, 0.024, 0.04);
    const upperTeeth = new THREE.Mesh(upperTeethGeom, teethMaterial);
    upperTeeth.position.set(0, 0.025, 0.01);
    mouthGroup.add(upperTeeth);

    const lowerTeethGeom = new THREE.BoxGeometry(0.13, 0.022, 0.04);
    const lowerTeeth = new THREE.Mesh(lowerTeethGeom, teethMaterial);
    lowerTeeth.position.set(0, -0.025, 0.01);
    mouthGroup.add(lowerTeeth);

    // Upper Lip
    const upperLipGeom = new THREE.CylinderGeometry(0.022, 0.022, 0.16, 16);
    upperLipGeom.rotateZ(Math.PI / 2);
    const upperLip = new THREE.Mesh(upperLipGeom, lipsMaterial);
    upperLip.position.set(0, 0.028, 0.035);
    mouthGroup.add(upperLip);

    // Lower Lip
    const lowerLipGeom = new THREE.CylinderGeometry(0.026, 0.026, 0.15, 16);
    lowerLipGeom.rotateZ(Math.PI / 2);
    const lowerLip = new THREE.Mesh(lowerLipGeom, lipsMaterial);
    lowerLip.position.set(0, -0.028, 0.035);
    mouthGroup.add(lowerLip);

    // --- Body / Doctor Attire ---
    // Shoulders & Chest
    const torsoGeom = new THREE.CylinderGeometry(0.52, 0.65, 0.95, 24);
    torsoGeom.scale(1.2, 1, 0.65);
    const torsoMesh = new THREE.Mesh(torsoGeom, suitMaterial);
    torsoMesh.position.set(0, -0.65, -0.05);
    bodyGroup.add(torsoMesh);

    // White Inner Shirt Collar V
    const shirtGeom = new THREE.ConeGeometry(0.24, 0.45, 4);
    shirtGeom.rotateZ(Math.PI);
    shirtGeom.scale(1, 1, 0.2);
    const shirtMesh = new THREE.Mesh(shirtGeom, shirtMaterial);
    shirtMesh.position.set(0, -0.32, 0.18);
    bodyGroup.add(shirtMesh);

    // Blue Tie
    const tieGeom = new THREE.BoxGeometry(0.075, 0.38, 0.03);
    const tieMesh = new THREE.Mesh(tieGeom, tieMaterial);
    tieMesh.position.set(0, -0.42, 0.2);
    bodyGroup.add(tieMesh);

    // Stethoscope around neck
    const stethTorusGeom = new THREE.TorusGeometry(0.24, 0.018, 12, 24, Math.PI);
    const stethMesh = new THREE.Mesh(stethTorusGeom, stethoscopeMaterial);
    stethMesh.position.set(0, -0.22, 0.12);
    stethMesh.rotation.x = Math.PI / 2.3;
    bodyGroup.add(stethMesh);

    // 5. Mouse tracking interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      stateRef.current.mouse.x = Math.max(-1, Math.min(1, normX));
      stateRef.current.mouse.y = Math.max(-1, Math.min(1, normY));
    };
    window.addEventListener("mousemove", handleMouseMove);

    // 6. 60 FPS Real-time Animation Loop
    let animationFrameId: number;
    let nextBlinkTime = 2.0;
    let nextNodTime = 4.0;
    let isBlinking = false;
    let isNodding = false;

    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      stateRef.current.time = elapsedTime;

      const state = stateRef.current;

      // --- Eye Blinking Logic (Every 3-5 seconds) ---
      if (elapsedTime > nextBlinkTime) {
        isBlinking = true;
        state.blink += delta * 12;
        if (state.blink >= 1) {
          state.blink = 0;
          isBlinking = false;
          nextBlinkTime = elapsedTime + 2.5 + Math.random() * 3.5;
        }
      }

      const blinkValue = isBlinking ? Math.sin(state.blink * Math.PI) : 0;
      leftEye.upperEyelid.rotation.x = -Math.PI / 2 + blinkValue * (Math.PI / 2.1);
      rightEye.upperEyelid.rotation.x = -Math.PI / 2 + blinkValue * (Math.PI / 2.1);

      // --- Head Tracking & Idle Sway ---
      const targetLookX = state.mouse.x * 0.18;
      const targetLookY = state.mouse.y * 0.12;

      // Natural breathing sway
      const breathSway = Math.sin(elapsedTime * 1.8) * 0.015;
      bodyGroup.position.y = breathSway;

      // Listening Head Nod when user speaks
      if (!state.speaking && elapsedTime > nextNodTime) {
        isNodding = true;
        state.nod += delta * 4;
        if (state.nod >= 1) {
          state.nod = 0;
          isNodding = false;
          nextNodTime = elapsedTime + 3.0 + Math.random() * 4.0;
        }
      }
      const nodOffset = isNodding ? Math.sin(state.nod * Math.PI * 2) * 0.05 : 0;

      headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetLookX, 0.08);
      headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, targetLookY + nodOffset, 0.08);
      headGroup.rotation.z = Math.sin(elapsedTime * 1.2) * 0.02;

      // --- Real-time Lip-Sync & Visemes Morphing ---
      if (state.speaking) {
        // Dynamic multi-phoneme synthesis (A, O, E, M mouth shapes oscillating realistically)
        const primaryWave = Math.sin(elapsedTime * 18) * 0.5 + 0.5;
        const secondaryWave = Math.cos(elapsedTime * 11) * 0.5 + 0.5;
        const speechIntensity = 0.4 + (state.audioLevel > 0 ? state.audioLevel * 0.6 : 0.45);

        const targetMouthOpen = primaryWave * speechIntensity * 0.14;
        const targetMouthWide = (secondaryWave - 0.5) * 0.05;

        state.mouthOpen = THREE.MathUtils.lerp(state.mouthOpen, targetMouthOpen, 0.25);
        state.mouthWide = THREE.MathUtils.lerp(state.mouthWide, targetMouthWide, 0.25);

        // Lower jaw / lip opens and closes
        lowerLip.position.y = -0.028 - state.mouthOpen;
        lowerTeeth.position.y = -0.025 - state.mouthOpen * 0.7;

        // Upper lip subtly lifts
        upperLip.position.y = 0.028 + state.mouthOpen * 0.25;
        upperTeeth.position.y = 0.025 + state.mouthOpen * 0.15;

        // Mouth cavity scales
        mouthCavity.scale.y = 1 + state.mouthOpen * 16;
        mouthCavity.scale.x = 1 + state.mouthWide;

        // Active speech head gesture
        headGroup.position.y = 0.42 + Math.sin(elapsedTime * 8) * 0.008;
      } else {
        // Completely closed mouth when listening
        state.mouthOpen = THREE.MathUtils.lerp(state.mouthOpen, 0, 0.3);
        lowerLip.position.y = -0.028;
        upperLip.position.y = 0.028;
        lowerTeeth.position.y = -0.025;
        upperTeeth.position.y = 0.025;
        mouthCavity.scale.set(1, 1, 1);
        headGroup.position.y = 0.42;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [avatarGender]);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden ${className}`}
      aria-label="3D Live Interactive Doctor Avatar"
    />
  );
}
