import { debugOptionsInit } from "../../debugOptions"
import { Game } from "../scenes/Game"
import { Tank } from "./Tank"

export function redlineDrawSegment(lineSegment: LineSegment) {
    lineSegment.clear()
    lineSegment.lineBetween(this.start.x, this.start.y, this.end.x, this.end.y)
}

export function redlineUpdate(lineSegment: LineSegment) {
    lineSegment.framesExisted++

    // make opacity of the line decrease over time
    if (debugOptionsInit.bulletLineSegmentAlphaChange) {
        const alpha = 1 - lineSegment.framesExisted / lineSegment.framesToExist

        lineSegment.setAlpha(alpha)
    }
}

export class LineSegment extends Phaser.GameObjects.Graphics {
    scene: Game
    start: Phaser.Math.Vector2
    end: Phaser.Math.Vector2
    framesExisted: number = 0
    framesToExist: number = debugOptionsInit.lineSegmentKeepSegmentFrames
    constructor(
        scene: Game,
        start: Phaser.Math.Vector2,
        end: Phaser.Math.Vector2,
        color: number
    ) {
        super(scene, {
            lineStyle: {
                width: debugOptionsInit.lineSegmentWidthLine,
                color: color,
            },
        })
        this.scene = scene

        this.start = start
        this.end = end

        redlineDrawSegment(this)
        scene.add.existing(this)
    }
}

export function updateLineSegments(tank: Tank) {
    if (!debugOptionsInit.lineSegmentDrawLines || !tank?.lineSegments) {
        return
    }
    const redlineIndexesToDestroy: number[] = []

    tank.lineSegments.forEach((lineSegment: LineSegment, index: number) => {
        if (lineSegment.framesExisted >= lineSegment.framesToExist) {
            redlineIndexesToDestroy.push(index)
        }

        redlineUpdate(lineSegment)
    })

    for (let i = redlineIndexesToDestroy.length - 1; i >= 0; i--) {
        const index = redlineIndexesToDestroy[i]
        tank.lineSegments[index].destroy()
    }

    tank.lineSegments = tank.lineSegments.filter(
        (lineSegment: LineSegment, index: number) => {
            return !redlineIndexesToDestroy.includes(index)
        }
    )
}

export function addLine(
    game: Game,
    tank: Tank,
    start: Phaser.Math.Vector2,
    end: Phaser.Math.Vector2,
    color: number
) {
    if (tank?.lineSegments) {
        const redLine = new LineSegment(game, start, end, color)

        tank.lineSegments.push(redLine)
    }
}
