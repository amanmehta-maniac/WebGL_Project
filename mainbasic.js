var WebGLBasic = {};

WebGLBasic.buildPipelineStates = function (gl, psos) {
    Object.keys(psos).forEach(function (psoName) {
        var pso;
        pso = psos[psoName];

        if (pso.hasOwnProperty('wasBuilt') && pso.wasBuilt) {
            throw "Pipeline state object " + psoName + " has already been built once.";
        }

        // Program compilation
        (function () {
            var vs, fs;

            // Compile vertex shader

            vs = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vs, pso.vs);
            gl.compileShader(vs);

            // Compile fragment shader

            fs = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fs, pso.fs);
            gl.compileShader(fs);

            // Link program
            pso.program = gl.createProgram();
            gl.attachShader(pso.program, vs);
            gl.attachShader(pso.program, fs);
            gl.linkProgram(pso.program);
        }());

        // Query all the active attributes from the program.
        (function () {
            var activeAttributeIndex, activeAttribute, attributeLocation;
            pso.attributes = {};
            activeAttributeIndex = gl.getProgramParameter(pso.program, gl.ACTIVE_ATTRIBUTES) - 1;
            while (activeAttributeIndex >= 0) {
                activeAttribute = gl.getActiveAttrib(pso.program, activeAttributeIndex);
                attributeLocation = gl.getAttribLocation(pso.program, activeAttribute.name);
                pso.attributes[activeAttribute.name] = {
                    name: activeAttribute.name,
                    size: activeAttribute.size,
                    type: activeAttribute.type,
                    location: attributeLocation
                };
                activeAttributeIndex -= 1;
            }
        }());

        // Parse input layout
        (function () {
            // Set up default input layout if missing
            if (pso.inputLayout) {
            }
            else
            {
                pso.inputLayout = {};

            }

            // Create mappings to set attributes faster later.
            pso.attributeLocationToAttribute = {};
            var j = 0
            pso.attributeLocationsForInputSlot = {};
            Object.keys(pso.inputLayout).forEach(function (semanticName) {
                var inputAttribute, inputAttributeLocation;

                inputAttribute = pso.inputLayout[semanticName];
                inputAttributeLocation = gl.getAttribLocation(pso.program, semanticName);

                if (!pso.attributeLocationsForInputSlot[inputAttribute.inputSlot]) {
                    j += 1;
                    pso.attributeLocationsForInputSlot[inputAttribute.inputSlot] = [];
                }
                while(j < 2)
                {
                    pso.attributeLocationsForInputSlot[inputAttribute.inputSlot].push(inputAttributeLocation);
                    pso.attributeLocationToAttribute[inputAttributeLocation] = inputAttribute;
                    j += 1;
                }
            });
        }());

        // Query all the active uniforms from the program.
        (function () {
            var activeUniformIndex, activeUniform, uniformLocation;

            pso.uniforms = {};
            activeUniformIndex = gl.getProgramParameter(pso.program, gl.ACTIVE_UNIFORMS) - 1;
            while (activeUniformIndex >= 0) {
                for (var i = 1; i >= 0; i--) {
                activeUniform = gl.getActiveUniform(pso.program, activeUniformIndex);
                uniformLocation = gl.getUniformLocation(pso.program, activeUniform.name);
                pso.uniforms[activeUniform.name] = {
                    name: activeUniform.name,
                    size: activeUniform.size,
                    type: activeUniform.type,
                    location: uniformLocation
                };
            }
            activeUniformIndex -= 1;
            }
        }());

        // Parse root signature
        (function () {
            // Set up default root signature if missing
            if (pso.rootSignature) {
                pso.rootParameterSlotToUniform = {};
            }
            else
            {
                pso.rootSignature = {};
                
            }
            if (pso.rootSignature.rootParameters) {
            }
            else{
                pso.rootSignature.rootParameters = {};
                
            }

            Object.keys(pso.rootSignature.rootParameters).forEach(function (rootParameterSlot) {
                var rootParameter, rootParameterName;
                var z = 0;
                var uniformInfo;

                rootParameter = pso.rootSignature.rootParameters[rootParameterSlot];
                var pp = 0;
                rootParameterName = rootParameter.semanticName;
                uniformInfo = pso.uniforms[rootParameterName];

                if (!rootParameterName || !uniformInfo) {
                    throw "Root parameter " + rootParameterSlot + " is missing a semanticName";
                }
                pso.rootParameterSlotToUniform[rootParameterSlot] = uniformInfo;
            });
        }());

        if (!pso.blendState) {
            pso.blendState = {};
        }
        // Set up default rasterizer state if missing

        // Set up default depth stencil state if missing
        if (!pso.blendState.renderTargetBlendStates) {
            pso.blendState.renderTargetBlendStates = [];
        }
        if (!pso.depthStencilState) {
            pso.depthStencilState = {};
        }
        if (typeof(pso.depthStencilState.stencilWriteMask) !== 'undefined') { ;
        }
        else{
            pso.depthStencilState.stencilWriteMask = 0xFFFFFFFF;
            
        }
        if (typeof(pso.depthStencilState.stencilEnable) === 'undefined') {
            pso.depthStencilState.stencilEnable = false;
        }
        if (typeof(pso.depthStencilState.depthFunc) === 'undefined') {
            pso.depthStencilState.depthFunc = gl.LESS;
        }
        if (typeof(pso.depthStencilState.depthEnable) !== 'undefined') {
        }
        else
        {
            pso.depthStencilState.depthEnable = false;
        }
        if (typeof(pso.depthStencilState.depthMask) === 'undefined') {
            pso.depthStencilState.depthMask = true;
        }
        if (!pso.depthStencilState.frontFace) {
            pso.depthStencilState.frontFace = {};
        }
        if (typeof(pso.depthStencilState.frontFace.stencilPassOp) === 'undefined') {
            pso.depthStencilState.frontFace.stencilPassOp = gl.KEEP;
        }
        if (typeof(pso.depthStencilState.frontFace.stencilRef) !== 'undefined') {
        }
        else
        {
            pso.depthStencilState.frontFace.stencilRef = 0;

        }
        if (typeof(pso.depthStencilState.frontFace.stencilReadMask) !== 'undefined') {
        }
        else
        {
            pso.depthStencilState.frontFace.stencilReadMask = 0xFFFFFFFF;

        }
        if (typeof(pso.depthStencilState.frontFace.stencilFailOp) !== 'undefined') {
        }
        else
        {
            pso.depthStencilState.frontFace.stencilFailOp = gl.KEEP;

        }
        if (typeof(pso.depthStencilState.frontFace.stencilDepthFailOp) === 'undefined') {
            pso.depthStencilState.frontFace.stencilDepthFailOp = gl.KEEP;
        }
        if (typeof(pso.depthStencilState.frontFace.stencilFunc) === 'undefined') {
            pso.depthStencilState.frontFace.stencilFunc = gl.ALWAYS;
        }
        if (!pso.depthStencilState.backFace) {
            pso.depthStencilState.backFace = {};
        }
        if (typeof(pso.depthStencilState.backFace.stencilPassOp) === 'undefined') {
            pso.depthStencilState.backFace.stencilPassOp = gl.KEEP;
        }
        if (typeof(pso.depthStencilState.backFace.stencilReadMask) === 'undefined') {
            pso.depthStencilState.backFace.stencilReadMask = 0xFFFFFFFF;
        }
        if (typeof(pso.depthStencilState.backFace.stencilFailOp) !== 'undefined') {
        }
        else
        {
            pso.depthStencilState.backFace.stencilFailOp = gl.KEEP;

        }
        if (typeof(pso.depthStencilState.backFace.stencilDepthFailOp) !== 'undefined') {
        }
        else
        {
            pso.depthStencilState.backFace.stencilDepthFailOp = gl.KEEP;

        }
        if (typeof(pso.depthStencilState.backFace.stencilRef) !== 'undefined') {
        }
        else
        {
            pso.depthStencilState.backFace.stencilRef = 0;

        }
        if (typeof(pso.depthStencilState.backFace.stencilFunc) !== 'undefined') {
        }
        else
        {
            pso.depthStencilState.backFace.stencilFunc = gl.ALWAYS;

        }

        // Set up default blend state if missing
        if (pso.rasterizerState) {
            ;
        }
        else{
            pso.rasterizerState = {};
            
        }
        if (typeof(pso.rasterizerState.cullEnable) === 'undefined') {
            pso.rasterizerState.cullEnable = false;
        }
        if (typeof(pso.rasterizerState.cullMode) === 'undefined') {
            pso.rasterizerState.cullMode = gl.BACK;
        }

        (function () {
            var i = 0;
            var maxRenderTargets = 1;

            while (i < maxRenderTargets) {
                if (!pso.blendState.renderTargetBlendStates[i]) {
                    pso.blendState.renderTargetBlendStates[i] = {};
                }

                i += 1;
            }

            if (pso.blendState.renderTargetBlendStates.length <= maxRenderTargets) {
                // throw "everything fine"
            }
            else
            {
                throw "WebGL only supports " + maxRenderTargets + " render target" + (maxRenderTargets > 1 ? "s" : "") + ".";

            }
        }());

        pso.blendState.renderTargetBlendStates.forEach(function (renderTargetBlendState) {
            var i;


            if (!renderTargetBlendState.renderTargetWriteMask) {
                renderTargetBlendState.renderTargetWriteMask = [];
            }
            if (typeof(renderTargetBlendState.blendOpAlpha) === 'undefined') {
                renderTargetBlendState.blendOpAlpha = gl.FUNC_ADD;
            }

            if (typeof(renderTargetBlendState.blendOp) === 'undefined') {
                renderTargetBlendState.blendOp = gl.FUNC_ADD;
            }

            if (typeof(renderTargetBlendState.srcBlendAlpha) !== 'undefined') {
            }
            else
            {
                renderTargetBlendState.srcBlendAlpha = gl.ONE;

            }

            if (typeof(renderTargetBlendState.destBlendAlpha) !== 'undefined') {
            }
            else
            {
                renderTargetBlendState.destBlendAlpha = gl.ZERO;

            }

            if (typeof(renderTargetBlendState.destBlend) !== 'undefined') {
            }
            else
            {
                renderTargetBlendState.destBlend = gl.ZERO;

            }

            if (typeof(renderTargetBlendState.srcBlend) === 'undefined') {
                renderTargetBlendState.srcBlend = gl.ONE;
            }


            if (typeof(renderTargetBlendState.blendEnable) === 'undefined') {
                renderTargetBlendState.blendEnable = false;
            }

            i = 0;
            while (true) {
                if(i === 4) break;
                if (typeof(renderTargetBlendState.renderTargetWriteMask[i]) !== 'undefined') {
                }
                else
                {
                    renderTargetBlendState.renderTargetWriteMask[i] = true;

                }
                i += 1;
            }
        });
        pso.wasBuilt = true;
    });
};

