"use client";


import React, { useState, useEffect } from 'react';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { HotKeys } from 'react-hotkeys';
import PokerGUI from '@components/PokerGUI';
import DebugPanel from '@components/DebugPanel';

export const dynamic = 'force-dynamic';


type Card = string;
type Mesh = BABYLON.Mesh;
type Scene = BABYLON.Scene;

interface SceneConfig {
  camera: {
      alpha: number;
      beta: number;
      radius: number;
      wheelPrecision: number;
      position?: {
          x: number;
          y: number;
          z: number;
      };
  };
  cows: Array<{
      name: string;
      position: [number, number, number];
      rotation: [number, number, number];
      scale: [number, number, number];
  }>;
  cards: Array<{
      name: string;
      position: [number, number, number];
      rotation: [number, number, number];
      scale: [number, number, number];
  }>;
}


interface LoadingOverlayProps {
  loading: boolean;
}




const PokerFrogs: React.FC = () => {
    const [sliderValue, setSliderValue] = useState<number>(50);
    const [blind] = useState<number>(200);
    const [hands, setHands] = useState<Card[][]>([]);
    const [community, setCommunity] = useState<Card[]>([]);
    const [cardNames, setCardNames] = useState<string[]>([]);
    const [scene, setScene] = useState<Scene | null>(null);
    const [isSceneReady, setIsSceneReady] = useState<boolean>(false);
    const [sceneConfig] = useState<SceneConfig | null>(null);
    const [showOverlay, setShowOverlay] = useState(true);





// Logging functions
    const logMeshDetails = (mesh: Mesh) => {
        console.log(`Mesh: ${mesh.name}`);
        console.log(`Position: ${mesh.position}`);
        console.log(`Rotation: ${mesh.rotation}`);
        console.log(`Scale: ${mesh.scaling}`);
        console.log(`Material: ${mesh.material}`);
    };

    const logAllMeshes = (scene: Scene) => {
      scene.meshes.forEach((mesh) => {
          if (mesh instanceof BABYLON.Mesh) {
              logMeshDetails(mesh);
          }
        });
    };

    const logCameraInfo = (scene: Scene) => {
      if (!scene) {
          console.error("Scene is not initialized.");
          return;
      }
  
      if (!scene.activeCamera) {
          console.error("No active camera found in the scene.");
          return;
      }
  
      console.clear();
      const camera = scene.activeCamera;
  
      // Check if the camera has a rotation property
      if ('rotation' in camera) {
        const cameraPosition = camera.position;
        const cameraRotation = (camera as BABYLON.FreeCamera).rotation;

        console.log(`Camera World Position: (${cameraPosition.x.toFixed(2)}, ${cameraPosition.y.toFixed(2)}, ${cameraPosition.z.toFixed(2)})`);
        console.log(`Camera Rotation: (${cameraRotation.x.toFixed(2)}, ${cameraRotation.y.toFixed(2)}, ${cameraRotation.z.toFixed(2)})`);
      }
      if (camera instanceof BABYLON.ArcRotateCamera) {
        const arcCamera = camera as BABYLON.ArcRotateCamera;
        console.log(`Camera World Position: (${arcCamera.position.x.toFixed(2)}, ${arcCamera.position.y.toFixed(2)}, ${arcCamera.position.z.toFixed(2)})`);
        console.log(`Alpha: ${arcCamera.alpha.toFixed(2)}`);
        console.log(`Beta: ${arcCamera.beta.toFixed(2)}`);
        console.log(`Radius: ${arcCamera.radius.toFixed(2)}`);
        console.log(`Wheel Precision: ${arcCamera.wheelPrecision.toFixed(2)}`);
      } else {
        const cameraPosition = camera.position;
        console.log(`Camera World Position: (${cameraPosition.x.toFixed(2)}, ${cameraPosition.y.toFixed(2)}, ${cameraPosition.z.toFixed(2)})`);
        console.log("This camera type does not have a rotation property or alpha/beta/radius properties.");
      }

    };

    

// Cards and dealing
    const validCards = [
      '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', '0H', 'JH', 'QH', 'KH', 'AH',
      '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', '0D', 'JD', 'QD', 'KD', 'AD',
      '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', '0C', 'JC', 'QC', 'KC', 'AC',
      '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', '0S', 'JS', 'QS', 'KS', 'AS',
    ];
    const deck = validCards;
    
    const shuffle = (array: string[]): string[] => {
        let currentIndex = array.length;
        while (currentIndex !== 0) {
            const randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    };
    
    const draw = (cards: string[]): string | undefined => cards.shift();
    
    const drawHand = (cards: string[]): string[] => {
      const hand = [draw(cards), draw(cards)];
      return hand.filter((card): card is string => card !== undefined); // Ensure valid cards
    };
  

// Gameplay 
    const initializeGame = () => {
      if (!deck.length) {
          console.error("Deck is empty. Unable to initialize the game.");
          return;
      }

      if (!scene) {
        console.error("Scene is not initialized.");
        return;
      }
  
      try {
          console.log("Starting game initialization...");
          
          // Cleanup existing card meshes
          if (scene) {
              console.log("Scene meshes before initializeGame cleanup:", scene.meshes.map(mesh => mesh.name));
              scene.meshes.forEach((mesh) => {
                // Helper function to identify card meshes
                const isCardMesh = (name: string): boolean => {
                  // Adjust logic based on how card names are dynamically set
                  return /^[2-9TJQKA][CDHS]$/.test(name); // Matches card names like "2H", "7S", etc.
                };  
                if (isCardMesh(mesh.name)) {
                    console.log(`Disposing card mesh: ${mesh.name}`);
                    mesh.dispose(true, true);
                  }
              });

              console.log("Scene meshes after initializeGame cleanup:", scene.meshes.map(mesh => mesh.name));

              // Reset hands and community after cleanup
              setHands([]);
              setCommunity([]);
            
          } else {
              console.error("Scene is not available for cleanup.");
          }

          


          // Shuffle deck and deal cards
          const shuffledDeck = shuffle([...deck]);
          const dealtHands = Array.from({ length: 5 }, () => drawHand(shuffledDeck));
          const communityCards = shuffledDeck.slice(0, 5);
  
          // Set state for hands and community cards
          setHands(dealtHands);
          setCommunity(communityCards);

          // Combine hands and community cards into a single array for card names
          const newCardNames = [...dealtHands.flat(), ...communityCards];
          setCardNames(newCardNames);

          console.log("Dealt hands:", dealtHands);
          console.log("Community cards:", communityCards);
          console.log("Set card names:", newCardNames);

  
          // Dynamically assign card names to the scene configuration
          const updatedSceneConfig = assignCardNamesDynamically(
              hardcodedSceneConfig,
              dealtHands,
              communityCards
          );
  
          console.log("Updated SceneConfig:", updatedSceneConfig);
  
          // Update the scene with the dealt cards
          if (scene) {
              updateSceneWithCards(scene, dealtHands, communityCards, updatedSceneConfig);
          } else {
              console.error("Scene is not available during initialization.");
          }

          console.log("Game initialized successfully.");
      } catch (error) {
          console.error("Error during game initialization:", error);
      }
    };
  
    const LoadingOverlay = ({ loading }: LoadingOverlayProps) => {
      return (
          <div
              className={`loading-overlay ${loading ? "" : "hidden"}`}
              style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "black",
                  zIndex: 1000,
              }}
          />
      );
    };
  
    const handleInitializeGameClick = () => {
      console.log("Initialize Game button clicked");
      setShowOverlay(false); // Hide the overlay
      initializeGame(); // Start the game logic
    };
  

    
