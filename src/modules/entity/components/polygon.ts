import { drawPoly, raycast } from "../../2d/context"
import { TEntity, FACTORIES, getComponent, getParam } from "../entity"
import POINTER from "../../input/pointer"
import {
    clearResponse,
    computePolygon,
    createPolygon,
    createResponse,
    IPolygon,
    IResponse,
    testPoint,
    testPoly
} from "../../math/sat"

type THandler = (res: IResponse, entity1: TEntity, entity2: TEntity) => void

const NAME = "p"
const RES: IResponse = createResponse()
const CACHE = new Set<TEntity>()
const HANDLER = new Map<number, THandler>()

FACTORIES[NAME] = (points: number[], layer = 0, mask = 0) => [createPolygon(points), layer, mask]

export const clearCache = () => CACHE.clear()
export const setHandler = (layer: number, handler: THandler): void => { HANDLER.set(layer, handler) }
export const getHandler = (layer: number): THandler => HANDLER.get(layer)
export const getPolygon = (entity: TEntity): number[] | IPolygon => getParam(entity, NAME, 0)
export const getLayer = (entity: TEntity): number => getParam(entity, NAME, 1)
export const getMask = (entity: TEntity): number => getParam(entity, NAME, 2)
export const isHover = (entity: TEntity, vec: number[] = raycast(POINTER)) => testPoint(vec, getPolygon(entity))

export const polygonSystem = (next: TEntity) => {
    const [, { _t, p }] = next
    if (!p) {
        return
    }
    const [nextPoly, nextLayer, nextMask] = p
    const nextHandler = getHandler(nextLayer)
    computePolygon(nextPoly, _t)
    if (nextLayer) {
        for (const prev of CACHE) {
            const [prevPoly, prevLayer, prevMask] = getComponent(prev, NAME)
            const prevHandler = getHandler(prevLayer)
            if (nextHandler && nextMask & prevLayer) {
                nextHandler(testPoly(nextPoly, prevPoly, clearResponse(RES)) ? RES : null, next, prev)
            }
            if (prevHandler && prevMask & nextLayer) {
                prevHandler(testPoly(prevPoly, nextPoly, clearResponse(RES)) ? RES : null, prev, next)
            }
        }
    }
    CACHE.add(next)
}

export const polygonRender = ([, { _c, p }]: TEntity) => p && p[0].c && _c[3] && drawPoly(p[0], _c)