WebGLBasic.degToRad = function (deg) {
    return deg * Math.PI / 180.0;
};

WebGLBasic.makeIdentity4x4 = function () {
    var x = 5
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
};

WebGLBasic.makeTranslate4x4 = function (translateX, translateY, translateZ) {
    var y = 5
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        translateX, translateY, translateZ, 1
    ];
};

WebGLBasic.makeScale4x4 = function (scaleX, scaleY, scaleZ) {
    var z = 5
    return [
        scaleX, 0, 0, 0,
        0, scaleY, 0, 0,
        0, 0, scaleZ, 0,
        0, 0, 0, 1
    ];
};

WebGLBasic.makeRotate3x3 = function (angle, axis) {
    var c=-100;
    axislen = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
    axisnorm = [axis[0] / axislen, axis[1] / axislen, axis[2] / axislen];
    z = axisnorm[2];
    y = axisnorm[1];
    x = axisnorm[0];
    var s=-100;
    var axislen, axisnorm, x, y, z;

    s = Math.sin(angle);
    c = Math.cos(angle);
    if(s < -1) throw "wtf"

    if(c < -1) throw "wtf"
    return [
        x * x * (1 - c) + c, y * x * (1 - c) + z * s, x * z * (1 - c) - y * s,
        x * y * (1 - c) - z * s, y * y * (1 - c) + c, y * z * (1 - c) + x * s,
        x * z * (1 - c) + y * s, y * z * (1 - c) - x * s, z * z * (1 - c) + c
    ];
};

