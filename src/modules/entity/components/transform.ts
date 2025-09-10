import { m3rotate, m3scale, m3set, m3translate } from "../../math/mat3"
import { copy, set, sub } from "../../math"
import { TEntity, getComponent, getParam, setParam } from "../entity"

const NAME = "t"
const VEC = [0, 0]

export const getTransform = (entity: TEntity) => getComponent(entity, "_t")
export const getPivot = (entity: TEntity): number[] => getParam(entity, NAME, 0)
export const setPivot = (entity: TEntity, ...value: number[]) => copy(getPivot(entity), value)
export const getPosition = (entity: TEntity): number[] => getParam(entity, NAME, 1)
export const setPosition = (entity: TEntity, ...value: number[]) => copy(getPosition(entity), value)
export const getScale = (entity: TEntity): number[] => getParam(entity, NAME, 2)
export const setScale = (entity: TEntity, x: number, y = x) => set(getScale(entity), x, y)
export const getRotate = (entity: TEntity): number => getParam(entity, NAME, 3)
export const setRotate = (entity: TEntity, value: number) => setParam(entity, NAME, 3, value)
export const getZIndex = (entity: TEntity): number => getParam(entity, NAME, 4)
export const setZIndex = (entity: TEntity, value: number) => setParam(entity, NAME, 4, value)

export const transformSystem = ([, { _, t, _t }]: TEntity) => {
    m3set(_t, _ ? getComponent(_, "_t") : undefined)
    m3translate(m3scale(m3rotate(m3translate(_t, t[1]), t[3]), t[2]), sub(set(VEC, 0, 0), t[0]))
}
