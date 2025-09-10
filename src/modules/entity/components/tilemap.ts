import { createTilemap, drawTilemap } from "../../2d/tilemap"
import { TEntity, FACTORIES } from "../entity"

FACTORIES.m = createTilemap

export const tilemapRender = ([, { _t, _c, m }]: TEntity) => m && _c[3] && drawTilemap(m, _t, _c)