// GUI functionality
    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSliderValue(parseInt(event.target.value));
    };
  
    const increaseBet = () => {
        setSliderValue(prevValue => Math.min(prevValue + 100, 1000));
    };

    const decreaseBet = () => {
        setSliderValue(prevValue => Math.max(prevValue - 100, blind));
    };

    const getCurrentCardNames = (): string[] => {
      const cardNames: string[] = [];
      hands.forEach((hand) => cardNames.push(...hand));
      cardNames.push(...community);
  
      console.log("Combined card names for current hand:", cardNames);
      return cardNames;
    };
  
  
    
// Scene management
    const hardcodedSceneConfig: SceneConfig = {
      camera: {
        alpha: -8.35,
        beta: 1,
        radius: 0.75,
        wheelPrecision: 125,
        position: {
            x: -1,
            y: 1.7,
            z: -2,
        },
      },
      cows: [
        {
            "name": "Cow1",
            "position": [
                -2.31,
                0,
                1.24
            ],
            "rotation": [
                0,
                -1.57,
                0
            ],
            "scale": [
                0.25,
                0.25,
                0.25
            ]
        },
        {
            "name": "Cow2",
            "position": [
                0.02,
                0,
                2.75
            ],
            "rotation": [
                0,
                -0.15,
                0
            ],
            "scale": [
                0.25,
                0.25,
                0.25
            ]
        },
        {
            "name": "Cow3",
            "position": [
                1.73,
                0,
                2.68
            ],
            "rotation": [
                0,
                0.15,
                0
            ],
            "scale": [
                0.25,
                0.25,
                0.25
            ]
        },
        {
            "name": "Cow4",
            "position": [
                2.96,
                0,
                1.32
            ],
            "rotation": [
                0,
                1.57,
                0
            ],
            "scale": [
                0.25,
                0.25,
                0.25
            ]
        }
      ],
      cards: [
        {
            "name": "card_1",
            "position": [
                -0.189,
                0,
                -0.034
            ],
            "rotation": [
                0.04,
                -1.5201,
                3.1416
            ],
            "scale": [
                1.0000001854183471,
                0.999999782712439,
                1.0000001183916423
            ]
        },
        {
            "name": "card_2",
            "position": [
                0.106,
                0,
                -0.05
            ],
            "rotation": [
                0.0236,
                -1.3562,
                3.1416
            ],
            "scale": [
                1.000000173071773,
                1.000000134919915,
                1.0000003204145689
            ]
        },
        {
            "name": "card_3",
            "position": [
                -1.618,
                0,
                1.156
            ],
            "rotation": [
                0,
                -2.7738,
                0
            ],
            "scale": [
                0.9999999595323771,
                1,
                0.9999999595323771
            ]
        },
        {
            "name": "card_4",
            "position": [
                -1.55,
                0,
                1.549
            ],
            "rotation": [
                0,
                3.1416,
                0
            ],
            "scale": [
                1,
                1,
                1
            ]
        },
        {
            "name": "card_5",
            "position": [
                -0.187,
                0,
                2.091
            ],
            "rotation": [
                0,
                -1.3146,
                0
            ],
            "scale": [
                1.000000012665419,
                1,
                1.000000012665419
            ]
        },
        {
            "name": "card_6",
            "position": [
                0.142,
                0,
                2.104
            ],
            "rotation": [
                0,
                -1.9379,
                0
            ],
            "scale": [
                1.000000150683327,
                1,
                1.000000150683327
            ]
        },
        {
            "name": "card_7",
            "position": [
                1.424,
                0,
                2.151
            ],
            "rotation": [
                0,
                1.553,
                0
            ],
            "scale": [
                1.0000001742299018,
                1,
                1.0000001742299018
            ]
        },
        {
            "name": "card_8",
            "position": [
                1.723,
                0,
                2.085
            ],
            "rotation": [
                0,
                -1.807,
                0
            ],
            "scale": [
                0.9999998488164599,
                1,
                0.9999998488164599
            ]
        },
        {
            "name": "card_9",
            "position": [
                2.372,
                0,
                1.496
            ],
            "rotation": [
                0,
                3.1416,
                0
            ],
            "scale": [
                1,
                1,
                1
            ]
        },
        {
            "name": "card_10",
            "position": [
                2.35,
                0,
                1.161
            ],
            "rotation": [
                0,
                3.1416,
                0
            ],
            "scale": [
                1,
                1,
                1
            ]
        },
        {
            "name": "card_11",
            "position": [
                -0.583,
                0.046,
                0.939
            ],
            "rotation": [
                0,
                1.5887,
                0
            ],
            "scale": [
                1.000000268770012,
                1,
                1.000000268770012
            ]
        },
        {
            "name": "card_12",
            "position": [
                -0.222,
                0,
                1.009
            ],
            "rotation": [
                0,
                -1.5758,
                0
            ],
            "scale": [
                0.9999999701966147,
                1,
                0.9999999701966147
            ]
        },
        {
            "name": "card_13",
            "position": [
                0.106,
                0,
                1.003
            ],
            "rotation": [
                0,
                -1.596,
                0
            ],
            "scale": [
                1.0000000298343323,
                1,
                1.0000000298343323
            ]
        },
        {
            "name": "card_14",
            "position": [
                0.477,
                0,
                1
            ],
            "rotation": [
                0,
                -1.5841,
                0
            ],
            "scale": [
                1.0000000347703584,
                1,
                1.0000000347703584
            ]
        },
        {
            "name": "card_15",
            "position": [
                0.837,
                0,
                1
            ],
            "rotation": [
                0,
                -1.5705,
                0
            ],
            "scale": [
                1.0000001706241837,
                1,
                1.0000001706241837
            ]
        }
      ],
    };
    const loadCardDataFromScene = (scene: BABYLON.Scene): void => {
      const cards = hardcodedSceneConfig.cards;
  
      if (cards.length < 15) {
          console.error("Not enough cards in the configuration to create card meshes.");
          return;
      }
  
      console.log("Loading card data...");
  
      // Clear old card meshes from the scene
      console.log("Scene meshes before loadCardDataFromScene cleanup:", scene.meshes.map(mesh => mesh.name));
      scene.meshes.forEach((mesh) => {
          // Helper function to identify card meshes
          const isCardMesh = (name: string): boolean => {
            // Adjust logic based on how card names are dynamically set
            return /^[2-9TJQKA][CDHS]$/.test(name); // Matches card names like "2H", "7S", etc.
          };  
          if (isCardMesh(mesh.name)) {
              console.log(`Disposing card mesh: ${mesh.name}`);
              mesh.dispose(true, true);
            }
      });
      console.log("Scene meshes after loadCardDataFromScene cleanup:", scene.meshes.map(mesh => mesh.name));
      // Reset hands and community after cleanup
      setHands([]);
      setCommunity([]);

  
      // Iterate through the configuration and create cards
      cards.forEach((cardConfig, index) => {
          const { name, position, rotation, scale } = cardConfig;
  
          if (!validCards.includes(name)) {
              console.warn(`Invalid card name: ${name}. Using default texture.`);
              return; // Skip invalid cards
          }
  
          console.log(`Creating card: ${name} at index ${index}`);
          const cardMesh = createCard(name, scene, position, rotation, scale);
          if (cardMesh) {
            logMeshDetails(cardMesh); // Log the created card
          }
          else {
              console.error(`Failed to create card: ${name} at index ${index}.`);
          }
      });
  
      console.log("All cards loaded into the scene.");
    };
  
    const updateSceneWithCards = (
      scene: BABYLON.Scene,
      hands: string[][],
      community: string[],
      sceneConfig: SceneConfig
  ): void => {
      console.log("Starting scene update with cards using sceneConfig:", sceneConfig);
      console.log("SceneConfig:", sceneConfig);
  
      // Log existing meshes in the scene
      scene.meshes.forEach((mesh) => console.log("Existing mesh:", mesh.name));
  
      // Clear existing card meshes
      if (scene && scene.meshes) {
        console.log("Scene meshes before cleanup:", scene.meshes.map(mesh => mesh.name));
        scene.meshes.forEach((mesh) => {
          // Helper function to identify card meshes
          const isCardMesh = (name: string): boolean => {
            // Adjust logic based on how card names are dynamically set
            return /^[2-9TJQKA][CDHS]$/.test(name); // Matches card names like "2H", "7S", etc.
          };  
          if (isCardMesh(mesh.name)) {
              console.log(`Disposing card mesh: ${mesh.name}`);
              mesh.dispose(true, true);
            }
        });
        console.log("Scene meshes after cleanup:", scene.meshes.map(mesh => mesh.name));
        
        // Reset hands and community after cleanup
        setHands([]);
        setCommunity([]);
      } else {
          console.error("Scene or its meshes are not available for cleanup.");
      }

    
      // Combine all cards from hands and community
      const allCards = [...hands.flat(), ...community];
      console.log("Cards to place:", allCards);
  
      // Check if the number of cards matches the configuration
      if (allCards.length > sceneConfig.cards.length) {
          console.error(
              `Not enough positions defined in sceneConfig for all cards. Expected: ${sceneConfig.cards.length}, Got: ${allCards.length}`
          );
          return;
      }
  
      // Iterate over cards and create meshes
      sceneConfig.cards.forEach((cardConfig, index) => {
          const { position, rotation, scale } = cardConfig;
          const cardName = allCards[index];
  
          if (!cardName) {
              console.warn(`No card name available for index ${index}. Skipping card creation.`);
              return;
          }
  
          console.log(`Creating card: ${cardName} at index ${index} with position:`, position);
  
          const cardMesh = createCard(cardName, scene, position, rotation, scale);
  
          if (!cardMesh) {
              console.error(`Failed to create card for ${cardName} at index ${index}.`);
          } else {
              console.log(`Card created successfully: ${cardName}, Material: ${cardMesh.material}`);
          }
      });
  
      console.log("All cards placed in the scene.");
    };
  
    const createDefaultScene = (scene: BABYLON.Scene): void => {
      const canvas = scene.getEngine().getRenderingCanvas();
      const camera = new BABYLON.ArcRotateCamera("defaultCamera", 0, 0, 10, BABYLON.Vector3.Zero(), scene);
      camera.attachControl(canvas, true);
      camera.alpha = -8.35;
      camera.beta = 1;
      camera.radius = 1;
      camera.wheelPrecision = 125;
      scene.activeCamera = camera; // Ensure the camera is assigned to the scene's activeCamera
  
      const light = new BABYLON.DirectionalLight("directionalLight", new BABYLON.Vector3(-1, -1, -1), scene);
      light.intensity = 0.5;
  
      const ground = BABYLON.MeshBuilder.CreateGround("defaultGround", { width: 50, height: 50 }, scene);
      ground.position = new BABYLON.Vector3(0, -2, 0);
      ground.receiveShadows = true;
      const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
      groundMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.2);
      ground.material = groundMaterial;

  
      setIsSceneReady(true);
    };
  
    const loadSceneStateAsync = async (
      scene: BABYLON.Scene,
      sceneId: number
  ): Promise<void> => {
      try {
          // const apiBaseUrl = window.location.hostname === 'localhost'
          //     ? 'http://localhost:4242'
          //     : 'https://your-production-url.com';
  
          // Fetch the scene configuration from the API
          // const response = await axios.get(`${apiBaseUrl}/api/scene/${sceneId}`);
          // const sceneConfig: SceneConfig = response.data;
          const sceneConfig = hardcodedSceneConfig;
  
          if (!sceneConfig) {
              throw new Error("Scene configuration is null");
          }
  
          console.log("Loading scene configuration:", sceneConfig);
  
          // Ensure a camera exists in the scene
        if (!scene.activeCamera) {
          const canvas = scene.getEngine().getRenderingCanvas();
          const cameraConfig = sceneConfig.camera;

          const newCamera = new BABYLON.ArcRotateCamera(
              "myCamera",
              cameraConfig.alpha ?? -8.35,
              cameraConfig.beta ?? 1,
              cameraConfig.radius ?? 1,
              cameraConfig.position
                  ? new BABYLON.Vector3(
                        cameraConfig.position.x,
                        cameraConfig.position.y,
                        cameraConfig.position.z
                    )
                  : new BABYLON.Vector3(0, 0, 0),
              scene
          );

          newCamera.attachControl(canvas, true);
          newCamera.wheelPrecision = cameraConfig.wheelPrecision || 100;

          if (cameraConfig.position) {
              newCamera.setPosition(
                  new BABYLON.Vector3(
                      cameraConfig.position.x,
                      cameraConfig.position.y,
                      cameraConfig.position.z
                  )
              );
          }

            scene.activeCamera = newCamera;
          }

          // Set camera properties from sceneConfig
          const camera = scene.activeCamera;
          if (camera && camera instanceof BABYLON.ArcRotateCamera) {
            camera.alpha = hardcodedSceneConfig.camera.alpha;
            camera.beta = hardcodedSceneConfig.camera.beta;
            camera.radius = hardcodedSceneConfig.camera.radius;
            camera.wheelPrecision = hardcodedSceneConfig.camera.wheelPrecision;

            // Update position if defined in sceneConfig
            if (hardcodedSceneConfig.camera.position) {
                camera.setPosition(
                    new BABYLON.Vector3(
                        hardcodedSceneConfig.camera.position.x,
                        hardcodedSceneConfig.camera.position.y,
                        hardcodedSceneConfig.camera.position.z
                    )
                );
            }
          }


  
          // Remove old meshes before loading new ones
          scene.meshes.forEach((mesh) => {
              if (mesh.name !== "myGround" && mesh.name !== "defaultGround") {
                  mesh.dispose();
              }
          });
          console.log("Old meshes removed");
  
          // Load cows from the scene configuration
          for (const cowConfig of sceneConfig.cows) {
              await createCow(cowConfig.name, cowConfig.position, cowConfig.rotation, cowConfig.scale, scene);
          }
  
          // Load cards from the scene configuration
          loadCardDataFromScene(scene);
  
          // Set up lighting and ground
          const light = new BABYLON.DirectionalLight("directionalLight", new BABYLON.Vector3(-1, -1, -1), scene);
          light.intensity = 0.5;
  
          const ground = BABYLON.MeshBuilder.CreateGround("defaultGround", { width: 50, height: 50 }, scene);
          ground.position = new BABYLON.Vector3(0, -2, 0);
          ground.receiveShadows = true;
          // Explicitly type the material as StandardMaterial
          const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
          groundMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.2);
          ground.material = groundMaterial;
          ground.isPickable = false;
  
          // Set up gizmos and event listeners
          const utilLayer = new BABYLON.UtilityLayerRenderer(scene);
          const positionGizmo = new BABYLON.PositionGizmo(utilLayer);
          const rotationGizmo = new BABYLON.RotationGizmo(utilLayer);
          const scaleGizmo = new BABYLON.ScaleGizmo(utilLayer);
          let activeGizmo: BABYLON.PositionGizmo | BABYLON.RotationGizmo | BABYLON.ScaleGizmo | null = null;

  
          scene.onPointerDown = function castRay(event) {
              if (event.button === 0) {
                  const hit = scene.pick(scene.pointerX, scene.pointerY);
                  if (hit.pickedMesh) {
                      positionGizmo.attachedMesh = hit.pickedMesh;
                      rotationGizmo.attachedMesh = null;
                      scaleGizmo.attachedMesh = null;
                      activeGizmo = positionGizmo;
                  } else {
                      positionGizmo.attachedMesh = null;
                      rotationGizmo.attachedMesh = null;
                      scaleGizmo.attachedMesh = null;
                      activeGizmo = null;
                  }
              }
          };

          

  
          const logMeshInfo = (mesh: BABYLON.AbstractMesh): void => {
            // Ensure the world matrix is up-to-date
            mesh.computeWorldMatrix(true);
        
            // Get world coordinates using getAbsolutePosition()
            const position = mesh.getAbsolutePosition();
            const rotation = mesh.rotation;
            const scaling = mesh.scaling;
        
            console.log(`Mesh: ${mesh.name}`);
            console.log(`World Position: (${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})`);
            console.log(`Rotation: (${rotation.x.toFixed(2)}, ${rotation.y.toFixed(2)}, ${rotation.z.toFixed(2)})`);
            console.log(`Scale: (${scaling.x.toFixed(2)}, ${scaling.y.toFixed(2)}, ${scaling.z.toFixed(2)})`);
        };
        
  
          const deleteSelectedMesh = () => {
              if (activeGizmo && activeGizmo.attachedMesh) {
                  activeGizmo.attachedMesh.dispose();
                  activeGizmo.attachedMesh = null;
                  console.log('Selected mesh deleted.');
              } else {
                  console.log('No mesh is attached to any gizmo.');
              }
          };
  
          window.addEventListener('keydown', (event) => {
              switch (event.key.toLowerCase()) {
                  case 'r':
                      if (activeGizmo) {
                          rotationGizmo.attachedMesh = activeGizmo.attachedMesh;
                          positionGizmo.attachedMesh = null;
                          scaleGizmo.attachedMesh = null;
                          activeGizmo = rotationGizmo;
                          console.log('Switched to Rotation Gizmo');
                      }
                      break;
                  case 's':
                      if (activeGizmo) {
                          scaleGizmo.attachedMesh = activeGizmo.attachedMesh;
                          positionGizmo.attachedMesh = null;
                          rotationGizmo.attachedMesh = null;
                          activeGizmo = scaleGizmo;
                          console.log('Switched to Scale Gizmo');
                      }
                      break;
                  case 'p':
                      if (activeGizmo) {
                          positionGizmo.attachedMesh = activeGizmo.attachedMesh;
                          rotationGizmo.attachedMesh = null;
                          scaleGizmo.attachedMesh = null;
                          activeGizmo = positionGizmo;
                          console.log('Switched to Position Gizmo');
                      }
                      break;
                  case 'l':
                      if (activeGizmo && activeGizmo.attachedMesh) {
                          console.clear();
                          logMeshInfo(activeGizmo.attachedMesh);
                      } else {
                          console.log('No mesh is attached to any gizmo.');
                      }
                      break;
                  case 'k':
                      console.clear();
                      logAllMeshes(scene);
                  case 'd':
                      positionGizmo.attachedMesh = null;
                      rotationGizmo.attachedMesh = null;
                      scaleGizmo.attachedMesh = null;
                      activeGizmo = null;
                      console.log('Gizmo removed');
                      break;
                  case 'delete':
                      deleteSelectedMesh();
                      break;
                  case 'c':
                      logCameraInfo(scene);
                      break;
                  default:
                      break;
              }
              return sceneConfig;
          });
  
          setIsSceneReady(true);
          console.log(`Scene ${sceneId} loaded successfully.`);
      } catch (error) {
          console.error(`Error loading scene ${sceneId}:`, error);
          createDefaultScene(scene); // Fallback to a default scene
      }
    };
  
    
  // Card object creation and management
    const getCardImage = (card: string): string => {

      if (!validCards.includes(card)) {
          console.warn(`Invalid card name: ${card}`);
          return '/images/Blank.png'; // Fallback to a default image
      }

      const imagePath = `/images/${card}.png`;
      console.log(`Card image path for ${card}:`, imagePath);
      return imagePath;
    };

  
    const createCard = (
      card: string,
      scene: BABYLON.Scene,
      position: [number, number, number],
      rotation: [number, number, number],
      scale: [number, number, number]
  ): BABYLON.Mesh | null => {
      try {
          console.log(`Creating card ${card} with texture...`);
  
          // Get texture path for the card
          const texturePath = getCardImage(card);
          if (!texturePath) {
              console.error(`No texture found for card ${card}. Using default configuration.`);
              return null;
          }
          console.log(`Texture path for ${card}: ${texturePath}`);
  
          // Create material and assign texture
          const cardMaterial = new BABYLON.StandardMaterial(`material_${card}`, scene);
          cardMaterial.diffuseTexture = new BABYLON.Texture(
              texturePath,
              scene,
              false, // no mipmaps
              false, // no inversion
              BABYLON.Texture.BILINEAR_SAMPLINGMODE,
              () => console.log(`Texture for ${card} loaded successfully.`), // onLoad callback
              (message) => console.error(`Failed to load texture for card ${card}: ${message}`) // onError callback
          );
          // Add emissive color for brightness
          cardMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1); // White emissive color
  
          // Define UV mapping if needed
          const faceUV = [
            new BABYLON.Vector4(1 / 114, 0, 0 / 114, 1), 
            new BABYLON.Vector4(2 / 114, 0, 1 / 114, 1), 
            new BABYLON.Vector4(3 / 114, 0, 2 / 114, 1), 
            new BABYLON.Vector4(4 / 114, 0, 3 / 114, 1), 
            new BABYLON.Vector4(59 / 114, 0, 4 / 114, 1), 
            new BABYLON.Vector4(1, 0, 59 / 114, 1), 
          ];
        
  
          // Create card mesh
          const cardMesh = BABYLON.MeshBuilder.CreateBox(card, {
              width: 0.35,
              height: 0.005,
              depth: 0.25,
              faceUV: faceUV
          }, scene);
  
          // Assign material and transform
          cardMesh.material = cardMaterial;
          cardMesh.position = new BABYLON.Vector3(...position);
          cardMesh.rotation = new BABYLON.Vector3(...rotation);
          cardMesh.scaling = new BABYLON.Vector3(...scale);
  
          console.log(`Card ${card} created with material and mesh.`);
          return cardMesh;
      } catch (error) {
          console.error(`Error creating card ${card}:`, error);
          return null;
      }
    };

    const assignCardNamesDynamically = (
        sceneConfig: SceneConfig,
        hands: string[][],
        community: string[]
      ): SceneConfig => {
        try {
            // Combine hands and community cards into a single array
            const cardNames = [...hands.flat(), ...community];

            // Log the combined card names for debugging
            console.log("Assigning card names:", cardNames);

            // Validate lengths
            if (cardNames.length > sceneConfig.cards.length) {
                console.warn(
                    `Too many cards provided (${cardNames.length}) compared to positions in the sceneConfig (${sceneConfig.cards.length}). Extra cards will be ignored.`
                );
            } else if (cardNames.length < sceneConfig.cards.length) {
                console.warn(
                    `Not enough cards provided (${cardNames.length}). Some placeholders will remain in the sceneConfig.`
                );
            }

            // Create a new array of cards with updated names
            const updatedCards = sceneConfig.cards.map((cardConfig, index) => {
                const cardName = cardNames[index] || `card_placeholder_${index}`; // Use placeholder if no cardName
                console.log(`Card at index ${index}: ${cardName}`);
                return {
                    ...cardConfig,
                    name: cardName, // Update the name field
                };
            });

            // Log the updated cards for debugging
            console.log("Updated card configuration:", updatedCards.map(card => card.name));

            // Return the updated scene configuration
            return {
                ...sceneConfig,
                cards: updatedCards,
            };
        } catch (error) {
            console.error("Error assigning card names dynamically:", error);
            // Return the original sceneConfig in case of error
            return sceneConfig;
        }
    };

    const createCow = async (
        name: string,
        position: [number, number, number],
        rotation: [number, number, number],
        scale: [number, number, number],
        scene: BABYLON.Scene
    ): Promise<BABYLON.AbstractMesh | undefined> => {
        const result = await BABYLON.SceneLoader.ImportMeshAsync(null, '/models/', 'Cow.glb', scene);
        const cow = result.meshes[0];
        cow.name = name;
        cow.position = new BABYLON.Vector3(...position);
        cow.rotation = new BABYLON.Vector3(...rotation);
        cow.scaling = new BABYLON.Vector3(...scale);
    
        // Ensure the material is correctly applied
        const cowMaterial = new BABYLON.StandardMaterial("cowMaterial", scene);
        cowMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
        cowMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        cow.material = cowMaterial;
    
        // Play animations if available
        const animations = cow.animations || [];
          if (animations.length > 0) {
              scene.beginAnimation(cow, 0, animations[0].framePerSecond * 2, true); // Adjust frame range as needed
        }


    
        return cow;
    };
  


