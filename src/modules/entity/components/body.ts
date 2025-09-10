import { TEntity, FACTORIES, getParam } from "../entity"
import { add, copy, min, scale, set } from "../../math"
import { v2len, v2norm } from "../../math/vec2"

const NAME = "b"
const VEC = [0, 0, 0, 0]

FACTORIES[NAME] = (acc = [0, 0, 0, 0], spd = [0, 0, 0, 0], max = [0, 0, 0]) => [
    [...acc],
    [...spd],
    [...max],
]

export const getAccelerate = (entity: TEntity) => getParam(entity, NAME, 0)
export const setAccelerate = (entity: TEntity, ...value: number[]) => copy(getAccelerate(entity), value)
export const getSpeed = (entity: TEntity) => getParam(entity, NAME, 1)
export const setSpeed = (entity: TEntity, ...value: number[]) => copy(getSpeed(entity), value)
export const getMaxSpeed = (entity: TEntity) => getParam(entity, NAME, 2)
export const setMaxSpeed = (entity: TEntity, ...value: number[]) => copy(getMaxSpeed(entity), value)

export const bodySystem = ([, { t, b }]: TEntity, delta = 0) => {
    if (delta && b) {
        const [acc, spd, max] = b
        set(VEC, 0, 0, 0, 0)
        add(spd, scale(acc, delta, VEC))
        if (max[0]) v2len(spd) > max[0] && scale(v2norm(spd), max[0])
        if (spd[2]) add(t[2], scale(v2norm(copy(VEC, t[2])), min(spd[2], max[1] || spd[2]) * delta))
        if (spd[3]) t[3] += min(spd[3], max[2] || spd[3]) * delta
        add(t[1], scale(spd, delta, VEC))
    }
}
