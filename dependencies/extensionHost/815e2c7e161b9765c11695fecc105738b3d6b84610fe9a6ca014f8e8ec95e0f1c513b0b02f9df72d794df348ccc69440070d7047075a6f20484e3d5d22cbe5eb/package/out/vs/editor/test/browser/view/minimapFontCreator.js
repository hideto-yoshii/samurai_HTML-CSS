/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/rgba", "vs/editor/browser/viewParts/minimap/minimapCharRendererFactory"], function (require, exports, rgba_1, minimapCharRendererFactory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let sampleData = minimapCharRendererFactory_1.MinimapCharRendererFactory.createSampleData('monospace');
    let minimapCharRenderer1x = minimapCharRendererFactory_1.MinimapCharRendererFactory.createFromSampleData(sampleData.data, 1);
    let minimapCharRenderer2x = minimapCharRendererFactory_1.MinimapCharRendererFactory.createFromSampleData(sampleData.data, 2);
    let minimapCharRenderer4x = minimapCharRendererFactory_1.MinimapCharRendererFactory.createFromSampleData(sampleData.data, 4);
    let minimapCharRenderer6x = minimapCharRendererFactory_1.MinimapCharRendererFactory.createFromSampleData(sampleData.data, 6);
    renderImageData(sampleData, 10, 100);
    renderMinimapCharRenderer(minimapCharRenderer1x, 400, 1);
    renderMinimapCharRenderer(minimapCharRenderer2x, 500, 2);
    renderMinimapCharRenderer(minimapCharRenderer4x, 600, 4);
    renderMinimapCharRenderer(minimapCharRenderer6x, 750, 8);
    function createFakeImageData(width, height) {
        return {
            width: width,
            height: height,
            data: new Uint8ClampedArray(width * height * 4 /* RGBA_CHANNELS_CNT */)
        };
    }
    function renderMinimapCharRenderer(minimapCharRenderer, y, scale) {
        let background = new rgba_1.RGBA8(0, 0, 0, 255);
        let color = new rgba_1.RGBA8(255, 255, 255, 255);
        {
            let x2 = createFakeImageData(1 /* BASE_CHAR_WIDTH */ * scale * 96 /* CHAR_COUNT */, 2 /* BASE_CHAR_HEIGHT */ * scale);
            // set the background color
            for (let i = 0, len = x2.data.length / 4; i < len; i++) {
                x2.data[4 * i + 0] = background.r;
                x2.data[4 * i + 1] = background.g;
                x2.data[4 * i + 2] = background.b;
                x2.data[4 * i + 3] = 255;
            }
            let dx = 0;
            for (let chCode = 32 /* START_CH_CODE */; chCode <= 126 /* END_CH_CODE */; chCode++) {
                minimapCharRenderer.renderChar(x2, dx, 0, chCode, color, background, false);
                dx += 1 /* BASE_CHAR_WIDTH */ * scale;
            }
            renderImageData(x2, 10, y);
        }
    }
    (function () {
        let r = 'let x2Data = [', offset = 0;
        for (let charIndex = 0; charIndex < 96 /* CHAR_COUNT */; charIndex++) {
            let charCode = charIndex + 32 /* START_CH_CODE */;
            r += '\n\n// ' + String.fromCharCode(charCode);
            for (let i = 0; i < 2 /* BASE_CHAR_HEIGHT */ * 2; i++) {
                if (i % 2 === 0) {
                    r += '\n';
                }
                r += minimapCharRenderer2x.charDataNormal[offset] + ',';
                offset++;
            }
        }
        r += '\n\n]';
        console.log(r);
    })();
    (function () {
        let r = 'let x1Data = [', offset = 0;
        for (let charIndex = 0; charIndex < 96 /* CHAR_COUNT */; charIndex++) {
            let charCode = charIndex + 32 /* START_CH_CODE */;
            r += '\n\n// ' + String.fromCharCode(charCode);
            for (let i = 0; i < 2 /* BASE_CHAR_HEIGHT */ * 1 /* BASE_CHAR_WIDTH */; i++) {
                r += '\n';
                r += minimapCharRenderer1x.charDataNormal[offset] + ',';
                offset++;
            }
        }
        r += '\n\n]';
        console.log(r);
    })();
    function renderImageData(imageData, left, top) {
        let output = '';
        let offset = 0;
        let PX_SIZE = 15;
        for (let i = 0; i < imageData.height; i++) {
            for (let j = 0; j < imageData.width; j++) {
                let R = imageData.data[offset];
                let G = imageData.data[offset + 1];
                let B = imageData.data[offset + 2];
                let A = imageData.data[offset + 3];
                offset += 4;
                output += `<div style="position:absolute;top:${PX_SIZE * i}px;left:${PX_SIZE *
                    j}px;width:${PX_SIZE}px;height:${PX_SIZE}px;background:rgba(${R},${G},${B},${A / 256})"></div>`;
            }
        }
        let domNode = document.createElement('div');
        domNode.style.position = 'absolute';
        domNode.style.top = top + 'px';
        domNode.style.left = left + 'px';
        domNode.style.width = imageData.width * PX_SIZE + 'px';
        domNode.style.height = imageData.height * PX_SIZE + 'px';
        domNode.style.border = '1px solid #ccc';
        domNode.style.background = '#000000';
        domNode.innerHTML = output;
        document.body.appendChild(domNode);
    }
});
//# sourceMappingURL=minimapFontCreator.js.map