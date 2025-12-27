document.addEventListener('DOMContentLoaded', () => {
    // UI Helpers
    const showToast = (message) => {
        const toast = document.getElementById('copy-toast');
        if (toast) {
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
        }
    };

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(10, 7, 1, 0.9)';
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
        } else {
            navbar.style.background = 'rgba(10, 7, 1, 0.7)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Add interactive class to footer
    const footer = document.querySelector('.footer');
    if (footer) footer.classList.add('footer-interactive');

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- Three.js Hero Sphere ---
    let heroSphereMaterial;
    const initHeroSphere = () => {
        const container = document.getElementById('hero-3d-container');
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Increased segments for more detail
        const geometry = new THREE.IcosahedronGeometry(2.2, 4);
        heroSphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x7F56D9,
            wireframe: true,
            transparent: true,
            opacity: 0.6,
            shininess: 100
        });
        const sphere = new THREE.Mesh(geometry, heroSphereMaterial);
        scene.add(sphere);

        // Inner glowing core
        const coreGeo = new THREE.SphereGeometry(1.5, 32, 32);
        const coreMat = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.2,
            shininess: 200
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        scene.add(core);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xFF5061, 1);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        let mouseX = 0, mouseY = 0;
        let targetX = 0, targetY = 0;
        let isHovering = false;

        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX - window.innerWidth / 2) * 0.005;
            mouseY = (e.clientY - window.innerHeight / 2) * 0.005;
        });

        // Toggle tracking capability
        container.addEventListener('mouseenter', () => isHovering = true);
        container.addEventListener('mouseleave', () => isHovering = false);

        const animate = () => {
            requestAnimationFrame(animate);

            if (isHovering) {
                // Interactive tracking mode
                targetX += (mouseX - targetX) * 0.05;
                targetY += (mouseY - targetY) * 0.05;

                sphere.rotation.y += targetX;
                sphere.rotation.x += targetY;
            } else {
                // Auto-spin slow mode
                sphere.rotation.x += 0.002;
                sphere.rotation.y += 0.002;
            }

            // Continuous slight rotation even when tracking
            sphere.rotation.z += 0.001;

            // Pulsing effect
            const time = Date.now() * 0.001;
            sphere.scale.setScalar(1 + Math.sin(time) * 0.05);

            renderer.render(scene, camera);
        };
        animate();
    };

    // --- Infinite Prompt Library ---
    const promptLibrary = [
        "Hyper-realistic 8K cyberpunk city submerged in neon water, cinematic lighting, ultra-detailed textures, unreal engine 5 render, reflections on water surface",
        "Abstract 3D glass sculpture of a glowing biological heart, intricate circuitry patterns, purple and pink iridescent lighting, 8k resolution, octane render",
        "Futuristic minimalist workspace inside a space station, holographic earth floating above desk, bioluminescent plants, cinematic composition, photorealistic 8k",
        "Surreal landscape of floating crystalline islands made of bismuth, rainbow metallic reflections, liquid mercury waterfalls, otherworldly sky, masterpiece 8k",
        "Portrait of a divine AI entity with semi-transparent porcelain skin revealing glowing fiber-optic nerves, ornate gold circuitry headpiece, ethereal 8k",
        "Dystopian overgrown library with massive tree roots spiraling through bookshelves, sunlight rays filtering through dust, moody cinematic lighting, 8k detail",
        "Macro photography of a mechanical butterfly with sapphire wings, gears visible inside body, resting on a glowing lavender flower, sharp focus, 8k",
        "An endless corridor of mirrors reflecting infinite parallel universes, geometric light structures, dark void background, trippy psychedelic 8k visuals",
        "Steampunk airship soaring through a storm of purple lightning and golden clouds, intricate brass details, cinematic wide shot, detailed 8k environment",
        "A futuristic zen garden on Mars, red sand with complex geometric raked patterns, floating chrome spheres, black monoliths, striking architecture, 8k",
        "Cinematic video of liquid gold pouring over a black marble bust, intricate gold filigree growing on surface, slow motion, hyper-detailed, luxury aesthetic",
        "Ultra-wide shot of a celestial forge inside a nebula, stars being hammered into geometric shapes, cosmic sparks, vibrant nebulous colors, 8K masterpiece",
        "A field of crystalline sunflowers that track the movement of a miniature pulsar, chrome petals reflecting cosmic rays, dark starlit sky, otherworldly 8k",
        "Intricate clockwork forest where every leaf is a tiny gear, brass clockwork birds with emerald eyes, moody atmospheric lighting, whimsical fantasy 8k",
        "POV through a VR headset exploring a fractal dimension, kaleidoscopic patterns shifting with music, infinite depth, vibrant neon palette, digital art 8k"
    ];

    // --- Three.js Prompt Cloud ---
    let promptCloudCards = [];
    let currentHue = 260;

    const initPromptCloud = () => {
        const canvasContainer = document.getElementById('prompt-cloud-canvas');
        if (!canvasContainer) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 10;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        canvasContainer.appendChild(renderer.domElement);

        // Interaction Handling
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let focusedCard = null;

        // Function to create text texture
        const createTextTexture = (text, hue = 260) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 512;
            canvas.height = 320; // Taller for longer prompts

            const color = `hsl(${hue}, 70%, 60%)`;

            // Background (Glass look)
            ctx.fillStyle = 'rgba(15, 12, 21, 0.95)';
            ctx.roundRect = (x, y, w, h, r) => {
                ctx.beginPath(); ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
                ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
                ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
                ctx.closePath(); return ctx;
            };
            ctx.roundRect(0, 0, 512, 320, 20).fill();

            // Border
            ctx.strokeStyle = color;
            ctx.lineWidth = 12; // Thicker for 3D look
            ctx.stroke();

            // Close Button Hint (Top Right)
            ctx.fillStyle = '#FF5061';
            ctx.font = 'bold 36px Arial';
            ctx.fillText('×', 470, 45);

            // Text Header
            ctx.fillStyle = color; // Header color synced with UI
            ctx.font = 'bold 20px Montserrat';
            ctx.textAlign = 'center';
            ctx.fillText('IMAGE GENERATION PROMPT', 256, 55);

            // Prompt Text
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'italic 20px Montserrat';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const words = text.split(' ');
            let line = '';
            let lines = [];
            const maxWidth = 420;
            for (let n = 0; n < words.length; n++) {
                let testLine = line + words[n] + ' ';
                if (ctx.measureText(testLine).width > maxWidth && n > 0) {
                    lines.push(line);
                    line = words[n] + ' ';
                } else {
                    line = testLine;
                }
            }
            lines.push(line);

            lines.forEach((l, i) => {
                ctx.fillText(l.trim(), 256, 160 - (lines.length - 1) * 15 + i * 30);
            });

            // Action Hint
            ctx.fillStyle = color;
            ctx.font = 'bold 18px Montserrat';
            ctx.fillText('CLICK TO COPY', 256, 295);

            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            return texture;
        };

        const createCard = (i) => {
            const prompt = promptLibrary[i % promptLibrary.length];
            // Thick 3D edges: Box geometry with depth
            const geometry = new THREE.BoxGeometry(4, 2.5, 0.5);
            const texture = createTextTexture(prompt, currentHue);

            // Multiple materials for 3D edges
            const material = new THREE.MeshPhongMaterial({ map: texture, transparent: true, opacity: 0.95, shininess: 80 });
            const edgeMaterial = new THREE.MeshPhongMaterial({ color: 0x150c15, shininess: 100 });

            // Array of 6 materials for the 6 faces of the box
            const materials = [
                edgeMaterial, // right
                edgeMaterial, // left
                edgeMaterial, // top
                edgeMaterial, // bottom
                material,     // front
                edgeMaterial  // back
            ];

            const card = new THREE.Mesh(geometry, materials);

            // Assign properties for stable revolving orbits
            card.userData = {
                text: prompt,
                orbit: {
                    radius: 12 + (i % 3) * 4, // Distinct radii to prevent overlap
                    speed: 0.0002 + Math.random() * 0.0003,
                    yOffset: (i - 5) * 2.5, // Distinct heights to prevent overlap
                    angle: Math.random() * Math.PI * 2
                },
                idling: true,
                shuffle: () => {
                    const newPrompt = promptLibrary[Math.floor(Math.random() * promptLibrary.length)];
                    card.userData.text = newPrompt;
                    const newTexture = createTextTexture(newPrompt, currentHue);
                    card.material[4].map.dispose(); // Dispose old texture to prevent memory leaks
                    card.material[4].map = newTexture;
                    card.material[4].needsUpdate = true;
                },
                updateTheme: (hue) => {
                    const newTexture = createTextTexture(card.userData.text, hue);
                    card.material[4].map.dispose();
                    card.material[4].map = newTexture;
                    card.material[4].needsUpdate = true;
                }
            };

            // Initial position based on orbit
            card.position.x = Math.cos(card.userData.orbit.angle) * card.userData.orbit.radius;
            card.position.z = Math.sin(card.userData.orbit.angle) * card.userData.orbit.radius;
            card.position.y = card.userData.orbit.yOffset;

            scene.add(card);
            promptCloudCards.push(card);
        };

        // Initial set of cards
        for (let i = 0; i < 10; i++) createCard(i);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        // Click Handler
        window.addEventListener('mousedown', (e) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(promptCloudCards);

            if (intersects.length > 0) {
                const clickedCard = intersects[0].object;

                // Detection if user clicked the "X" area (approx top-right corner)
                // In local card space, X is roughly [1.5, 2] and Y is roughly [0.8, 1.25]
                const localPoint = intersects[0].point.clone().applyMatrix4(clickedCard.matrixWorld.invert());
                const isXClick = localPoint.x > 1.4 && localPoint.y > 0.8;

                if (focusedCard === clickedCard) {
                    if (isXClick) {
                        // Return to idle
                        focusedCard.userData.idling = true;
                        focusedCard.userData.shuffle(); // Infinite variation
                        focusedCard = null;
                        canvasContainer.style.pointerEvents = 'none';
                    } else {
                        // Copy text
                        navigator.clipboard.writeText(clickedCard.userData.text);
                        showToast("Prompt Copied!");
                    }
                } else {
                    // Focus new card
                    if (focusedCard) focusedCard.userData.idling = true;
                    focusedCard = clickedCard;
                    focusedCard.userData.idling = false;
                    canvasContainer.style.pointerEvents = 'auto';
                }
            } else if (focusedCard) {
                focusedCard.userData.idling = true;
                focusedCard = null;
                canvasContainer.style.pointerEvents = 'none';
            }
        });

        // Hover Effect for Cursor
        window.addEventListener('mousemove', (e) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(promptCloudCards);
            document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
        });

        const animate = () => {
            requestAnimationFrame(animate);

            promptCloudCards.forEach(card => {
                if (card.userData.idling) {
                    // Revolving motion (around central axis)
                    card.userData.orbit.angle += card.userData.orbit.speed * 16; // constant motion

                    const targetX = Math.cos(card.userData.orbit.angle) * card.userData.orbit.radius;
                    const targetZ = Math.sin(card.userData.orbit.angle) * card.userData.orbit.radius - 5; // offset back

                    card.position.x += (targetX - card.position.x) * 0.05;
                    card.position.y += (card.userData.orbit.yOffset - card.position.y) * 0.05;
                    card.position.z += (targetZ - card.position.z) * 0.05;

                    // Keep cards facing the camera (no spin/rotate)
                    card.rotation.set(0, 0, 0);
                    card.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
                } else {
                    // Animation to front (focused) - Adjusted to prevent over-zooming
                    card.position.lerp(new THREE.Vector3(0, 0, 5), 0.1);
                    card.rotation.set(0, 0, 0);
                    card.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.1);
                }
            });

            renderer.render(scene, camera);
        };
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    };

    // --- Aurora Background Animation ---
    const initAurora = () => {
        const container = document.getElementById('aurora-container');
        if (!container) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        container.appendChild(canvas);

        let width, height;
        let particles = [];
        let auroraHue = 200;
        let mouseX = 0, mouseY = 0;

        const resize = () => {
            width = canvas.width = container.clientWidth;
            height = canvas.height = container.clientHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Track mouse within aurora container
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });

        class Line {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.len = Math.random() * 300 + 100;
                this.speed = Math.random() * 2 + 0.5;
                this.alpha = Math.random() * 0.5;
                this.baseX = this.x; // Remember original X for simple drift return
            }
            update() {
                this.y -= this.speed;
                if (this.y < -this.len) {
                    this.reset();
                    this.y = height + this.len; // Start from bottom
                }

                // Mouse interaction: Repel
                const dx = this.x - mouseX;
                const dy = (this.y + this.len / 2) - mouseY; // Check center of line
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 150;

                if (dist < maxDist) {
                    const force = (maxDist - dist) / maxDist;
                    const drive = force * 5; // Strength
                    this.x += (dx / dist) * drive;
                } else {
                    // Gently return to base drift or just continue straight
                    // this.x += (this.baseX - this.x) * 0.02; 
                    // (Optional: let them scatter completely for chaos)
                }
            }
            draw() {
                const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.len);
                gradient.addColorStop(0, `hsla(${auroraHue}, 80%, 60%, 0)`);
                gradient.addColorStop(0.5, `hsla(${auroraHue}, 80%, 60%, ${this.alpha})`);
                gradient.addColorStop(1, `hsla(${auroraHue}, 80%, 60%, 0)`);

                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x, this.y + this.len);
                ctx.stroke();
            }
        }

        // Increased density
        for (let i = 0; i < 300; i++) particles.push(new Line());

        const animate = () => {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'lighter';
            particles.forEach(p => {
                p.update();
                p.draw();
            });
        };
        animate();

        // Independent Aurora Slider
        const auroraSlider = document.getElementById('aurora-slider');
        const auroraValue = document.getElementById('aurora-value');
        if (auroraSlider) {
            auroraSlider.addEventListener('input', (e) => {
                auroraHue = e.target.value;
                if (auroraValue) {
                    const colors = ["Red", "Gold", "Green", "Cyan", "Deep Blue", "Magenta", "Red"];
                    auroraValue.textContent = colors[Math.floor(auroraHue / 60)];
                }
            });
        }
    };


    // --- Metallic Rubik's Cube ---
    let rubiksTileMaterial;
    let cubeGroup;
    let cubeScene;
    const initCrystalCube = () => {
        const container = document.getElementById('crystal-canvas-wrapper');
        if (!container) return;

        const scene = new THREE.Scene();
        cubeScene = scene;
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 10;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        cubeGroup = new THREE.Group();
        const spacing = 1.05;
        const subCubeSize = 0.98;

        // Materials to match the reference image
        const blackFrameMaterial = new THREE.MeshStandardMaterial({
            color: 0x050505,
            roughness: 0.2,
            metalness: 0.8
        });

        rubiksTileMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x7F56D9,
            metalness: 1.0,      // Pure metallic foil look
            roughness: 0.1,      // Sharp reflections
            clearcoat: 1.0,      // Shiny protective layer
            clearcoatRoughness: 0.05,
            reflectivity: 1.0,
            envMapIntensity: 2.5
        });

        // Create 3x3x3 grid
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    // Create more complex sub-cube with "stickers/tiles"
                    const subCubeGroup = new THREE.Group();

                    // The black core
                    const coreGeo = new THREE.BoxGeometry(subCubeSize, subCubeSize, subCubeSize);
                    const core = new THREE.Mesh(coreGeo, blackFrameMaterial);
                    subCubeGroup.add(core);

                    // Add tiles to visible faces
                    const tileGeo = new THREE.PlaneGeometry(subCubeSize * 0.85, subCubeSize * 0.85);
                    const tileOffset = subCubeSize / 2 + 0.02;

                    // Helper to add tile
                    const addTile = (pos, rot) => {
                        const tile = new THREE.Mesh(tileGeo, rubiksTileMaterial);
                        tile.position.copy(pos);
                        tile.rotation.copy(rot);
                        subCubeGroup.add(tile);
                    };

                    // Only add tiles on the outer surfaces
                    if (x === 1) addTile(new THREE.Vector3(tileOffset, 0, 0), new THREE.Euler(0, Math.PI / 2, 0));
                    if (x === -1) addTile(new THREE.Vector3(-tileOffset, 0, 0), new THREE.Euler(0, -Math.PI / 2, 0));
                    if (y === 1) addTile(new THREE.Vector3(0, tileOffset, 0), new THREE.Euler(-Math.PI / 2, 0, 0));
                    if (y === -1) addTile(new THREE.Vector3(0, -tileOffset, 0), new THREE.Euler(Math.PI / 2, 0, 0));
                    if (z === 1) addTile(new THREE.Vector3(0, 0, tileOffset), new THREE.Euler(0, 0, 0));
                    if (z === -1) addTile(new THREE.Vector3(0, 0, -tileOffset), new THREE.Euler(0, Math.PI, 0));

                    subCubeGroup.position.set(x * spacing, y * spacing, z * spacing);
                    cubeGroup.add(subCubeGroup);
                }
            }
        }
        scene.add(cubeGroup);

        // Highly directional lights to create sharp metallic highlights
        const spotLight = new THREE.SpotLight(0xffffff, 2);
        spotLight.position.set(10, 10, 10);
        spotLight.angle = 0.5;
        spotLight.penumbra = 0.2;
        scene.add(spotLight);

        const pointLight1 = new THREE.PointLight(0xffffff, 1.5);
        pointLight1.position.set(-10, 5, 5);
        scene.add(pointLight1);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
        fillLight.position.set(0, -10, 0);
        scene.add(fillLight);

        scene.add(new THREE.AmbientLight(0xffffff, 0.3));

        // Interaction
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let velocity = { x: 0, y: 0 };
        let hoverTarget = { x: 0, y: 0 };
        const damping = 0.96;

        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
            velocity = { x: 0, y: 0 };
        });

        window.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const lx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const ly = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            if (isDragging) {
                const deltaMove = { x: e.clientX - previousMousePosition.x, y: e.clientY - previousMousePosition.y };
                const rotQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(deltaMove.y * 0.01, deltaMove.x * 0.01, 0, 'XYZ'));
                cubeGroup.quaternion.multiplyQuaternions(rotQ, cubeGroup.quaternion);
                velocity = { x: deltaMove.x, y: deltaMove.y };
                previousMousePosition = { x: e.clientX, y: e.clientY };
            } else {
                if (Math.abs(lx) <= 1.5 && Math.abs(ly) <= 1.5) {
                    hoverTarget.x = lx * 0.3;
                    hoverTarget.y = ly * 0.3;
                }
            }
        });

        window.addEventListener('mouseup', () => isDragging = false);

        const animate = () => {
            requestAnimationFrame(animate);
            if (!isDragging) {
                const rotQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(velocity.y * 0.01, velocity.x * 0.01, 0, 'XYZ'));
                cubeGroup.quaternion.multiplyQuaternions(rotQ, cubeGroup.quaternion);
                velocity.x *= damping;
                velocity.y *= damping;
                cubeGroup.rotation.y += (hoverTarget.x - cubeGroup.rotation.y) * 0.05 + 0.002;
                cubeGroup.rotation.x += (hoverTarget.y - cubeGroup.rotation.x) * 0.05;
            }
            renderer.render(scene, camera);
        };
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });
    };

    // --- Theme & Slider Sync ---
    const initThemeSync = () => {
        const hueSlider = document.getElementById('hue-slider');
        const hueValueLabel = document.getElementById('hue-value');

        if (hueSlider) {
            hueSlider.addEventListener('input', (e) => {
                const hue = e.target.value;
                const threeColor = new THREE.Color().setHSL(hue / 360, 0.7, 0.6);

                // 1. Update Global CSS Variable
                document.documentElement.style.setProperty('--accent-hue', hue);

                // 2. Update 3D Crystal Cube Material
                if (rubiksTileMaterial) rubiksTileMaterial.color.copy(threeColor);

                // 3. Update 3D Hero Sphere Material
                if (heroSphereMaterial) heroSphereMaterial.color.copy(threeColor);

                // 4. Update 3D Prompt Cloud Cards
                currentHue = hue; // Sync global for shuffling
                promptCloudCards.forEach(card => card.userData.updateTheme(hue));

                // 5. Wavy Shake Reaction
                const sliderContainer = hueSlider.parentElement;
                if (sliderContainer) {
                    sliderContainer.classList.remove('wavy-shake');
                    // Trigger reflow
                    void sliderContainer.offsetWidth;
                    sliderContainer.classList.add('wavy-shake');
                }

                if (hueValueLabel) {
                    const colors = ["Red", "Yellow", "Green", "Cyan", "Blue", "Purple", "Red"];
                    const colorIndex = Math.floor(hue / 60);
                    hueValueLabel.textContent = colors[colorIndex];
                }
            });
        }
    };

    // --- Typing Effect ---
    const initTyping = () => {
        const typingElement = document.querySelector('.typing-text');
        if (!typingElement) return;
        const textToType = typingElement.textContent;
        typingElement.textContent = '';
        let charIndex = 0;
        function type() {
            if (charIndex < textToType.length) {
                typingElement.textContent += textToType.charAt(charIndex);
                charIndex++;
                setTimeout(type, 50);
            }
        }
        setTimeout(type, 1000);
    };

    // --- Initialize Everything ---
    initHeroSphere();
    initPromptCloud();
    initCrystalCube();
    initAurora(); // New fluid background
    initThemeSync();
    initTyping();

    // Re-use your filtering logic from earlier
    const filterButtons = document.querySelectorAll('.tab-btn');
    const projectCards = document.querySelectorAll('.project-card');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filterValue = button.getAttribute('data-filter');
            projectCards.forEach(card => {
                card.style.display = (filterValue === 'all' || card.getAttribute('data-category') === filterValue) ? 'flex' : 'none';
            });
        });
    });
});

