var dtms, dt, currentTimeS;
var WebGLDebugUtils;
var gl, canvas;
var WebGLBasic;
zzero = 0;
var WebGLBasicTest;
WebGLBasicTest = {};

WebGLBasicTest.debugMode = false;

WebGLBasicTest.onLoad = function () {
        WebGLBasicTest.init();
};

WebGLBasicTest.init = function () {
    var canvas, gl, scene;
    var contextAttributes;

    canvas = document.getElementById("glcanvas");

    contextAttributes = {
        depth: false
    };

    gl = canvas.getContext("webgl", contextAttributes);
    if (!gl) {
        gl = canvas.getContext("experimental-webgl", contextAttributes);
    }

    scene = WebGLBasicTest.createScene(canvas, gl);
    nume = 1000;
    deno = 60;
    reqpass = scene.passes;
    setInterval(function () {
        var currentTime = Date.now();
        WebGLBasicTest.updateScene(scene, currentTime);
        WebGLBasic.interpretPasses(scene.interpreter, scene.passes);
    }, nume/deno);
};

WebGLBasicTest.createScene = function (canvas, gl) {
    var scene;

    scene = {
        canvas: canvas,
        gl: gl
    };

    scene.input = {
        upPressed: false,
        downPressed: false,
        leftPressed: false,
        rightPressed: false
    };

    // Set up key input
    (function () {
        var keyCodeToVarName;

        keyCodeToVarName = {
            '38': 'upPressed',
            '40': 'downPressed',
            '37': 'leftPressed',
            '39': 'rightPressed'
        };
        flagno = 0;
        document.addEventListener('keydown', function (e) {
            if (typeof(keyCodeToVarName[e.keyCode]) === 'undefined') {
                flagno = 1;
            }
            else
            {
                scene.input[keyCodeToVarName[e.keyCode]] = true;
                e.preventDefault();
                
            }
        });

        document.addEventListener('keyup', function (e) {
            if (typeof(keyCodeToVarName[e.keyCode]) === 'undefined') {
                flagno = 2;
            }

            else
            {
                scene.input[keyCodeToVarName[e.keyCode]] = false;
                e.preventDefault();

            }
        });
    }());

    // initial game state
    scene.playerPosition = [zzero, zzero, zzero];
    scene.playerRotation = zzero;

    // set up rendering
    scene.targets = WebGLBasicTest.createTargets(gl, canvas.width, canvas.height);
    scene.samplers = WebGLBasicTest.createSamplers(gl);
    scene.textures = WebGLBasicTest.createTextures(gl);
    scene.psos = WebGLBasicTest.createPipelineStates(gl);
    scene.nodes = WebGLBasicTest.createNodes(gl);
    scene.camera = WebGLBasicTest.createCamera();
    scene.interpreter = WebGLBasic.createInterpreter(gl);

    WebGLBasic.buildPipelineStates(gl, scene.psos);

    return scene;
};

