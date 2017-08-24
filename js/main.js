var stats;
var container;
var camera, scene, renderer;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var odark = 0x193431;
var dark = '#193431';

//var odark = 0x213D73;
//var dark = '#213D73';

//var odark = 0x2F8A9B;
//var dark = '#2F8A9B';

//var odark = 0x2D6A61;
//var dark = '#2D6A61';

//var odark = 0x285E56;
//var dark = '#285e56';

//var odark = 0x0F2D59;
//var dark = '#0F2D59';

var oSand = 0xdbd6c8;


var fogSetting = new THREE.Fog(dark, 0.005, 2000);

var levelY = 500;

var clock = new THREE.Clock();

var texCaustics;
var matCaustics = new THREE.MeshBasicMaterial();

var objMega;
var objWhale;
var objFish;

var dataScene = {
  fog: false,
  hemisphere: true,
  ambient: false
}
var dataFloor = {
  map: true,
  bump: false,
  norm: true,
  light: false
};
var dataMega = {
  scale: 0.03,
  speed: 0.8
};

var hemisLight;
var ambientLight;

var materialFloor;
var materialFloor_map;
var materialFloor_norm;
var materialFloor_bump;
var materialFloor_light;
var floor;

var turtleArr = [];
var sharkArr = [];

init();
animate();

// ==========

function init() {

	container = document.createElement('div');
	document.body.appendChild(container);

  // ----------

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.y = levelY;
	camera.position.z = 600;

  // ----------

	scene = new THREE.Scene();
  if (dataScene.fog) {
    scene.fog = fogSetting;
  }

  // ----------

  floorInit();

	lightsInit();

  objInit();

  // ----------
  // Renderer {

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(dark);

  renderer.shadowMap.enabled = true;
  renderer.shadowCameraNear = 3;
  renderer.shadowCameraFar = camera.far;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.appendChild(renderer.domElement);
  /*
  }*/
	// ----------
  // Listeners

  stats = new Stats();
  container.appendChild( stats.dom );

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  //controls = new THREE.FirstPersonControls(camera, renderer.domElement);
  controls.target.set(0, levelY, 0);
  controls.update();

  //document.addEventListener('mousemove', onDocumentMouseMove, false);

	window.addEventListener('resize', onWindowResize, false);

  // ----------

  guiInit();

}

function guiInit() {

  var gui = new dat.GUI();

  // Fog
  var guiScene = gui.addFolder('Scene');
  var fog = guiScene.add(dataScene, 'fog');
  var hemisphere = guiScene.add(dataScene, 'hemisphere');
  var ambient = guiScene.add(dataScene, 'ambient');
  fog.onChange(function(value) {
    if (value) {
      scene.fog = fogSetting;
    } else {
      scene.fog = null;
    }
  });
  hemisphere.onChange(function(value) {
    if (value) {
      scene.add(hemisLight);
    } else {
      scene.remove(hemisLight);
    }
  });
  ambient.onChange(function(value) {
    if (value) {
      scene.add(ambientLight);
    } else {
      scene.remove(ambientLight);
    }
  });
  guiScene.open();

  // Floor
  var guiFloor = gui.addFolder('Floor');
  var map = guiFloor.add(dataFloor, 'map');
  var bumpMap = guiFloor.add(dataFloor, 'bump');
  var normMap = guiFloor.add(dataFloor, 'norm');
  var lightMap = guiFloor.add(dataFloor, 'light');
  map.onChange(function(value) {
    if (value) {
      materialFloor.map = materialFloor_map;
    } else {
      materialFloor.map = null;
    }
    materialFloor.needsUpdate = true;
  });
  bumpMap.onChange(function(value) {
    if (value) {
      materialFloor.bumpMap = materialFloor_bump;
    } else {
      materialFloor.bumpMap = null;
    }
    materialFloor.needsUpdate = true;
  });
  normMap.onChange(function(value) {
    if (value) {
      materialFloor.normalMap = materialFloor_norm;
    } else {
      materialFloor.normalMap = null;
    }
    materialFloor.needsUpdate = true;
  });
  lightMap.onChange(function(value) {
    if (value) {
      materialFloor.lightMap = materialFloor_light;
    } else {
      materialFloor.lightMap = null;
    }
    materialFloor.needsUpdate = true;
  });

  // Mega
  /*var guiMega = gui.addFolder('Mega Shark');
  guiMega.add(dataMega, 'speed', 0, 5);
  var scale = guiMega.add(dataMega, 'scale', 0.01, 1);
  guiMega.open();
  scale.onChange(function(value) {
    objMega.scale.set(value, value, value);
  });*/

}

