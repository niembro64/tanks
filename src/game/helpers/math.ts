import { Game } from "../scenes/Game"

export function getCircleOffsetPositionFromPoint(params: {
    position: Phaser.Math.Vector2
    distance: number
    angleDeg: number
}): Phaser.Math.Vector2 {
    const { position, distance, angleDeg } = params

    const radianAngle = Phaser.Math.DegToRad(angleDeg)
    const xOffset = distance * Math.cos(radianAngle)
    const yOffset = distance * Math.sin(radianAngle)

    const val = new Phaser.Math.Vector2(
        position.x + xOffset,
        position.y + yOffset
    )

    return val
}

export function getIntersectionPoint(params: {
    line1start: Phaser.Math.Vector2
    line1end: Phaser.Math.Vector2
    line2start: Phaser.Math.Vector2
    line2end: Phaser.Math.Vector2
}): Phaser.Math.Vector2 | null {
    const { line1start, line1end, line2start, line2end } = params

    const x1 = line1start.x
    const y1 = line1start.y
    const x2 = line1end.x
    const y2 = line1end.y
    const x3 = line2start.x
    const y3 = line2start.y
    const x4 = line2end.x
    const y4 = line2end.y

    // Calculate the denominators
    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if (denominator === 0) {
        // The lines are parallel or coincident
        return null
    }

    // Calculate the intersection point using determinants
    const tNumerator = (x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)
    const uNumerator = (x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)

    const t = tNumerator / denominator
    const u = -uNumerator / denominator

    // Check if the intersection point is within the line segments
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        const intersectionX = x1 + t * (x2 - x1)
        const intersectionY = y1 + t * (y2 - y1)
        return new Phaser.Math.Vector2(intersectionX, intersectionY)
    }

    return null // No intersection within the line segments
}

export function isOnScreen(scene: Game, point: Phaser.Math.Vector2): boolean {
    const camera = scene.cameras.main

    return (
        point.x >= camera.worldView.left &&
        point.x <= camera.worldView.right &&
        point.y >= camera.worldView.top &&
        point.y <= camera.worldView.bottom
    )
}

export function isOnScreenPadded(
    scene: Game,
    point: Phaser.Math.Vector2
): boolean {
    const camera = scene.cameras.main

    const extra = scene.gameDebugOptions.gameBoundaryExtraPadding

    return (
        point.x >= camera.worldView.left - extra &&
        point.x <= camera.worldView.right + extra &&
        point.y >= camera.worldView.top - extra &&
        point.y <= camera.worldView.bottom + extra
    )
}

export const normalizeAngleDeg = (angleDeg: number): number => {
    if (angleDeg > 180) {
        return angleDeg - 360
    }

    if (angleDeg < -180) {
        return angleDeg + 360
    }

    return angleDeg
}

export const normalizeVector = (
    vector: Phaser.Math.Vector2
): Phaser.Math.Vector2 => {
    const magnitude = vector.length()
    return new Phaser.Math.Vector2(vector.x / magnitude, vector.y / magnitude)
}

export const addVectors = (
    v1: Phaser.Math.Vector2,
    v2: Phaser.Math.Vector2
): Phaser.Math.Vector2 => {
    return new Phaser.Math.Vector2(v1.x + v2.x, v1.y + v2.y)
}
export function averageRotationRad(
    rotationRad1: number,
    rotationRad2: number
): number {
    // Normalize angles to be within the range [0, 2π)
    const normalizeRotationRad = (rotationRad: number) =>
        rotationRad - Math.floor(rotationRad / (2 * Math.PI)) * (2 * Math.PI)

    // Normalize input angles
    rotationRad1 = normalizeRotationRad(rotationRad1)
    rotationRad2 = normalizeRotationRad(rotationRad2)

    // Calculate the average angle
    let avg = (rotationRad1 + rotationRad2) / 2

    // If the difference between the angles is greater than π, correct the average angle
    if (Math.abs(rotationRad1 - rotationRad2) > Math.PI) {
        avg += Math.PI
        if (avg > 2 * Math.PI) {
            avg -= 2 * Math.PI
        }
    }

    // Normalize the average angle to be within the range [0, 2π)
    avg = normalizeRotationRad(avg)

    return avg
}

export function differenceRotationRadOld(
    rotationRad1: number,
    rotationRad2: number
): number {
    // Normalize angles to be within the range [0, 2π)
    const normalizeRotationRad = (rotationRad: number) =>
        rotationRad - Math.floor(rotationRad / (2 * Math.PI)) * (2 * Math.PI)

    // Normalize input angles
    rotationRad1 = normalizeRotationRad(rotationRad1)
    rotationRad2 = normalizeRotationRad(rotationRad2)

    // Calculate the signed difference between the angles
    let diff = rotationRad1 - rotationRad2

    // Normalize difference to be within -π to π, which indicates direction
    if (diff > Math.PI) {
        diff -= 2 * Math.PI
    } else if (diff < -Math.PI) {
        diff += 2 * Math.PI
    }

    return diff
}
export function differenceRotationRad(gateRotation, bulletRotation) {
    let diff = gateRotation - bulletRotation
    diff += diff > Math.PI ? -2 * Math.PI : diff < -Math.PI ? 2 * Math.PI : 0
    return diff
}
