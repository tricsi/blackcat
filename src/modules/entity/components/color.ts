import { TEntity, getComponent, getParam, setParam } from "../entity"
import { copy, multiply } from "../../math"

const NAME = "c"

export const getColor = (entity: TEntity) => getComponent(entity, NAME)
export const setColor = (entity: TEntity, value: number[]) => copy(getComponent(entity, NAME), value)
export const getAlpha = (entity: TEntity) => getParam(entity, NAME, 3)
export const setAlpha = (entity: TEntity, value: number) => setParam(entity, NAME, 3, value)
export const isVisible = (entity: TEntity) => !!getAlpha(entity);
export const setVisible = (entity: TEntity, value: any) => setAlpha(entity, value ? 1 : 0);

export const colorSystem = ([, { _, c, _c }]: TEntity) => {
    copy(_c, c)
    _ && multiply(_c, getComponent(_, "_c"))
}
