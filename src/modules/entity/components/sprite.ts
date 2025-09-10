import { createSprite, drawSprite } from "../../2d/context"
import { TEntity, FACTORIES, getParam, setParam } from "../entity"

const NAME = "s"
FACTORIES[NAME] = createSprite

export const getFrame = (entity: TEntity) => getParam(entity, NAME, 4)
export const setFrame = (entity: TEntity, value: number) => setParam(entity, NAME, 4, value)

export const spriteRender = ([, { _t, _c, s }]: TEntity) => s && _c[3] && drawSprite(s, _t, _c)