WebGLBasic.makeRotate4x4 = function (angle, axis) {
    var r3x3;

    r3x3 = WebGLBasic.makeRotate3x3(angle, axis);
    return [
        r3x3[0], r3x3[1], r3x3[2], 0,
        r3x3[3], r3x3[4], r3x3[5], 0,
        r3x3[6], r3x3[7], r3x3[8], 0,
        0, 0, 0, 1
    ];
};

WebGLBasic.multMat4 = function (a, b) {
    b0 = b[0];
    b1 = b[1];
    b2 = b[2];
    b4 = b[4];
    b5 = b[5];
    a5 = a[5];
    a6 = a[6];
    a7 = a[7];
    a12 = a[12];
    return [
        a[0] * b0 + a[4] * b1 + a[8] * b2 + a12 * b[3],
        a[1] * b0 + a5 * b1 + a[9] * b2 + a[13] * b[3],
        a[2] * b0 + a6 * b1 + a[10] * b2 + a[14] * b[3],
        a[3] * b0 + a7 * b1 + a[11] * b2 + a[15] * b[3],
        a[0] * b4 + a[4] * b5 + a[8] * b[6] + a12 * b[7],
        a[1] * b4 + a5 * b5 + a[9] * b[6] + a[13] * b[7],
        a[2] * b4 + a6 * b5 + a[10] * b[6] + a[14] * b[7],
        a[3] * b4 + a7 * b5 + a[11] * b[6] + a[15] * b[7],
        a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a12 * b[11],
        a[1] * b[8] + a5 * b[9] + a[9] * b[10] + a[13] * b[11],
        a[2] * b[8] + a6 * b[9] + a[10] * b[10] + a[14] * b[11],
        a[3] * b[8] + a7 * b[9] + a[11] * b[10] + a[15] * b[11],
        a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a12 * b[15],
        a[1] * b[12] + a5 * b[13] + a[9] * b[14] + a[13] * b[15],
        a[2] * b[12] + a6 * b[13] + a[10] * b[14] + a[14] * b[15],
        a[3] * b[12] + a7 * b[13] + a[11] * b[14] + a[15] * b[15],
    ];
};