function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

}

function onDocumentMouseMove(event) {
	mouseX = (event.clientX - windowHalfX) / 2;
	mouseY = (event.clientY - windowHalfY) / 2;
}

// ----------

function lightsInit() {

  hemisLight = new THREE.HemisphereLight(odark, oSand, 0.4);
  if (dataScene.hemisphere) scene.add(hemisLight);

  // ----------
  // Ambient

  ambientLight = new THREE.AmbientLight(odark, 1);
	if (dataScene.ambient) scene.add(ambientLight);

  // ----------
  // Directional

	var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
	directionalLight.position.set(0, 1000, 0);
	scene.add(directionalLight);

  directionalLight.castShadow = true;

  //var helper = new THREE.DirectionalLightHelper(directionalLight, 10);
  //scene.add(helper);

  // ----------
  // Spotlight {
  /*
  var spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(0, 1000, 0);

  spotLight.shadow.mapSize.width = floor.geometry.parameters.width;
  spotLight.shadow.mapSize.height = floor.geometry.parameters.height;
  spotLight.castShadow = true;
  spotLight.shadow.camera.near = 1;
  spotLight.shadow.camera.far = 2100 - floor.position.y;
  //scene.add(spotLight);
  */
  /*var helper = new THREE.SpotLightHelper(spotLight.shadow.camera);
  scene.add(helper);*/
  /*
  }*/
  // ----------
  // Points {

  /*var sphere = new THREE.SphereGeometry(1, 16, 8);

  light1 = new THREE.PointLight(0xff0040, 2, 50);
	light1.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xff0040 })));
	scene.add(light1);

	light2 = new THREE.PointLight(0x0040ff, 2, 50);
	light2.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0x0040ff })));
	scene.add(light2);

	light3 = new THREE.PointLight(0x80ff80, 2, 50);
	light3.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0x80ff80 })));
	scene.add(light3);

	light4 = new THREE.PointLight(0xffaa00, 2, 50);
	light4.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xffaa00 })));
	scene.add(light4);*/
  /*
  }*/

}

function lightsRender(time) {

	light1.position.x = Math.sin(time) * 60;
	light1.position.y = Math.cos(time) * 80;
	light1.position.z = Math.cos(time) * 30;

	light2.position.x = Math.cos(time) * 30;
	light2.position.y = Math.sin(time) * 40;
	light2.position.z = Math.sin(time) * 30;

	light3.position.x = Math.sin(time) * 30;
	light3.position.y = Math.cos(time) * 40;
	light3.position.z = Math.sin(time) * 30;

	light4.position.x = Math.sin(time) * 30;
	light4.position.y = Math.cos(time) * 40;
	light4.position.z = Math.sin(time) * 30;

}

// ----------

function floorInit() {

  var repeat = 6;
  var anisotropy = 16;

  materialFloor_map = new THREE.TextureLoader().load('models/textures/floor4/map.png', function (texture) {
    materialFloor_map.wrapS = materialFloor_map.wrapT = THREE.RepeatWrapping;
    materialFloor_map.offset.set(0, 0);
    materialFloor_map.repeat.set(repeat, repeat);
    materialFloor_map.anisotropy = anisotropy;
  } );
  materialFloor_norm = new THREE.TextureLoader().load('models/textures/floor4/map_NRM.png', function (texture) {
    materialFloor_norm.wrapS = materialFloor_norm.wrapT = THREE.RepeatWrapping;
    materialFloor_norm.offset.set(0, 0);
    materialFloor_norm.repeat.set(repeat, repeat);
    materialFloor_norm.anisotropy = anisotropy;
  } );
  materialFloor_bump = new THREE.TextureLoader().load('models/textures/floor4/map_DISP.png', function (texture) {
    materialFloor_bump.wrapS = materialFloor_bump.wrapT = THREE.RepeatWrapping;
    materialFloor_bump.offset.set(0, 0);
    materialFloor_bump.repeat.set(repeat, repeat);
    materialFloor_bump.anisotropy = anisotropy;
  } );

  var isMap = (dataFloor.map) ? materialFloor_map : null;
  var isBump = (dataFloor.bump) ? materialFloor_bump : null;
  var isNorm = (dataFloor.norm) ? materialFloor_norm : null;

  materialFloor = new THREE.MeshPhongMaterial({

    map: materialFloor_map,

    bumpMap: isMap,
    bumpScale: 2,

    normalMap: isNorm,
    normalScale: new THREE.Vector2(0.8, 0.8),

    color: oSand,
    specular: oSand,

		reflectivity: 6,
		shininess: 2

	});

  floor = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), materialFloor);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0,0,0);
  floor.castShadow = false;
  floor.receiveShadow = true;
  scene.add(floor);

  // ----------

  /*var floorCaustics = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), matCaustics);
  floorCaustics.rotation.x = -Math.PI / 2;
  floorCaustics.position.set(0,2,0);
  floor.castShadow = false;
  floor.receiveShadow = false;
  scene.add(floorCaustics);*/

}