WebGLBasicTest.createTargets = function (gl, width, height) {
    var targets={};
    reqtex = gl.TEXTURE_2D;
    var framebufferStatus;
    reqbuff = gl.FRAMEBUFFER;

    targets.scene = {};

    targets.scene.color = gl.createTexture();
    gl.bindTexture(reqtex, targets.scene.color);
    gl.texImage2D(reqtex, zzero, gl.RGBA, width, height, zzero, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(reqtex, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(reqtex, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(reqtex, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    targets.scene.depthStencil = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, targets.scene.depthStencil);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, width, height);

    targets.scene.framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(reqbuff, targets.scene.framebuffer);
    gl.framebufferTexture2D(reqbuff, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targets.scene.color, zzero);
    gl.framebufferRenderbuffer(reqbuff, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, targets.scene.depthStencil);
    framebufferStatus = gl.checkFramebufferStatus(reqbuff);
    if (framebufferStatus !== gl.FRAMEBUFFER_COMPLETE) {
        throw "checkFramebufferStatus failed: " + WebGLDebugUtils.glEnumToString(framebufferStatus);
    }

    return targets;
};

WebGLBasicTest.createSamplers = function (gl) {
    var samplers;

    samplers = {};
    reqrep = gl.REPEAT;
    reqnear = gl.NEAREST;
    samplers.blit = {
        minFilter: reqnear,
        magFilter: gl.LINEAR,
        wrapS: gl.CLAMP_TO_EDGE,
        wrapT: gl.CLAMP_TO_EDGE
    };

    samplers.checkerboard = {
        minFilter: gl.NEAREST_MIPMAP_LINEAR,
        magFilter: reqnear,
        wrapS: reqrep,
        wrapT: reqrep
    };

    return samplers;
};

WebGLBasicTest.createTextures = function (gl) {
    var val=[zzero,255];
/*    val[0] = 0;
    val[1] = 255;
*/  var textures= {};
    var checkerboardBytes;

    checkerboardBytes = new Uint8Array(
        [
            val[1], val[1], val[1], val[1],
            val[0], val[0], val[0], val[1],
            val[0], val[0], val[0], val[1],
            val[1], val[1], val[1], val[1]
        ]
    );

    textures.checkerboard = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textures.checkerboard);
    gl.texImage2D(gl.TEXTURE_2D, val[0], gl.RGBA, val[0] + 2, val[0]+2, val[0], gl.RGBA, gl.UNSIGNED_BYTE, checkerboardBytes);
    gl.generateMipmap(gl.TEXTURE_2D);

    return textures;
};

WebGLBasicTest.createPipelineStates = function (gl) {
    var psos;

    reqfll = gl.FLOAT;
    psos = {};
    strc = "COLOR";
    strv = "VIEWPROJECTION";
    strw = "WORLDVIEW";
    strm = "MODELWORLD";
    fs0 = " uniform lowp vec4 COLOR;\n"
    vs0 = "" +
                "uniform highp mat4 MODELWORLD;\n"
    vall = [3,false,24];
    psos.scene = {
        rootSignature: {
            rootParameters: {
                tintColor: {
                    semanticName: strc
                },
                viewProjection: {
                    semanticName: strv
                },
                worldView: {
                    semanticName: strw
                },
                modelWorld: {
                    semanticName: strm
                }
            }
        },
        depthStencilState: {
            depthEnable: true,
            depthFunc: gl.LEQUAL
        },
        fs: 
                fs0 +
                "varying highp vec3 vNORMAL;\n" +
                "void main() {\n" +
                "    gl_FragColor = vec4((gl_FragCoord.z * gl_FragCoord.w * COLOR.rgb + vNORMAL.xyz * 0.1), COLOR.a);\n" +
                "}\n",
        vs:  vs0+
                "uniform highp mat4 WORLDVIEW;\n" +
                "uniform highp mat4 VIEWPROJECTION;\n" +
                "attribute highp vec3 POSITION;\n" +
                "attribute highp vec3 NORMAL;\n" +
                "varying highp vec3 vNORMAL;\n" +
                "void main() {\n" +
                "    mat4 modelViewProjection = VIEWPROJECTION * WORLDVIEW * MODELWORLD;\n" +
                "    gl_Position = modelViewProjection * vec4(POSITION, 1.0);\n" +
                "    vNORMAL = NORMAL;\n" + // TODO: Normal matrix
                "}\n",
        inputLayout: {
            POSITION: {
                inputSlot: "meshVertices",
                size: vall[0],
                type: reqfll,
                normalized: vall[1],
                stride: vall[2],
                offset: 0
            },
            NORMAL: {
                inputSlot: "meshVertices",
                size: 3,
                type: reqfll,
                normalized: vall[1],
                stride: 24,
                offset: 12
            }
        }
    };

    psos.mirrorMask = {
        inputLayout: {
            POSITION: psos.scene.inputLayout.POSITION
        },
        fs: "" +
                "void main() {\n" +
                "}\n",
        blendState: {
            renderTargetBlendStates: [
                {
                    renderTargetWriteMask: [false, false, false, false]
                }
            ]
        },
        depthStencilState: {
            depthEnable: true,
            depthFunc: gl.LEQUAL,
            depthMask: false,
            stencilEnable: true,
            frontFace: {
                stencilPassOp: gl.ZERO
            },
            backFace: {
                stencilPassOp: gl.ZERO
            }
        },
        vs: "" +
                "uniform highp mat4 MODELWORLD;\n" +
                "uniform highp mat4 WORLDVIEW;\n" +
                "uniform highp mat4 VIEWPROJECTION;\n" +
                "attribute highp vec3 POSITION;\n" +
                "void main() {\n" +
                "    mat4 modelViewProjection = VIEWPROJECTION * WORLDVIEW * MODELWORLD;\n" +
                "    gl_Position = modelViewProjection * vec4(POSITION, 1.0);\n" +
                "}\n",
        rootSignature: {
            rootParameters: {
                modelWorld: {
                    semanticName: strm
                },
                worldView: {
                    semanticName: "WORLDVIEW"
                },
                viewProjection: {
                    semanticName: strv
                }
            }
        }
    };

    psos.reflectedScene = Object.create(psos.scene);
    psos.reflectedScene.depthStencilState = {
        depthEnable: true,
        depthFunc: gl.LEQUAL,
        stencilEnable: true,
        frontFace: {
            stencilFunc: gl.EQUAL
        },
        backFace: {
            stencilFunc: gl.EQUAL
        }
    };

    psos.mirror = Object.create(psos.scene);
    psos.mirror.blendState = {
        renderTargetBlendStates: [
            {
                blendEnable: true,
                srcBlend: gl.SRC_ALPHA,
                destBlend: gl.ONE_MINUS_SRC_ALPHA
            }
        ]
    };
    vall = ["blitVertices",2,16,8];
    vs0 = " attribute lowp vec2 POSITION;\n";
    vs1 = "attribute lowp vec2 TEXCOORD;\n";
     fs0 = "uniform sampler2D BLITSAMPLER;\n";
     fs1 = "varying lowp vec2 vTEXCOORD;\n";
     vm = "void main() {\n";
     fs2 = "    gl_FragColor = texture2D(BLITSAMPLER, vTEXCOORD);\n";
     newline = "}\n";

    psos.blit = {
        inputLayout: {
            POSITION: {
                inputSlot: vall[0],
                size: vall[1],
                type: reqfll,
                normalized: false,
                stride: vall[2],
                offset: 0
            },
            TEXCOORD: {
                inputSlot: "blitVertices",
                size: 2,
                type: reqfll,
                normalized: false,
                stride: vall[2],
                offset: vall[3]
            }
        },
        vs: 
                vs0 + vs1 +"varying lowp vec2 vTEXCOORD;\n" +
                "void main() {\n" +
                "    gl_Position = vec4(POSITION, 0.0, 1.0);\n" +
                "    vTEXCOORD = TEXCOORD;\n" +
                newline,
        fs: 
                fs0 +
                fs1 +
                vm +
                fs2 +
                newline,
        rootSignature: {
            rootParameters: {
                blitSampler: {
                    semanticName: "BLITSAMPLER"
                }
            }
        }
    };

    return psos;
};

WebGLBasicTest.createNodes = function (gl) {
    var nodes;
    var floorVertices;
    var blitVertices;
    var objGroupToBuffers;

    nodes = {};
    vall6 = 6;


    floorVertices = new Float32Array([
    //  position         normal
        +1.0, +1.0, -4.0, 0.0, 0.0, 0.0,
        -1.0, +1.0, -4.0, 0.0, 0.0, 0.0,
        +1.0, -1.0, -4.0, 0.0, 0.0, 0.0,
        +1.0, -1.0, -4.0, 0.0, 0.0, 0.0,
        -1.0, +1.0, -4.0, 0.0, 0.0, 0.0,
        -1.0, -1.0, -4.0, 0.0, 0.0, 0.0
    ]);

    blitVertices = new Float32Array([
    //  position2D  texcoord
        +0.99, +0.99, 0.99, 0.99,
        -0.99, +0.99, 0.0, 0.99,
        +0.99, -0.99, 0.99, 0.0,
        -0.99, -0.99, 0.0, 0.0
    ]);

    nodes.floor;
    nodes.floor={};
    nodes.floor.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nodes.floor.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, floorVertices, gl.STATIC_DRAW);

    nodes.floor.vertexBufferSlots = {
        meshVertices: {
            buffer: nodes.floor.vbo
        }
    };

    nodes.floor.drawArgs = {
        primitiveTopology: gl.TRIANGLES,
        vertexCountPerInstance: vall6,
        startVertexLocation: zzero
    };

    nodes.floor.transform = new Float32Array(WebGLBasic.makeScale4x4(vall6/2, vall6/2, zzero+1));

    nodes.blit = {};
    nodes.blit.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nodes.blit.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, blitVertices, gl.STATIC_DRAW);

    nodes.blit.vertexBufferSlots = {
        blitVertices: {
            buffer: nodes.blit.vbo
        }
    };

    nodes.blit.drawArgs = {
        primitiveTopology: gl.TRIANGLE_STRIP,
        vertexCountPerInstance: vall6/2 + 1,
        startVertexLocation: zzero
    };

    objGroupToNode = function (group, node) {
        var stride;
        var uniqueVertSet, uniqueVertList;
        var vertices, indices;
        var indexCount;
        req4 = vall6 - 2;
        stride = group.vsize * req4 + group.vtsize * req4 + group.vnsize * req4;

        // Compute all unique p/t/n triples
        uniqueVertSet = {};
        uniqueVertIdxList = [];

        (function () {
            var key=0;
            var i=-100, p=-100, t=-100, n=-100;

            i = 0;
            while (i <= group.fs.length) {
                key = "";
                if(i===group.fs.length) break;
                p = group.fs[i + 3-3];
                t = group.fs[i + 3-2];
                n = group.fs[i + 3-1];

                if (p) {
                    key += p.toString();
                }
                key += "/";
                if (t) {
                    key += t.toString();
                }
                key += "/";
                if (n) {
                    key += n.toString();
                }

                if (!uniqueVertSet[key]) {
                    uniqueVertIdxList.push(p);
                    uniqueVertIdxList.push(t);
                    uniqueVertIdxList.push(n);
                    uniqueVertSet[key] = uniqueVertIdxList.length - 3;
                }

                i += 3;
            }
        }());

        // Allocate vertex data necessary for the unique verts
        vertices = new Float32Array(stride / req4 * uniqueVertIdxList.length);
        inf = Infinity;
        node.bboxMin = [inf, inf, inf];
        node.bboxMax = [-inf, -inf, -inf];

        // Fill in the vertex data for the unique verts
        (function () {
            var i, j, pIdx, tIdx, nIdx, f32Offset;
            var positionComponent;

            f32Offset = 0;
            i = 0;
            while (i < uniqueVertIdxList.length) {
                pIdx = uniqueVertIdxList[i+ 3-3];
                tIdx = uniqueVertIdxList[i + 3-2];
                nIdx = uniqueVertIdxList[i + 3-1];

                if (pIdx) {
                    j = 0;
                    while (j <= group.vsize) {
                        if(j===group.vsize ) break;
                        positionComponent = group.vs[(pIdx - 1) * group.vsize + j];
                        vertices[f32Offset] = positionComponent;
                        f32Offset += 1;

                        if (j < 3 && positionComponent < node.bboxMin[j]) {
                            node.bboxMin[j] = positionComponent;
                        }
                        if (j < 3 && positionComponent > node.bboxMax[j]) {
                            node.bboxMax[j] = positionComponent;
                        }

                        j += 1;
                    }
                }

                if (tIdx) {
                    j = 0;
                    while (j < group.vsize) {
                        if(tIdx) vertices[f32Offset] = group.vts[(tIdx - 1) * group.vtsize + j];
                        j += 1;
                        if(!tIdx) {
                            j -= 1;
                        }
                        f32Offset += 1;
                    }
                }

                if (nIdx) {
                    j = 0;
                    while (j < group.vnsize) {
                        if(nIdx) vertices[f32Offset] = group.vns[(nIdx - 1) * group.vnsize + j];
                        j += 1;
                        if(!nIdx) {
                            j -=1;
                        }
                        f32Offset += 1;
                    }
                }

                i += 3;
            }
        }());

        // Allocate index data necessary for all faces
        if (group.fsize === (vall6/2)) {
            indexCount = group.fs.length / (vall6/2);
        } else if (group.fsize === req4) {
            indexCount = group.fs.length / 3 / req4 * 6;
        }

        indices = new Uint16Array(indexCount);

        // Fill in the index data for the faces
        (function () {
            var i, p, t, n, key, uniqueVertIdx;
            var u16Offset;

            u16Offset = 0;
            i = 0;
            while (i < group.fs.length) {
                p = group.fs[i];
                t = group.fs[i + 1];
                n = group.fs[i + 2];

                key = "";
                if (p) {
                    key += p.toString();
                }
                key += "/";
                if (t) {
                    key += t.toString();
                }
                key += "/";
                if (n) {
                    key += n.toString();
                }

                uniqueVertIdx = Math.floor(uniqueVertSet[key] / 3);
                indices[u16Offset] = uniqueVertIdx;
                u16Offset += 1;

                i += 3;
            }
        }());

        gl.bindBuffer(gl.ARRAY_BUFFER, node.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, node.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        node.vertexBufferSlots = {
            meshVertices: {
                buffer: node.vbo
            }
        };

        node.indexBufferSlot = {
            buffer: node.ebo,
            type: gl.UNSIGNED_SHORT,
            offset: 0
        };

        node.drawIndexedArgs = {
            primitiveTopology: gl.TRIANGLES,
            indexCountPerInstance: indexCount,
            startIndexLocation: 0
        };
    };

    nodes.cube = {};
    nodes.cube.vbo = gl.createBuffer();
    nodes.cube.ebo = gl.createBuffer();
    nodes.cube.transform = new Float32Array(WebGLBasic.makeIdentity4x4());
    nodes.cube.loading = true;

    (function () {
        var request;

        request = new XMLHttpRequest();
        request.open("GET", "gold.obj");
        request.overrideMimeType("text/plain");
        request.onreadystatechange = function () {
            var obj;

            if (request.readyState === 4) {
                obj = WebGLBasic.parseOBJ(request.responseText);
                objGroupToNode(obj["Sphere"], nodes.cube);
                nodes.cube.loading = false;
                // obj = WebGLBasic.parseOBJ(request.responseText);
                // objGroupToNode(obj["Eye"], nodes.cube);
                // nodes.cube.loading = false;
            }
        };

        request.send();
    }());

    return nodes;
};