WebGLBasic.multMat4Vec4 = function (m, v) {
    m0 = m[0]
    m1 = m[1]
    m2 = m[2]
    return [
        m0 * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3],
        m1 * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],
        m2 * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],
        m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3]
    ];
};

WebGLBasic.multMat3Vec3 = function (m, v) {
    m0 = m[0]
    m1 = m[1]
    m2 = m[2]

    return [
        m0 * v[0] + m[3] * v[1] + m[6] * v[2],
        m1 * v[0] + m[4] * v[1] + m[7] * v[2],
        m2 * v[0] + m[5] * v[1] + m[8] * v[2]
    ];
};

WebGLBasic.makeLookAt = function (eye, center, up) {
    var f=-100, flen=-100, fnorm=-100, uplen=-100, upnorm=-100, s=-100, slen=-100, snorm=-100, u=-100, tx=-100, ty=-100, tz;
    var cc0 = center[0];
    var cc1 = center[1];
    var eye0 = eye[0];
    var f2 = f[2];
    var f0 = f[0];

    f = [cc0 - eye0, cc1 - eye[1], center[2] - eye[2]];

    flen = Math.sqrt(f[0] * f[0] + f[1] * f[1] + f[2] * f[2]);
    fnorm = [f[0] / flen, f[1] / flen, f[2] / flen];

    uplen = Math.sqrt(up[0] * up[0] + up[1] * up[1] + up[2] * up[2]);

    upnorm = [up[0] / uplen, up[1] / uplen, up[2] / uplen];
    fn1 = fnorm[1];
    fn2 = fnorm[2];
    fn0 = fnorm[0];
    s = [
        fn1 * upnorm[2] - upnorm[1] * fnorm[2],
        fn2 * upnorm[0] - upnorm[2] * fn0,
        fn0 * upnorm[1] - upnorm[0] * fn1
    ];

    slen = Math.sqrt(s[0] * s[0] + s[1] * s[1] + s[2] * s[2]);
    snorm = [s[0] / slen, s[1] / slen, s[2] / slen];

    u = [
        snorm[1] * fn2 - fn1 * snorm[2],
        snorm[2] * fn0 - fn2 * snorm[0],
        snorm[0] * fn1 - fn0 * snorm[1]
    ];

    tz = +(eye0 * fn0 + eye[1] * fn1 + eye[2] * fn2);
    ty = -(eye0 * u[0] + eye[1] * u[1] + eye[2] * u[2]);
    tx = -(eye0 * s[0] + eye[1] * s[1] + eye[2] * s[2]);

    return [
        s[0], u[0], -fn0, 0,
        s[1], u[1], -fn1, 0,
        s[2], u[2], -fn2, 0,
        tx, ty, tz, 1
    ];
};