// ----------

function objInit() {

	// Load Manager
	var manager = new THREE.LoadingManager();
	manager.onProgress = function (item, loaded, total) {
		//console.log(item, loaded, total);
	};

	var onProgress = function (xhr) {
		if (xhr.lengthComputable) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			//console.log(xhr.currentTarget.responseURL, Math.round(percentComplete, 2) + '% downloaded');
		}
	};
	var onError = function (xhr) {
    console.log(xhr);
	};

  // ----------

  causticsInit();

  // ----------
  // Turtle {

  var texTurtle = new THREE.Texture();
	var texTurtleLoader = new THREE.ImageLoader(manager);
  texTurtleLoader.load('models/anim/caretta-caretta/Caretta-caretta-nm.jpg', function (image) {
    texTurtle.image = image;
		texTurtle.needsUpdate = true;
	});

  var loader = new THREE.JSONLoader();
  loader.load('models/anim/caretta-caretta/blender.json', function(geometry, materials) {

    //console.log('geometry', geometry);
    //console.log('materials', materials);

    materials.forEach(function (material) {
      material.normalMap = texTurtle;
      material.skinning = true;
      material.shininess = 0.4;
      material.metalness = 0.1;
    });

    var turtle = {};

    for (var i = 0, limit = 6; i < limit; ++i) {

      var mesh = new THREE.SkinnedMesh(geometry, materials);

      var s = THREE.Math.randFloat(20, 50);
      mesh.scale.set(s, s, s);

      var x = THREE.Math.randFloat(-200, 200);
      var y = THREE.Math.randFloat(-150, 200) + levelY;
      var z = THREE.Math.randFloat(-3000, -2000);
      mesh.position.set( x, y, z );

      // Nah
      //mesh.matrixAutoUpdate = false;
      //mesh.updateMatrix();

      scene.add(mesh);

      var mixer = new THREE.AnimationMixer(mesh);
      var action = {};
      action.hello = mixer.clipAction(geometry.animations[1]);

      var speed = THREE.Math.randFloat(0.5, 1);
      action.hello.setEffectiveTimeScale(speed * THREE.Math.randFloat(1, 2.4));
      //speed *= 0.5;

      action.hello.setEffectiveWeight(0.6);
      action.hello.setDuration(3);
      action.hello.startAt(- Math.random());

      // Nah
      //action.hello.setLoop(THREE.LoopOnce, 0);
      //action.hello.clampWhenFinished = true;

      action.hello.enabled = true;
      action.hello.play();

      turtleArr.push({
        mesh: mesh,
        scale: s,
        position: {
          x: x,
          y: y,
          z: z
        },
        mixer: mixer,
        speed: speed
      });

    }

  }, onProgress, onError);
  /*
  }*/
  // ----------
  // Shark (hammerhead) {

  var texShark = new THREE.Texture();
	var texSharkLoader = new THREE.ImageLoader(manager);
  texSharkLoader.load('models/anim/great-hammerhead/textures/map.png', function (image) {
    texShark.image = image;
		texShark.needsUpdate = true;
	});

  var texSharkNorm = new THREE.Texture();
	var texSharkNormLoader = new THREE.ImageLoader(manager);
  texSharkNormLoader.load('models/anim/great-hammerhead/textures/map_normal.png', function (image) {
    texSharkNorm.image = image;
		texSharkNorm.needsUpdate = true;
	});

  var texSharkRough = new THREE.Texture();
	var texSharkRoughLoader = new THREE.ImageLoader(manager);
  texSharkRoughLoader.load('models/anim/great-hammerhead/textures/map_roughness.png', function (image) {
    texSharkRough.image = image;
		texSharkRough.needsUpdate = true;
	});

  var objSharkLoader = new THREE.JSONLoader();
  objSharkLoader.load('models/anim/great-hammerhead/blender.json', function(geometry, materials) {

  	// test ----------
    /*var runnerGeometry = new THREE.PlaneGeometry(50, 50, 1, 1);
  	var runner = new THREE.Mesh(runnerGeometry, matCaustics);
  	runner.position.set(-100,levelY,0);
  	scene.add(runner);*/
    // ---------------

    //console.log('geometry', geometry);
    console.log('materials', materials);
    /*
    materials.forEach(function (material) {

      material.skinning = true;

      //material.map = texShark;
      //material.normalMap = texSharkNorm;
      //material.lightMap = texSharkRough;
      //material.aoMap = matCaustics;

      //material.color = 0xffffff;
      //material.specular = 0xffffff;
      //material.emissive = 0x000000;

      //material.reflectivity = 1;
      material.reflectivity = 0;
      //material.shininess = 6;
      material.shininess = 0;

    });
    */
    /*materials.push(matCaustics);
    materials = new THREE.MeshFaceMaterial(materials);*/

    var matShark = new THREE.MeshPhongMaterial({

      skinning: true,

      map: texShark,

      bumpMap: texSharkNorm,
      bumpScale: 2,

      normalMap: texSharkNorm,
      normalScale: new THREE.Vector2(0.8, 0.8),

      lightMap: texSharkRough,

      color: 0xffffff,
      emissive: 0x000000,
      specular: 0xffffff,

  		reflectivity: 0,
  		shininess: 2,

      //wireframe: true,
      //color: 0xCCCCCC

  	});

    var matWire = new THREE.MeshBasicMaterial({
      skinning: true,
      color: 0xFF0000,
      wireframe: true,
      transparent: true
    });

    //matShark.transparent = true;
    //matShark.blending = THREE.AdditiveBlending;
    //matShark.blending = THREE.CustomBlending;
    //matShark.needsUpdate = true;

    matCaustics.skinning = true;
    matCaustics.side = THREE.DoubleSide;
    matCaustics.transparent = true;
    matCaustics.depthWrite = false;
    matCaustics.blending = THREE.AdditiveBlending;
    matCaustics.needsUpdate = true;

    //materials = THREE.MeshFaceMaterial([matShark, matCaustics, matWire]);
    //materials = new THREE.MeshFaceMaterial([matShark, matWire]);
    //materials = [matShark, matCaustics];

    var mesh = new THREE.SkinnedMesh(geometry, matShark);
    console.log('mesh', mesh);


    var s = 9;
    mesh.scale.set(s, s, s);

    var x, y, z;
    x = 0;
    y = levelY - 120;
    z = 0;
    mesh.position.set( x, y, z );

    //mesh.matrixAutoUpdate = false;
    //mesh.updateMatrix();

    scene.add(mesh);

    var mixer = new THREE.AnimationMixer(mesh);
    var action = {};
    action.swim = mixer.clipAction(geometry.animations[0]);

    var speed = THREE.Math.randFloat(0.5, 1);
    action.swim.setEffectiveTimeScale(1);
    speed *= 0.5;

    action.swim.setEffectiveWeight(0.8);
    //action.swim.setDuration(1);
    action.swim.startAt(- Math.random());

    action.swim.enabled = true;
    action.swim.play();

    sharkArr.push({
      mesh: mesh,
      scale: s,
      position: {
        x: x,
        y: y,
        z: z
      },
      mixer: mixer,
      speed: speed
    });

  }, onProgress, onError);
  /*
  }*/
	// ----------
  // Mega Shark {
  /*
  var texMega = new THREE.Texture();
	var texMegaLoader = new THREE.ImageLoader(manager);
  texMegaLoader.load('models/static/Mega/Mega.png', function (image) {
    texMega.image = image;
		texMega.needsUpdate = true;
	});

	var objMegaLoader = new THREE.OBJLoader(manager);
  objMegaLoader.load('models/static/Mega/model.obj', function (object) {

    objMega = object;

    console.log('object', objMega);

    // Apply texture
		objMega.traverse(function (child) {
			if (child instanceof THREE.Mesh) {
        child.material.map = texMega;
        child.castShadow = true;
      }
		});

		objMega.scale.set(dataMega.scale, dataMega.scale, dataMega.scale);
    objMega.position.y = levelY;
    objMega.position.z = -300;

    scene.add(objMega);

    // Create an AnimationMixer, and get the list of AnimationClip instances
		//mixer = new THREE.AnimationMixer(object);
		//var action = mixer.clipAction(object.animations[ 0 ]);
		//action.play();

	}, onProgress, onError);
    */
  /*
  }*/
  // ----------
	// Whale {
  /*
  var texWhale = new THREE.Texture();
	var texWhaleLoader = new THREE.ImageLoader(manager);
  texWhaleLoader.load('models/static/Humpback/HUMPBACK.JPG', function (image) {
    texWhale.image = image;
		texWhale.needsUpdate = true;
	});

	var objWhaleLoader = new THREE.OBJLoader(manager);
  objWhaleLoader.load('models/static/Humpback/model.obj', function (object) {

    objWhale = object;

		objWhale.traverse(function (child) {
			if (child instanceof THREE.Mesh) {
        child.material.map = texWhale;
      }
		});

    objWhale.scale.set(50, 50, 50);

    objWhale.position.x = -400;
    objWhale.position.y = levelY;
    objWhale.position.z = -300;

		scene.add(objWhale);

	}, onProgress, onError);
  */
  /*
  }*/
}

