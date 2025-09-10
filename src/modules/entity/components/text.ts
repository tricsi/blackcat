import { createText, drawText } from "../../2d/text"
import { TEntity, FACTORIES, getParam, setParam } from "../entity"

const NAME = "x"
FACTORIES[NAME] = createText

export const getText = (entity: TEntity) => getParam(entity, NAME, 1)
export const setText = (entity: TEntity, value: string = "") => setParam(entity, NAME, 1, value)

export const textRender = ([, { _t, _c, x }]: TEntity) => x && _c[3] && drawText(x, _t, _c)
