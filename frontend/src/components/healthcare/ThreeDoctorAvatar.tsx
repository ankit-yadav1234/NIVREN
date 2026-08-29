"use client";

import * as React from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface ThreeDoctorAvatarProps {
  speaking: boolean;
  audioLevel?: number;
  className?: string;
  avatarGender?: "male" | "female";
  modelUrl?: string;
}

// Ready Player Me Official High-Fidelity 3D Doctor Models with full ARKit & Oculus Visemes
const DEFAULT_DOCTOR_MODELS = {
  male: "https://models.readyplayer.me/658428383cb2b0ef2161cf2c.glb?morphTargets=ARKit,Oculus+Visemes",
  female: "https://models.readyplayer.me/658428b13cb2b0ef2161cf75.glb?morphTargets=ARKit,Oculus+Visemes",
};

export function ThreeDoctorAvatar({
  speaking,
  audioLevel = 0,
  className = "",
  avatarGender = "male",
  modelUrl,
}: ThreeDoctorAvatarProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [loading, setLoading] = React.useState(true);

  const stateRef = React.useRef({
    speaking: false,
    audioLevel: 0,
    mouse: { x: 0, y: 0 },
    blink: 0,
    nod: 0,
    mouthOpen: 0,
    mouthWide: 0,
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
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 1.85);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 2. Studio Lighting (Warm Key, Cyan Rim & Soft Ambient)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    mainKeyLight.position.set(2.5, 3.5, 3);
    scene.add(mainKeyLight);

    const cyanRimLight = new THREE.DirectionalLight(0x06b6d4, 1.6);
    cyanRimLight.position.set(-2.5, 2.5, -2);
    scene.add(cyanRimLight);

    const softFillLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    softFillLight.position.set(0, -1, 2);
    scene.add(softFillLight);

    // 3. Model Rig & Blendshape Targets
    let headBone: THREE.Bone | THREE.Object3D | null = null;
    let neckBone: THREE.Bone | THREE.Object3D | null = null;
    let leftEyeBone: THREE.Bone | THREE.Object3D | null = null;
    let rightEyeBone: THREE.Bone | THREE.Object3D | null = null;
    const morphMeshes: THREE.SkinnedMesh[] = [];

    const activeModelUrl = modelUrl || DEFAULT_DOCTOR_MODELS[avatarGender];
    const loader = new GLTFLoader();

    loader.load(
      activeModelUrl,
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0, -1.45, 0);
        model.scale.set(1.05, 1.05, 1.05);

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh || (child as THREE.SkinnedMesh).isSkinnedMesh) {
            const mesh = child as THREE.SkinnedMesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
              morphMeshes.push(mesh);
            }
          }
          if (child.type === "Bone" || (child as THREE.Bone).isBone) {
            const name = child.name.toLowerCase();
            if (name.includes("head") && !headBone) headBone = child;
            if (name.includes("neck") && !neckBone) neckBone = child;
            if (name.includes("lefteye") || name.includes("eye_l")) leftEyeBone = child;
            if (name.includes("righteye") || name.includes("eye_r")) rightEyeBone = child;
          }
        });

        scene.add(model);
        setLoading(false);
      },
      undefined,
      (err) => {
        console.warn("Could not load GLB 3D avatar, running visual fallback:", err);
        setLoading(false);
      }
    );

    // 4. Mouse tracking across entire browser window
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -((e.clientY / window.innerHeight) * 2 - 1);
      stateRef.current.mouse.x = Math.max(-1, Math.min(1, normX));
      stateRef.current.mouse.y = Math.max(-1, Math.min(1, normY));
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 5. 60 FPS Real-time Animation Loop
    let animationFrameId: number;
    let nextBlinkTime = 2.0;
    let nextNodTime = 4.0;
    let isBlinking = false;
    let isNodding = false;

    const clock = new THREE.Clock();

    const setMorphValue = (targetNames: string[], value: number) => {
      for (const mesh of morphMeshes) {
        if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) continue;
        for (const name of targetNames) {
          const idx = mesh.morphTargetDictionary[name];
          if (idx !== undefined) {
            mesh.morphTargetInfluences[idx] = value;
          }
        }
      }
    };

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
      setMorphValue(["eyeBlinkLeft", "eyeBlinkRight", "eyesClosed", "blink"], blinkValue);

      // --- 3D Head Tracking (Looking at cursor) ---
      const targetLookX = state.mouse.x * 0.38; // Left / Right head rotation
      const targetLookY = state.mouse.y * 0.26; // Up / Down head tilt
      const targetLookZ = -state.mouse.x * 0.06;

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
      const nodOffset = isNodding ? Math.sin(state.nod * Math.PI * 2) * 0.04 : 0;

      if (headBone) {
        headBone.rotation.y = THREE.MathUtils.lerp(headBone.rotation.y, targetLookX * 0.75, 0.09);
        headBone.rotation.x = THREE.MathUtils.lerp(headBone.rotation.x, targetLookY * 0.75 + nodOffset, 0.09);
        headBone.rotation.z = THREE.MathUtils.lerp(headBone.rotation.z, targetLookZ, 0.09);
      }
      if (neckBone) {
        neckBone.rotation.y = THREE.MathUtils.lerp(neckBone.rotation.y, targetLookX * 0.25, 0.09);
        neckBone.rotation.x = THREE.MathUtils.lerp(neckBone.rotation.x, targetLookY * 0.25, 0.09);
      }

      // Eye gaze tracking
      if (leftEyeBone && rightEyeBone) {
        leftEyeBone.rotation.y = targetLookX * 0.2;
        leftEyeBone.rotation.x = targetLookY * 0.2;
        rightEyeBone.rotation.y = targetLookX * 0.2;
        rightEyeBone.rotation.x = targetLookY * 0.2;
      }

      // --- Real-time Lip-Sync with Visemes & Morph Targets ---
      if (state.speaking) {
        const wave1 = Math.sin(elapsedTime * 18) * 0.5 + 0.5;
        const wave2 = Math.cos(elapsedTime * 12) * 0.5 + 0.5;
        const intensity = 0.5 + (state.audioLevel > 0 ? state.audioLevel * 0.5 : 0.4);

        const openVal = wave1 * intensity * 0.85;
        const wideVal = wave2 * intensity * 0.45;

        setMorphValue(["jawOpen", "mouthOpen", "viseme_aa", "viseme_O"], openVal);
        setMorphValue(["mouthSmileLeft", "mouthSmileRight", "viseme_E", "viseme_I"], wideVal);
        setMorphValue(["viseme_U", "mouthPucker"], (1 - wave2) * 0.3);
      } else {
        setMorphValue(["jawOpen", "mouthOpen", "viseme_aa", "viseme_O", "viseme_E", "viseme_I", "viseme_U", "mouthPucker"], 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [avatarGender, modelUrl]);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden ${className}`}
      aria-label="Realistic 3D Interactive Doctor Avatar"
    >
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xs">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <span className="mt-2 text-[9px] font-bold uppercase tracking-widest text-cyan-300">Loading 3D Doctor…</span>
        </div>
      )}
    </div>
  );
}