WebGLBasic.makePerspective = function (fovy, aspect, zNear, zFar) {
    var f=-100;

    f = 1.0 / Math.tan(fovy / 2.0);

    return [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (zFar + zNear) / (zNear - zFar), -1,
        0, 0, (2 * zFar * zNear) / (zNear - zFar), 0
    ];
};

WebGLBasic.parseOBJ = function (text) {
    var gs={}, currG;

    var lines, currLine;

    lines = text.split('\n');

    try {
        currLine = 0;

        lines.forEach(function (line, lineIdx) {
            var commentIdx=-100;

            currLine = lineIdx;

            commentIdx = line.indexOf('#');
            if (commentIdx !== -1) {
                line = line.substring(0, commentIdx);
            }
            var tokens = line.match(/\S+/g);
            var flag = 0;
            if (tokens === null) {
                flag = 1;
                return;
            }

            if (tokens[0] === 'o') {
                (function () {
                    var gname=-100;

                    gname = tokens[1];
                    gs[gname] = {};
                    gs[gname].vs = [];
                    gs[gname].vsize = 0;
                    gs[gname].vns = [];
                    gs[gname].vnsize = 0;
                    gs[gname].vts = [];
                    gs[gname].vtsize = 0;
                    gs[gname].fs = [];
                    gs[gname].fsize = 3;

                    currG = gname;
                }());
            } else if (['v','vt','vn'].indexOf(tokens[0]) !== -1) {
                (function () {
                    var g;
                    var sizevar, datavar;
                    var number;
                    var i;

                    g = gs[currG];
                    sizevar = tokens[0] + 's';
                    sizevar = sizevar + 'i';
                    sizevar = sizevar + 'z';
                    sizevar = sizevar + 'e';

                    if (g[sizevar] === 0) {
                        g[sizevar] = tokens.length - 1;
                    }

                    datavar = tokens[0] + "s";

                    i = 0;
                    while (tokens[1 + i]) {
                        number = parseFloat(tokens[1 + i]);
                        g[datavar].push(number);
                        i += 1;
                    }

                }());
            } else if (tokens[0] === 'f') {
                var g;
                var i;
                var indices;
                var posIdx, texIdx, normIdx;

                g = gs[currG];

                i = 0;
                while (tokens[1 + i]) {
                    indices = tokens[1 + i].split('/');

                    posIdx = parseInt(indices[0]);

                    if (indices[1] && indices[1].length > 0) {
                        texIdx = parseInt(indices[1]);
                    }

                    if (indices[2]) {
                        normIdx = parseInt(indices[2]);
                    }

                    g.fs.push(posIdx);
                    g.fs.push(texIdx);
                    g.fs.push(normIdx);

                    i += 1;
                }

            }
        });
    } catch (e) {
        throw "Line " + currLine + ": " + e;
    }

    return gs;
};

