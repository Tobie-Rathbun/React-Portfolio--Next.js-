"use client";


import React, { useState, useEffect } from 'react';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import '@babylonjs/inspector';
import axios from 'axios';
import { HotKeys } from 'react-hotkeys';
import PokerGUI from '@components/PokerGUI';
import DebugPanel from '@components/DebugPanel';


type Card = string;
type Mesh = BABYLON.Mesh;
type Scene = BABYLON.Scene;

interface SceneConfig {
    camera: {
        alpha: number;
        beta: number;
        radius: number;
        wheelPrecision: number;
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

const PokerFrogs: React.FC = () => {
    const [sliderValue, setSliderValue] = useState<number>(50);
    const [potSize, setPotSize] = useState<number>(0);
    const [wallet, setWallet] = useState<number>(20000);
    const [blind, setBlind] = useState<number>(200);
    const [betCurrent, setBetCurrent] = useState<number>(blind);
    const [bets, setBets] = useState<{ [key: string]: number }>({ p0: 0, p1: 0, p2: 0, p3: 0, p4: 0 });
    const [hands, setHands] = useState<Card[][]>([]);
    const [community, setCommunity] = useState<Card[]>([]);
    const [cardNames, setCardNames] = useState<string[]>([]);
    const [scene, setScene] = useState<Scene | null>(null);
    const [isSceneReady, setIsSceneReady] = useState<boolean>(false);
    const [sceneConfig, setSceneConfig] = useState<SceneConfig | null>(null);

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

    const deck = [
        '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', '0H', 'JH', 'QH', 'KH', 'AH',
        '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', '0D', 'JD', 'QD', 'KD', 'AD',
        '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', '0C', 'JC', 'QC', 'KC', 'AC',
        '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', '0S', 'JS', 'QS', 'KS', 'AS'
    ];

    const shuffle = (array: string[]): string[] => {
      let currentIndex = array.length;
      while (currentIndex !== 0) {
          const randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
          [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
      }
      return array;
    };
  

    const draw = (cards: string[]): string | undefined => {
        return cards.shift();
    };
    
    const drawHand = (cards: string[]): string[] => {
      return [draw(cards)!, draw(cards)!].filter((card): card is string => card !== undefined);
    };
  

   
    const initializeGame = () => {
      const shuffledDeck = shuffle([...deck]);
      const hands = Array.from({ length: 5 }, () => drawHand(shuffledDeck).filter((card): card is string => card !== undefined));
      setHands(hands); // Now it's guaranteed to be `string[][]
      console.log("Hands initialized:", hands);
      console.log("Community cards initialized:", community);
    };
    

    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSliderValue(parseInt(event.target.value));
    };
  

    const increaseBet = () => {
        setSliderValue(prevValue => Math.min(prevValue + 100, 1000));
    };

    const decreaseBet = () => {
        setSliderValue(prevValue => Math.max(prevValue - 100, blind));
    };

    const getCurrentCardNames = () => {
        console.log("Hands state before cloning:", hands);
        console.log("Community state before cloning:", community);

        let clonedHands = hands.slice();
        let clonedCommunity = community.slice();
        let cardNames = [];

        for (let i = 0; i <= 4; i++) {
            if (clonedHands[i]) {
                cardNames.push(clonedHands[i][0], clonedHands[i][1]);
            }
        }
        cardNames.push(...clonedCommunity);
        console.log("Generated card names:", cardNames);
        return cardNames;
    };
    

    const loadCardDataFromScene = (sceneConfig: SceneConfig, scene: BABYLON.Scene): void => {
      const cards = sceneConfig.cards || [];
      const clonedCardNames = getCurrentCardNames().slice();
  
      if (cards.length < 15) {
          console.error("Loading cards in scene configuration");
          return;
      }
  
      cards.forEach((card, index) => {
          if (index < clonedCardNames.length) {
              const cardName = clonedCardNames[index];
              console.log("Scene before creating card:", scene);
              console.log("Is scene disposed:", scene.isDisposed);
              createCard(cardName, scene, card.position, card.rotation, card.scale);
          } else {
              console.warn(`No name found for card at index ${index}`);
          }
      });
    };
    

    const getCardImage = (card: string): string => {
      console.log('card name to pass: ', card);
      return `/images/${card}.png`;
    };
  

    const createCard = (
        card: string, 
        scene: BABYLON.Scene, 
        position: [number, number, number], 
        rotation: [number, number, number], 
        scale: [number, number, number]
    ): BABYLON.Mesh | undefined => {
        if (!scene || typeof scene.getUniqueId !== 'function') {
            console.error("Invalid scene object passed to createCard.");
            return;
        }
    
        console.log(`Creating card: ${card}`);
    
        const cardMaterial = new BABYLON.StandardMaterial("cardMaterial", scene);
        cardMaterial.diffuseTexture = new BABYLON.Texture(getCardImage(card), scene);
        cardMaterial.emissiveTexture = cardMaterial.diffuseTexture;
        cardMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
    
        const faceUV = [
            new BABYLON.Vector4(0, 0, 1 / 114, 1),
            new BABYLON.Vector4(1 / 114, 0, 2 / 114, 1),
            new BABYLON.Vector4(2 / 114, 0, 3 / 114, 1),
            new BABYLON.Vector4(3 / 114, 0, 4 / 114, 1),
            new BABYLON.Vector4(4 / 114, 0, 59 / 114, 1),
            new BABYLON.Vector4(59 / 114, 0, 1, 1),
        ];
    
        const cardMesh = BABYLON.MeshBuilder.CreateBox(
            card, 
            { width: 0.35, height: 0.005, depth: 0.25, faceUV: faceUV }, 
            scene
        );
        cardMesh.material = cardMaterial;
        cardMesh.position = new BABYLON.Vector3(...position);
        cardMesh.rotation = new BABYLON.Vector3(...rotation);
        cardMesh.scaling = new BABYLON.Vector3(...scale);
    
        return cardMesh;
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
  
  

    const displayHand = (
        hand: string[],
        scene: BABYLON.Scene,
        cardConfig?: { position: [number, number, number][] },
        faceDown: boolean = false
    ): void => {
        if (!hand) return;
        hand.forEach((card, index) => {
            const position = cardConfig?.position
                ? new BABYLON.Vector3(...cardConfig.position[index])
                : new BABYLON.Vector3(0, 0, 0);
            const cardMesh = createCard(card, scene, [position.x + index * 0.4, position.y, position.z], [0, 0, 0], [1, 1, 1]);
            if (faceDown) {
                cardMesh!.rotation.y = Math.PI;
            }
        });
    };

    
    

    const createDefaultScene = (scene: BABYLON.Scene): void => {
      const canvas = scene.getEngine().getRenderingCanvas();
      const camera = new BABYLON.ArcRotateCamera("defaultCamera", 0, 0, 10, BABYLON.Vector3.Zero(), scene);
      camera.attachControl(canvas, true);
      camera.alpha = -1.04;
      camera.beta = 1.12;
      camera.radius = 10;
      camera.wheelPrecision = 100;
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
  

    useEffect(() => {
        document.body.classList.add('no-scroll');

        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);

    useEffect(() => {
      const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement | null;
  
      if (!canvas) {
          console.error("Canvas element with id 'renderCanvas' not found.");
          return;
      }
  
      const engine = new BABYLON.Engine(canvas, true);
      const scene = new BABYLON.Scene(engine);
      setScene(scene);
  
      const renderLoop = () => {
          if (scene && scene.activeCamera) {
              scene.render();
          }
      };
  
      const runRenderLoop = () => {
          engine.runRenderLoop(renderLoop);
      };
  
      const handleResize = () => {
          if (engine) {
              engine.resize();
          }
      };
  
      const initialize = async () => {
          try {
              console.log("Initializing Babylon.js scene...");
  
              await loadSceneStateAsync(scene, 1);
              console.log("Scene state loaded.");
  
              runRenderLoop();
  
              initializeGame();
              console.log("Game initialized.");
          } catch (error) {
              console.error("Error during initialization:", error);
          }
      };
  
      initialize();
  
      window.addEventListener("resize", handleResize);
  
      return () => {
          window.removeEventListener("resize", handleResize);
          engine.dispose();
      };
  }, []);
  

    useEffect(() => {
        if (scene && sceneConfig) {
            if (hands.length && community.length) {
                loadCardDataFromScene(sceneConfig, scene);
                logAllMeshes(scene);
            } else {
                console.warn("Hands or Community not ready. Skipping card data load.");
            }
        }
    }, [scene, sceneConfig, hands, community]);
    

    useEffect(() => {
        if (hands.length > 0 && community.length > 0) {  // Ensure hands and community are ready
            const loadedCardNames = getCurrentCardNames().slice();  // Shallow copy of the array
            if (loadedCardNames.length === 15) {  // Ensure array has all 15 cards
                setCardNames(loadedCardNames);  // Update state only if array has 15 cards
                console.log("Set card names:", loadedCardNames);
            } else {
                console.warn("Loaded card names do not contain 15 cards, skipping setCardNames.");
            }
        } else {
            console.log("Hands or Community not ready");
        }
    }, [hands, community]);
 
    
    
    
    

    const keyMap = {
        save1: 'alt+1',
        save2: 'alt+2',
        save3: 'alt+3',
        save4: 'alt+4',
        save5: 'alt+5',
        load1: '1',
        load2: '2',
        load3: '3',
        load4: '4',
        load5: '5',
        logCamera: 'c'
    };

    const saveSceneState = async (scene: BABYLON.Scene, sceneId: number): Promise<void> => {
      if (!scene || !scene.getEngine()) {
          console.error("Scene or engine is not available.");
          return;
      }
  
      const camera = scene.activeCamera;
        if (camera && camera instanceof BABYLON.ArcRotateCamera) {
            const cameraConfig = {
                alpha: camera.alpha,
                beta: camera.beta,
                radius: camera.radius,
                wheelPrecision: camera.wheelPrecision,
            };
    
            try {
                const apiBaseUrl = window.location.hostname === 'localhost'
                    ? 'http://localhost:4242'
                    : 'https://your-production-url.com';
                
                await axios.post(`${apiBaseUrl}/api/scene/${sceneId}`, cameraConfig, {
                    headers: { 'Content-Type': 'application/json' },
                });
                console.log(`Scene ${sceneId} saved successfully.`);
            } catch (error) {
                console.error(`Error saving scene ${sceneId}:`, error);
            }
        } else {
            console.error("Active camera is not an ArcRotateCamera or is null.");
        }
    };
  
    const hardcodedSceneConfig: SceneConfig = {
      camera: {
          alpha: -1.04,
          beta: 1.12,
          radius: 10,
          wheelPrecision: 100,
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
            "name": "3C",
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
            "name": "QD",
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
            "name": "4C",
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
            "name": "QH",
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
            "name": "0H",
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
            "name": "6H",
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
            "name": "2S",
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
            "name": "6S",
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
            "name": "JC",
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
            "name": "5S",
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
            "name": "8H",
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
            "name": "7H",
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
            "name": "0D",
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
            "name": "3S",
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
            "name": "3D",
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
                const camera = new BABYLON.ArcRotateCamera("myCamera", 0, 0, 10, BABYLON.Vector3.Zero(), scene);
                camera.attachControl(canvas, true);
                camera.alpha = -1.04;
                camera.beta = 1.12;
                camera.radius = 1;
                camera.wheelPrecision = 100;
                scene.activeCamera = camera;
            }
    
            // Set camera properties from sceneConfig
            const camera = scene.activeCamera;
            if (camera && camera instanceof BABYLON.ArcRotateCamera) {
                camera.alpha = sceneConfig.camera.alpha;
                camera.beta = sceneConfig.camera.beta;
                camera.radius = sceneConfig.camera.radius;
                camera.wheelPrecision = sceneConfig.camera.wheelPrecision;
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
            loadCardDataFromScene(sceneConfig, scene);
    
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
  
    
    const logCameraInfo = () => {
      if (!scene) {
          console.error("Scene is not initialized.");
          return;
      }
  
      if (!scene.activeCamera) {
          console.error("No active camera found in the scene.");
          return;
      }
  
      const camera = scene.activeCamera;
  
      // Check if the camera has a rotation property
      if ('rotation' in camera) {
          const cameraPosition = camera.position;
          const cameraRotation = (camera as BABYLON.FreeCamera).rotation;
  
          console.log(`Camera World Position: (${cameraPosition.x.toFixed(2)}, ${cameraPosition.y.toFixed(2)}, ${cameraPosition.z.toFixed(2)})`);
          console.log(`Camera Rotation: (${cameraRotation.x.toFixed(2)}, ${cameraRotation.y.toFixed(2)}, ${cameraRotation.z.toFixed(2)})`);
      } else {
          const cameraPosition = camera.position;
          console.log(`Camera World Position: (${cameraPosition.x.toFixed(2)}, ${cameraPosition.y.toFixed(2)}, ${cameraPosition.z.toFixed(2)})`);
          console.log("This camera type does not have a rotation property.");
      }
    };
  
    

    const handlers = {
      save1: () => { if (isSceneReady && scene) saveSceneState(scene, 1); },
      save2: () => { if (isSceneReady && scene) saveSceneState(scene, 2); },
      save3: () => { if (isSceneReady && scene) saveSceneState(scene, 3); },
      save4: () => { if (isSceneReady && scene) saveSceneState(scene, 4); },
      save5: () => { if (isSceneReady && scene) saveSceneState(scene, 5); },
      load1: () => { resetBabylonInstanceAndLoadScene(1); },
      load2: () => { resetBabylonInstanceAndLoadScene(2); },
      load3: () => { resetBabylonInstanceAndLoadScene(3); },
      load4: () => { resetBabylonInstanceAndLoadScene(4); },
      load5: () => { resetBabylonInstanceAndLoadScene(5); },
      logCamera: () => { if (isSceneReady) logCameraInfo(); }
    };
  

    const resetBabylonInstanceAndLoadScene = (sceneId: number): void => {
      useEffect(() => {
          const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement | null;
          if (!canvas) {
              console.error("Canvas element with id 'renderCanvas' not found.");
              return;
          }
  
          const engine = new BABYLON.Engine(canvas, true);
          const newScene = new BABYLON.Scene(engine);
          setScene(newScene);
  
          loadSceneStateAsync(newScene, sceneId).then(() => {
              engine.runRenderLoop(() => {
                  if (newScene && newScene.activeCamera) {
                      newScene.render();
                  }
              });
          });
  
          return () => {
              engine.dispose();
          };
      }, [sceneId]);
    };
  

    useEffect(() => {
        console.log("Scene:", scene);
        console.log("SceneConfig:", sceneConfig);
    }, [scene, sceneConfig]);

  

    return (
        <HotKeys keyMap={keyMap} handlers={handlers}>
            <div>
                <canvas id="renderCanvas" style={{ width: '100%', height: '100vh' }}></canvas>
                {scene && sceneConfig ? (
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