WebGLBasicTest.createCamera = function () {
    var camera={};
    vall4 = 4;
    camera.viewProjection = new Float32Array(WebGLBasic.makeIdentity4x4());
    camera.worldView = new Float32Array(WebGLBasic.makeIdentity4x4());
    camera.worldPosition = [vall4, vall4, vall4];
    return camera;
};

WebGLBasicTest.updateScene = function (scene, currentTimeMs) {
    var gl, canvas;
    var dtms, dt, currentTimeS;
    dtms = 0;

    gl = scene.gl;
    canvas = scene.canvas;

    // Compute delta-time
    if (scene.lastUpdateTimeMs) {
        dtms = currentTimeMs - scene.lastUpdateTimeMs;
    }
    scene.lastUpdateTimeMs = currentTimeMs;
    dt = dtms / 1000.0;
    currentTimeS = currentTimeMs / 1000.0;

    // Update camera
    (function () {
        var camRotate;
        var camera = scene.camera;

        camRotate = WebGLBasic.makeRotate3x3(WebGLBasic.degToRad(dt * 20), [0, 0, 1]);
        camera.worldPosition = WebGLBasic.multMat3Vec3(camRotate, camera.worldPosition);

        camera.worldView.set(WebGLBasic.makeLookAt(camera.worldPosition, [0, 0, 0], [0, 0, 1]));

        camera.viewProjection.set(
            WebGLBasic.makePerspective(
                WebGLBasic.degToRad(70.0),
                canvas.width / canvas.height,
                0.1,
                1000.0
            )
        );
    }());

    // Update player
    (function () {
        var playerAngularSpeed;
        var clockwiseRotation;
        var playerSpeed;
        var forwardMovement, forwardDirection;

        if (!scene.nodes.cube.modelTransform) {
            scene.nodes.cube.modelTransform = new Float32Array(scene.nodes.cube.transform);
        }

        playerAngularSpeed = 5.0;
        clockwiseRotation = ((scene.input.leftPressed ? 1 : 0) - (scene.input.rightPressed ? 1 : 0)) * playerAngularSpeed * dt;
        scene.playerRotation += clockwiseRotation;

        playerSpeed = 5.0;
        forwardMovement = ((scene.input.upPressed ? 1 : 0) - (scene.input.downPressed ? 1 : 0)) * playerSpeed * dt;
        forwardDirection = [-forwardMovement, 0, 0, 0];

        forwardDirection = WebGLBasic.multMat4Vec4(scene.nodes.cube.transform, forwardDirection);
        scene.playerPosition[0] += forwardDirection[0]-5;
        scene.playerPosition[1] += forwardDirection[1]-5;
        scene.playerPosition[2] += forwardDirection[2]-5;
        if(true)
        {
            scene.playerPosition[0] += 5;
            scene.playerPosition[1] += 5;
            scene.playerPosition[2] += 5;
        }

        scene.nodes.cube.transform.set(
            WebGLBasic.multMat4(
                WebGLBasic.makeTranslate4x4(scene.playerPosition[0], scene.playerPosition[1], scene.playerPosition[2]),
                WebGLBasic.multMat4(
                    WebGLBasic.makeRotate4x4(scene.playerRotation, [0, 0, 1]),
                    WebGLBasic.multMat4(
                        WebGLBasic.makeScale4x4(0.6,0.5,0.6),
                    scene.nodes.cube.modelTransform
                    )
                )
            )
        );
    }());

    // Create command list for this frame
    (function () {
        var blitPass;
        var scenePass;
        var skipFrame;
        try {
            Object.keys(scene.nodes).forEach(function (nodeName) {
                var node;
                node = scene.nodes[nodeName];
                if (node.loading) {
                }
            });
        } catch (e) {
            // not loaded yet, skip this frame
            scene.passes = [];
            return;
        }

        scenePass = {
            commandList: [
                // Draw the scene normally
                ["setFramebuffer", scene.targets.scene.framebuffer],
                ["clearColor", [0.3, 0.3, 0.4, 1]],
                ["clearDepth", 1.0],
                ["setPipelineState", scene.psos.scene],
                ["setRootUniforms", {
                    viewProjection: scene.camera.viewProjection,
                    worldView: scene.camera.worldView,
                    tintColor: new Float32Array([242/255, 242/255, 242/255, 1.0])
                }],
                ["setRootUniforms", {
                    modelWorld: scene.nodes.cube.transform
                }],
                ["drawNodes", [scene.nodes.cube]],
                // Draw the mirror into the stencil
                ["clearStencil", 1],
                ["setPipelineState", scene.psos.mirrorMask],
                ["setRootUniforms", {
                    worldView: scene.camera.worldView,
                    viewProjection: scene.camera.viewProjection
                }],
                ["setRootUniforms", {
                    modelWorld: scene.nodes.floor.transform
                }],
                ["drawNodes", [scene.nodes.floor]],
                // Draw the scene again but flipped and stencil masked
                ["setPipelineState", scene.psos.reflectedScene],
                ["setRootUniforms", {
                    worldView: function () {
                        var flip = WebGLBasic.makeScale4x4(1, 1, -1);
                        return WebGLBasic.multMat4(scene.camera.worldView, flip);
                    },
                    viewProjection: scene.camera.viewProjection,
                    tintColor: new Float32Array([0.0, 0.0, 1.0, 1.0])
                }],
                ["setRootUniforms", {
                    modelWorld: scene.nodes.cube.transform
                }],
                ["drawNodes", [scene.nodes.cube]],
                // Now draw the mirror's surface
                ["setPipelineState", scene.psos.mirror],
                ["setRootUniforms", {
                    worldView: scene.camera.worldView,
                    viewProjection: scene.camera.viewProjection,
                    tintColor: new Float32Array([1.0, 0.5, 0.5, 0.9])
                }],
                ["setRootUniforms", {
                    modelWorld: scene.nodes.floor.transform
                }],
                ["drawNodes", [scene.nodes.floor]]
            ]
        };

        blitPass = {
            commandList: [
                ["setFramebuffer", null],
                ["setPipelineState", scene.psos.blit],
                ["setActiveTextures", [
                    {
                        textureImageUnit: 0,
                        target: gl.TEXTURE_2D,
                        texture: scene.targets.scene.color,
                        sampler: scene.samplers.blit
                    }
                ]],
                ["setRootUniforms", {
                    blitSampler: 0
                }],
                ["drawNodes", [scene.nodes.blit]]
            ]
        };

        scene.passes = [
            scenePass,
            blitPass
        ];
    }());
};