// ----------

function causticsInit() {

  console.log('causticsInit');

  var texCaustics = new THREE.Texture();
	var texCausticsLoader = new THREE.ImageLoader();
  texCausticsLoader.load('models/textures/sprite-caustic.png', function (image) {
    texCaustics.image = image;
    texCaustics.wrapS = texCaustics.wrapT = THREE.RepeatWrapping;
    texCaustics.repeat.set(2, 2);
		texCaustics.needsUpdate = true;
	});

	texAnimCaustics = new TextureAnimator(
    texCaustics,
    10, 1, // horiz, vert
    10, // total
    75 // duration
  );

  matCaustics.map = texCaustics;

	/*matCaustics = new THREE.MeshBasicMaterial({
    map: runnerTexture,
    side: THREE.DoubleSide
  });
  matCaustics.blending = THREE.AdditiveBlending;*/

	/*var runnerGeometry = new THREE.PlaneGeometry(50, 50, 1, 1);
	var runner = new THREE.Mesh(runnerGeometry, matCaustics);
	runner.position.set(-100,levelY,0);
	scene.add(runner);*/

}

function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) {

  // note: texture passed by reference, will be updated by the update function.

  this.tilesHorizontal = tilesHoriz;
  this.tilesVertical = tilesVert;

  // how many images does this spritesheet contain?
  // usually equals tilesHoriz * tilesVert, but not necessarily,
  // if there at blank tiles at the bottom of the spritesheet.

  this.numberOfTiles = numTiles;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);

  // how long should each image be displayed?
  this.tileDisplayDuration = tileDispDuration;

  // how long has the current image been displayed?
  this.currentDisplayTime = 0;

  // which image is currently being displayed?
  this.currentTile = 0;

  this.update = function(milliSec) {
    this.currentDisplayTime += milliSec;
    while (this.currentDisplayTime > this.tileDisplayDuration) {
      this.currentDisplayTime -= this.tileDisplayDuration;
      this.currentTile++;
      if (this.currentTile == this.numberOfTiles)
        this.currentTile = 0;
      var currentColumn = this.currentTile % this.tilesHorizontal;
      texture.offset.x = currentColumn / this.tilesHorizontal;
      var currentRow = Math.floor(this.currentTile / this.tilesHorizontal);
      texture.offset.y = currentRow / this.tilesVertical;
    }
  };
}

