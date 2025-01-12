export const getColorStringFromHexNumber = (color: number): string => {
    const colorString = "#" + color.toString(16).padStart(6, "0")

    return colorString
}

export const getColorHexNumberFromColorString = (color: string): number => {
    return parseInt(color.replace("#", ""), 16)
}

export const interpolateColor = (
    color1: number,
    color2: number,
    t: number
): number => {
    if (t < 0 || t > 1) {
        throw new Error("t must be between 0 and 1")
    }

    const r1 = (color1 & 0xff0000) >> 16
    const g1 = (color1 & 0x00ff00) >> 8
    const b1 = color1 & 0x0000ff

    const r2 = (color2 & 0xff0000) >> 16
    const g2 = (color2 & 0x00ff00) >> 8
    const b2 = color2 & 0x0000ff

    const r = Math.floor(r1 + t * (r2 - r1))
    const g = Math.floor(g1 + t * (g2 - g1))
    const b = Math.floor(b1 + t * (b2 - b1))

    return (r << 16) + (g << 8) + b
}

export const saturateColor = (color: number): number => {
    const r = Math.min(255, Math.floor(((color & 0xff0000) >> 16) * 1.5))
    const g = Math.min(255, Math.floor(((color & 0x00ff00) >> 8) * 1.5))
    const b = Math.min(255, Math.floor((color & 0x0000ff) * 1.5))

    return (r << 16) + (g << 8) + b
}

export function colorGradient(color: number, percentage: number): number {
    // Ensure percentage is between 0 and 1
    if (percentage < 0) percentage = 0
    if (percentage > 1) percentage = 1

    // Extract RGB components from the color
    const r = (color >> 16) & 0xff
    const g = (color >> 8) & 0xff
    const b = color & 0xff

    // Calculate new RGB values based on the percentage
    const newR = Math.floor(r * percentage)
    const newG = Math.floor(g * percentage)
    const newB = Math.floor(b * percentage)

    // Convert back to hex format
    const newColor = (newR << 16) | (newG << 8) | newB

    return newColor
}