// Use Effects
  // No scroll on page
    useEffect(() => {
      if (typeof document !== "undefined") {
            document.body.classList.add('no-scroll');

            return () => {
                document.body.classList.remove('no-scroll');
        };}
    }, []);

  // Initializes game state
    useEffect(() => {
      if (isSceneReady) {
        initializeGame();
      }
    }, [isSceneReady]);
  

  // Initialize Babylon Scene
    useEffect(() => {
      if (typeof document !== "undefined") {
          const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement | null;
  
          if (!canvas) {
              console.error("Canvas element with id 'renderCanvas' not found.");
              return;
          }
  
          const engine = new BABYLON.Engine(canvas, true);
          const scene = new BABYLON.Scene(engine);
          setScene(scene);
  
          const initializeScene = async () => {
              try {
                  console.log("Initializing Babylon.js scene...");
  
                  // Load scene state asynchronously
                  await loadSceneStateAsync(scene, 1);
                  console.log("Scene state loaded.");
  
                  // Run the render loop only after initialization
                  const renderLoop = () => {
                      if (scene && scene.activeCamera) {
                          scene.render();
                      }
                  };
                  engine.runRenderLoop(renderLoop);
  
                  // Initialize the game logic
                  await initializeGame(); // Ensure game initialization waits for the scene setup
                  console.log("Game initialized.");
              } catch (error) {
                  console.error("Error during initialization:", error);
                  createDefaultScene(scene); // Fallback to default
              }
          };
  
          initializeScene();
  
          // Handle window resize
          const handleResize = () => {
              if (engine) {
                  engine.resize();
              }
          };
  
          window.addEventListener("resize", handleResize);
  
          console.log("Babylon.js scene initialized.");
  
          return () => {
              window.removeEventListener("resize", handleResize);
              engine.dispose();
          };
      }
    }, []);
  
  // Update card names (?)
    useEffect(() => {
      if (hands.length > 0 && community.length > 0) {
          const loadedCardNames = getCurrentCardNames(); // Get card names
          if (loadedCardNames.length === 15) {
              setCardNames(loadedCardNames); // Update state if 15 cards are found
              console.log("Set card names:", loadedCardNames);
          } else {
              console.warn("Card names do not contain 15 cards, skipping setCardNames.");
          }
      }
    }, [hands, community]);


  // Update scene from card names
    useEffect(() => {
      if (scene && hands.length > 0 && community.length > 0) {
          // Dynamically assign card names
          const updatedSceneConfig = assignCardNamesDynamically(hardcodedSceneConfig, hands, community);

          // console.log("Updated SceneConfig with card names:", updatedSceneConfig);
          console.log("Updated sceneConfig:", updatedSceneConfig.cards.map(card => card.name));

          // Update the scene with the dynamically updated configuration
          updateSceneWithCards(scene, hands, community, updatedSceneConfig);

          // Log all meshes in the scene
          scene.meshes.forEach(mesh => 
              console.log("Mesh in scene:", mesh.name, "Position:", mesh.position)
          );
      } else {
          console.warn("Scene is not ready or hands/community are not set.");
      }
    }, [scene, hands, community]);

  // Log scene changes on scene change
    useEffect(() => {
      console.log("Scene:", scene);
      console.log("SceneConfig:", sceneConfig);
      console.log("Card Names:", cardNames);
    }, [scene, sceneConfig, cardNames]);
  
  // Log dealt cards after dealing
    useEffect(() => {
      console.log("Hands state:", hands);
      console.log("Community state:", community);
    }, [hands, community]);
  
  // Log all meshes when scene changes
    useEffect(() => {
      if (!scene) {
        console.error("Scene is null or not initialized.");
      } else {
        console.log("Scene initialized:", scene);
        console.log("Logging all meshes in the scene:");
        logAllMeshes(scene);
      }
    }, [scene]);
  
  // Loads card data from scene when scene changes (?)
    useEffect(() => {
        if (scene && isSceneReady) {
            loadCardDataFromScene(scene);
        }
    }, [scene, isSceneReady]);
    
  // Imports babylon inspector if application is running in browser
    useEffect(() => {
      if (typeof window !== "undefined") {
          import('@babylonjs/inspector')
              .then(() => console.log("Inspector loaded"))
              .catch((error) => console.error("Failed to load Babylon.js Inspector:", error));
      }
    }, []);
  

    return (
    <HotKeys>
        <div>
            <LoadingOverlay loading={showOverlay} />
            <canvas id="renderCanvas" style={{ width: '100%', height: '100vh' }}></canvas>
            <button onClick={handleInitializeGameClick} style={{ position: "absolute", top: "30%", left: "90%", zIndex: 1000 }}>
                Initialize Game
            </button>
            {isSceneReady ? (
                <>
                    <PokerGUI
                        sliderValue={sliderValue}
                        handleSliderChange={handleSliderChange}
                        increaseBet={increaseBet}
                        decreaseBet={decreaseBet}
                        setSliderValue={setSliderValue}
                        blind={blind}
                    />
                    <DebugPanel cardNames={cardNames} />
                </>
            ) : (
                <p>Loading scene...</p>
            )}
        </div>
    </HotKeys>
  );
};

export default PokerFrogs;
