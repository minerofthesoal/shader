namespace reshade {
    let enabled = false
    let noiseEnabled = false
    let shadingEnabled = false
    let shadingMap: Image = null

    let defaultShadingMap = img`
        0 0 0 0 0 0 0 1 1 0 0 0 0 0 0 0
        1 1 1 1 2 1 1 1 1 1 1 1 0 0 0 0
        2 2 2 2 2 2 2 2 2 2 2 2 1 1 1 1
        2 3 3 3 6 6 6 6 6 4 4 4 4 2 2 2
        3 3 6 10 10 10 10 10 7 7 7 5 5 4 4 4
        3 6 7 10 12 13 13 13 11 11 11 7 5 5 5 5
        6 6 7 10 12 13 13 15 14 14 11 10 7 8 5 5
        6 7 10 12 12 12 13 14 15 14 13 11 9 7 5 5
        5 6 7 10 13 14 15 15 15 15 14 11 11 7 7 5
        5 7 11 12 13 14 15 15 15 15 15 14 11 11 7 7
        5 9 11 14 14 14 14 14 14 15 15 15 14 11 9 7
        8 8 9 11 11 13 13 13 12 12 13 14 13 11 9 7
        8 8 8 9 11 11 13 12 12 12 12 12 11 9 9 7
        8 8 8 9 9 11 12 12 12 12 12 12 11 9 9 9
        8 8 8 8 9 11 11 11 11 11 11 11 9 9 9 9
        8 8 8 8 9 9 9 9 9 9 9 9 9 9 9 9
    `
    shadingMap = defaultShadingMap
    shadingEnabled = true

    // Enable reshade effects
    export function enable() {
        if (enabled) return
        enabled = true

        game.onUpdate(() => {
            if (!enabled) return

            let img = screen.clone()

            applyVignette(img)
            applyColorShift(img)

            if (shadingEnabled && shadingMap)
                applyShadingMap(img)

            if (noiseEnabled)
                applyNoise(img)

            screen.drawImage(img, 0, 0)
        })
    }

    export function disable() {
        enabled = false
    }

    export function setNoise(on: boolean) {
        noiseEnabled = on
    }

    export function setShadingMap(map: Image) {
        shadingMap = map
        shadingEnabled = true
    }

    export function clearShadingMap() {
        shadingEnabled = false
    }

    function applyColorShift(img: Image) {
        for (let y = 0; y < img.height; y++) {
            for (let x = 0; x < img.width; x++) {
                let c = img.getPixel(x, y)
                if (c == 7) img.setPixel(x, y, 2)
                else if (c == 2) img.setPixel(x, y, 5)
            }
        }
    }

    function applyVignette(img: Image) {
        const cx = img.width >> 1
        const cy = img.height >> 1
        const maxDist = Math.sqrt(cx * cx + cy * cy)

        for (let y2 = 0; y2 < img.height; y2++) {
            for (let x2 = 0; x2 < img.width; x2++) {
                let dx = x2 - cx
                let dy = y2 - cy
                let dist = Math.sqrt(dx * dx + dy * dy) / maxDist
                if (dist > 0.6) {
                    let col = img.getPixel(x2, y2)
                    if (col != 0) img.setPixel(x2, y2, fadeColor(col))
                }
            }
        }
    }

    function fadeColor(c: number): number {
        if (c == 2) return 1
        if (c == 5) return 3
        if (c == 7) return 6
        return c
    }

    function applyNoise(img: Image) {
        for (let y3 = 0; y3 < img.height; y3++) {
            for (let x3 = 0; x3 < img.width; x3++) {
                if (Math.randomRange(0, 100) < 3) {
                    img.setPixel(x3, y3, Math.randomRange(1, 15))
                }
            }
        }
    }

    function applyShadingMap(img: Image) {
        for (let y4 = 0; y4 < img.height; y4++) {
            for (let x4 = 0; x4 < img.width; x4++) {
                let shade = shadingMap.getPixel(x4 % shadingMap.width, y4 % shadingMap.height)
                if (shade > 0) {
                    let col2 = img.getPixel(x4, y4)
                    img.setPixel(x4, y4, darkenColor(col2, shade))
                }
            }
        }
    }

    function darkenColor(c: number, intensity: number): number {
        // Just a simple fade approximation based on intensity
        if (intensity >= 6) return 0 // very dark
        if (intensity >= 4) return (c == 7 ? 6 : c == 2 ? 1 : c)
        if (intensity >= 2) return (c == 7 ? 1 : c)
        return c
    }
}