// ----------

function render() {

  var time = Date.now() * 0.0009;
	var delta = clock.getDelta();

  stats.update();

  // ----------
  // Caustics

  if (texAnimCaustics) {
    texAnimCaustics.update(1000 * delta);
  }

  // ----------
  // Update obj

  if (objMega) {
    objMega.position.z += dataMega.speed;
    if (objMega.position.z > 1000) {
      objMega.position.z = -300;
    }
  }

  if (objWhale) {
    objWhale.position.z += 0.3;
    objWhale.position.y += 0.025;
    if (objWhale.position.z > 1000) {
      objWhale.position.z = -500;
      objWhale.position.y = levelY;
    }
  }

  // ----------
  //lightsRender(time);
  // ----------
  // Animations

  var i, limit;

  if (turtleArr) {
    for(i = 0, limit = turtleArr.length; i < limit; ++i) {
      turtleArr[i].mixer.update(delta);
      turtleArr[i].mesh.position.z += turtleArr[i].speed;
      if (turtleArr[i].mesh.position.z > 1000) {
        turtleArr[i].mesh.position.z = turtleArr[i].position.z;
      }
    }
  }

  if (sharkArr) {
    for(i = 0, limit = sharkArr.length; i < limit; ++i) {
      sharkArr[i].mixer.update(delta);
      //fishArr[i].mesh.position.z += fishArr[i].speed;
      //if (fishArr[i].mesh.position.z > 1000) {
      //  fishArr[i].mesh.position.z = fishArr[i].position.z;
      //}
    }
  }

  // ----------

	renderer.render(scene, camera);

}

// ----------

function animate() {
	requestAnimationFrame(animate);
	render();
}
