
"use client";

import React, { useEffect, useRef, useState } from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

export const dynamic = "force-dynamic";

const validCards = [
  "2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "0H", "JH", "QH", "KH", "AH",
  "2D", "3D", "4D", "5D", "6D", "7D", "8D", "9D", "0D", "JD", "QD", "KD", "ADi",
  "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "0C", "JC", "QC", "KC", "AC",
  "2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", "0S", "JS", "QS", "KS", "AS",
];

const relWidth = 3.5;
const relHeight = 0.05;
const relDepth = 2.5;
const relModifier = 0.66;


const getCardImage = (card: string): string => `/images/${card}.png`;

const createCard = (
  card: string,
  scene: BABYLON.Scene,
  initialRotation: { x: number; y: number; z: number }
): BABYLON.Mesh | null => {
  try {
    const texturePath = getCardImage(card);

    // Define UV mapping
    const faceUV = [
      new BABYLON.Vector4(1 / 114, 0, 0 / 114, 1), // Side
      new BABYLON.Vector4(2 / 114, 0, 1 / 114, 1), // Side
      new BABYLON.Vector4(3 / 114, 0, 2 / 114, 1), // Side
      new BABYLON.Vector4(4 / 114, 0, 3 / 114, 1), // Side
      new BABYLON.Vector4(59 / 114, 0, 1, 1), // Face of Card (Front)
      new BABYLON.Vector4(59 / 114, 0, 4 / 114, 1), // Back of Card
    ];

    const cardMaterial = new BABYLON.StandardMaterial(`material_${card}`, scene);
    cardMaterial.diffuseTexture = new BABYLON.Texture(texturePath, scene);
    cardMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);

    // Create card mesh
    const cardMesh = BABYLON.MeshBuilder.CreateBox(card, {
        width: relWidth * relModifier,
        height: relHeight * relModifier,
        depth: relDepth * relModifier,
        faceUV: faceUV
    }, scene);

    cardMesh.material = cardMaterial;
    cardMesh.position = new BABYLON.Vector3(0, 0.45, 0);
    cardMesh.rotation = new BABYLON.Vector3(
      initialRotation.x,
      initialRotation.y,
      initialRotation.z
    );
    return cardMesh;
  } catch (error) {
    console.error("Error creating card:", error);
    return null;
  }
};

const addRotationAnimation = (
  mesh: BABYLON.Mesh,
  scene: BABYLON.Scene,
  isAnimating: React.MutableRefObject<boolean>
): void => {
  if (isAnimating.current) return;

  isAnimating.current = true;

  const animation = new BABYLON.Animation(
    "hoverRotation",
    "rotation.y",
    60,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  // Define keyframes for 360-degree rotation
  const keys = [
    { frame: 0, value: mesh.rotation.y }, // Current rotation
    { frame: 60, value: mesh.rotation.y + Math.PI * 2 }, // Full rotation
  ];

  // Add easing with Bezier curve
  const easingFunction = new BABYLON.BezierCurveEase(0.42, 0, 0.58, 1);
  animation.setEasingFunction(easingFunction);

  animation.setKeys(keys);
  mesh.animations = [animation];

  // Start the animation
  const animatable = scene.beginAnimation(mesh, 0, 60, false);
  animatable.onAnimationEnd = () => {
    isAnimating.current = false; // Reset flag when animation ends
  };
};

const Invite: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedCard, setSelectedCard] = useState(
    validCards[Math.floor(Math.random() * validCards.length)]
  );
  const [scene, setScene] = useState<BABYLON.Scene | null>(null);
  const cardMeshRef = useRef<BABYLON.Mesh | null>(null);
  const isAnimating = useRef(false);

  const initialRotation = { x: Math.PI / 32, y: Math.PI / 2, z: Math.PI / 3.7 }; // Custom starting rotation

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    const sceneInstance = new BABYLON.Scene(engine);
    sceneInstance.clearColor = new BABYLON.Color4(0, 0, 0, 0); // Transparent background
    

    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      Math.PI / 2,
      Math.PI / 3,
      5,
      BABYLON.Vector3.Zero(),
      sceneInstance
    );
    camera.attachControl(canvasRef.current, true);
    camera.wheelPrecision = 0; // Disable zoom
    camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
    camera.inputs.removeByType("ArcRotateCameraPointersInput");

    new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0, 1, 0),
      sceneInstance
    );

    setScene(sceneInstance);

    engine.runRenderLoop(() => {
      sceneInstance.render();
    });

    return () => {
      engine.dispose();
    };
  }, []);

  useEffect(() => {
    if (!scene) return;

    // Dispose of the previous card mesh if it exists
    if (cardMeshRef.current) {
      cardMeshRef.current.dispose();
    }

    // Create and assign the new card mesh
    const newCard = createCard(selectedCard, scene, initialRotation);
    if (newCard) {
      cardMeshRef.current = newCard;

      // Add hover effects
      newCard.actionManager = new BABYLON.ActionManager(scene);
      newCard.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPointerOverTrigger,
          () => {
            addRotationAnimation(newCard, scene, isAnimating);
          }
        )
      );
    }
  }, [selectedCard, scene]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100vw", height: "100vh", display: "block" }}
    />
  );
};

export default Invite;