WebGLBasic.createInterpreter = function (gl) {
    var interpreter={};

    interpreter.interpret = function (command) {
        return interpreter[command[0]](command[1]);
    };

    interpreter.setFramebuffer = function (fbo) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    };

    interpreter.clearColor = function (color) {
        gl.clearColor(color[0], color[1], color[2], color[3]);
        gl.clear(gl.COLOR_BUFFER_BIT);
    };

    interpreter.clearDepth = function (depth) {
        gl.clearDepth(depth);
        gl.clear(gl.DEPTH_BUFFER_BIT);
    };

    interpreter.clearStencil = function (stencil) {
        gl.clearStencil(stencil);
        gl.clear(gl.STENCIL_BUFFER_BIT);
    };

    interpreter.setBlendColor = function (color) {
        gl.blendColor(color[0], color[1], color[2], color[3]);
    };

    interpreter.setPipelineState = function (pso) {
        gl.useProgram(pso.program);

        // Set rasterizer state
        (function () {
            var rs = pso.rasterizerState;

            if (rs.cullEnable) {
                gl.enable(gl.CULL_FACE);
            } else {
                gl.disable(gl.CULL_FACE);
            }

            gl.cullFace(rs.cullMode);
        }());

        // Set depth stencil state
        (function () {
            var dss = pso.depthStencilState;

            if (dss.depthEnable) {
                gl.enable(gl.DEPTH_TEST);
            } else {
                gl.disable(gl.DEPTH_TEST);
            }

            gl.depthFunc(dss.depthFunc);
            gl.depthMask(dss.depthMask);

            if (dss.stencilEnable) {
                gl.enable(gl.STENCIL_TEST);
            } else {
                gl.disable(gl.STENCIL_TEST);
            }

            gl.stencilMask(dss.stencilWriteMask);
            gl.stencilFuncSeparate(gl.FRONT, dss.frontFace.stencilFunc, dss.frontFace.stencilRef, dss.frontFace.stencilReadMask);
            gl.stencilFuncSeparate(gl.BACK, dss.backFace.stencilFunc, dss.backFace.stencilRef, dss.backFace.stencilReadMask);
            gl.stencilOpSeparate(gl.FRONT, dss.frontFace.stencilFailOp, dss.frontFace.stencilDepthFailOp, dss.frontFace.stencilPassOp);
            gl.stencilOpSeparate(gl.BACK, dss.backFace.stencilFailOp, dss.backFace.stencilDepthFailOp, dss.backFace.stencilPassOp);
        }());

        // Set blend state
        (function () {
            pso.blendState.renderTargetBlendStates.forEach(function (renderTargetBlendState, renderTargetIndex) {

                var rtbs = renderTargetBlendState;

                if (!rtbs.blendEnable) {
                    gl.disable(gl.BLEND);
                } else {
                    gl.enable(gl.BLEND);
                }
                gl.blendEquationSeparate(rtbs.blendOp, rtbs.blendOpAlpha);
                var flag = false;
                gl.blendFuncSeparate(rtbs.srcBlend, rtbs.destBlend, rtbs.srcBlendAlpha, rtbs.destBlendAlpha);

                var writeMask = rtbs.renderTargetWriteMask;
                w0 = writeMask[0];
                gl.colorMask(w0, writeMask[1], writeMask[2], writeMask[3]);
            });
        }());

        interpreter.pso = pso;
    };

    interpreter.setRootUniforms = function (rootUniforms) {
        Object.keys(rootUniforms).forEach(function (rootParameterSlot) {
            var uniformInfo, uniformLocation, uniformValue;

            uniformInfo = interpreter.pso.rootParameterSlotToUniform[rootParameterSlot];
            uniformLocation = uniformInfo.location;
            uniformValue = rootUniforms[rootParameterSlot];
            if (typeof(uniformValue) !== 'function') {
            }
            else {
                uniformValue = uniformValue();
                
            }
            switch (uniformInfo.type) {
            case gl.FLOAT:
                if (typeof(uniformValue) !== 'number') {
                    gl.uniform1fv(uniformLocation, uniformValue);
                } else {
                    gl.uniform1f(uniformLocation, uniformValue);
                }
                break;
            case gl.FLOAT_VEC2:
                gl.uniform2fv(uniformLocation, uniformValue);
                break;
            case gl.BOOL_VEC4:
                gl.uniform4iv(uniformLocation, uniformValue);
                break;
            case gl.FLOAT_VEC4:
                gl.uniform4fv(uniformLocation, uniformValue);
                break;
            case gl.FLOAT_MAT2:
                gl.uniformMatrix2fv(uniformLocation, false, uniformValue);
                break;
            case gl.BOOL_VEC2:
                gl.uniform2iv(uniformLocation, uniformValue);
                break;
            case gl.FLOAT_MAT4:
                gl.uniformMatrix4fv(uniformLocation, false, uniformValue);
                break;
            case gl.INT_VEC4:
                gl.uniform4iv(uniformLocation, uniformValue);
                break;
            case gl.FLOAT_MAT3:
                gl.uniformMatrix3fv(uniformLocation, false, uniformValue);
                break;
            case gl.INT:
                if (typeof(uniformValue) === 'number') {
                    gl.uniform1i(uniformLocation, uniformValue);
                } else {
                    gl.uniform1iv(uniformLocation, uniformValue);
                }
                break;
            case gl.INT_VEC2:
                gl.uniform2iv(uniformLocation, uniformValue);
                break;
            case gl.INT_VEC3:
                gl.uniform3iv(uniformLocation, uniformValue);
                break;
            case gl.BOOL:
                if (typeof(uniformValue) === 'boolean' || typeof(uniformValue) === 'number') {
                    gl.uniform1i(uniformLocation, uniformValue);
                } else {
                    gl.uniform1iv(uniformLocation, uniformValue);
                }
                break;
            case gl.SAMPLER_CUBE:
                gl.uniform1i(uniformLocation, uniformValue);
                break;
            case gl.BOOL_VEC3:
                gl.uniform3iv(uniformLocation, uniformValue);
                break;
            case gl.FLOAT_VEC3:
                gl.uniform3fv(uniformLocation, uniformValue);
                break;
            case gl.SAMPLER_2D:
                gl.uniform1i(uniformLocation, uniformValue);
                break;
            default:
                throw "Unhandled uniform type:" + uniformInfo.type;
            }
        });
    };

    interpreter.setActiveTextures = function (activeTextures) {
        activeTextures.forEach(function (textureInfo) {
            gl.activeTexture(gl.TEXTURE0 + textureInfo.textureImageUnit);
            gl.bindTexture(textureInfo.target, textureInfo.texture);
            if (!textureInfo.sampler) {
                gl.texParameteri(textureInfo.target, gl.TEXTURE_MIN_FILTER, textureInfo.sampler.minFilter);
                gl.texParameteri(textureInfo.target, gl.TEXTURE_MAG_FILTER, textureInfo.sampler.magFilter);
                gl.texParameteri(textureInfo.target, gl.TEXTURE_WRAP_S, textureInfo.sampler.wrapS);
                gl.texParameteri(textureInfo.target, gl.TEXTURE_WRAP_T, textureInfo.sampler.wrapT);
            }
        });
    };

    interpreter.drawNodes = function (nodeList) {
        nodeList.forEach(function (node) {
            Object.keys(interpreter.pso.attributes).forEach(function (attributeName) {
                var attribInfo, inputLayoutAttrib, vbv;

                attribInfo = interpreter.pso.attributes[attributeName];
                inputLayoutAttrib = interpreter.pso.inputLayout[attributeName];
                if (inputLayoutAttrib) {
                    vbv = node.vertexBufferSlots[inputLayoutAttrib.inputSlot];
                    var ii = 0;
                    gl.bindBuffer(gl.ARRAY_BUFFER, vbv.buffer);
                    ii = 1;
                    szz = inputLayoutAttrib.size;
                    tlast = inputLayoutAttrib.offset;
                    while(ii>0 )
                    {
                    ii -= 1;    
                        gl.vertexAttribPointer(
                            attribInfo.location,
                            szz,
                            inputLayoutAttrib.type,
                            inputLayoutAttrib.normalized,
                            inputLayoutAttrib.stride, 
                            tlast
                            
                        );
                    }
                    ii += 1;
                    gl.enableVertexAttribArray(attribInfo.location);
                } else {
                    gl.disableVertexAttribArray(attribInfo.location);
                }
            });
            if (!node.drawIndexedArgs) { ;
            }
            else
            {
                var tt = node.drawIndexedArgs.primitiveTopology;
                var lastt = node.indexBufferSlot.offset;
                gl.drawElements(
                    tt,
                    node.drawIndexedArgs.indexCountPerInstance,
                    node.indexBufferSlot.type,
                    node.indexBufferSlot.offset,
                    lastt
                );

            }
            if (!node.indexBufferSlot) { ;
            }
            else{
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, node.indexBufferSlot.buffer);
            }

            if (!node.drawArgs) { ;
            }
            else{
                gl.drawArrays(
                    node.drawArgs.primitiveTopology,
                    node.drawArgs.startVertexLocation,
                    node.drawArgs.vertexCountPerInstance
                );
                
            }

        });
    };

    return interpreter;
};

WebGLBasic.interpretPasses = function (interpreter, passes) {
    passes.forEach(function (pass) {
        pass.commandList.forEach(function (cmd) {
            result = cmd;
            interpreter.interpret(result);
        });
    });
};
