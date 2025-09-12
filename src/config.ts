import { createSprite } from "./modules/2d/context"

export const SPRITE_PTC = createSprite("ptc", 3, 3, 1)
export const SPRITE_CAT = createSprite("cat", 33, 19)
export const SPRITE_BIRD = createSprite("bird", 15, 14)
export const SPRITE_WALL = createSprite("wall", 8, 8, 1)
export const SPRITE_CLOUD = createSprite("cloud", 48, 8)
export const SPRITE_HOUSE = createSprite("house", 8, 8, 1)
export const SPRITE_ITEMS = createSprite("items", 16, 14)
export const FONT_REGULAR = createSprite("font", 5, 7)
export const FONT_TINY = createSprite("tiny", 3, 5)
export const CENTER = [96, 54]
export const CONTROLS = ["Space", "Mouse0"]
export const GAME_TIME = 60

export const COLOR_TRANSPARENT = [0, 0, 0, 0]
export const COLOR_BLACK = [0, 0, 0, 1]
export const COLOR_WHITE = [1, 1, 1, 1]
export const COLOR_DARK = [0.3, 0.3, 0.3]
export const COLOR_LIGHT = [0.7, 0.7, 0.7]
export const COLOR_RED = [1, 0, 0]
export const COLOR_DEBUG = [0, 1, 1, 0.5]
export const COLOR_END = [0.02, 0.2, 0.22, 1]

export const LAYER_PLAYER = 1
export const LAYER_WALL = 2
export const LAYER_ITEM = 4
export const LAYER_ENEMY = 8
export const LAYER_POWER = 16

export const EVENT_DEATH = "DEATH"
export const EVENT_JUMP = "JUMP"
export const EVENT_HIT = "HIT"
export const EVENT_KILL = "KILL"
export const EVENT_LOSE = "LOSE"
export const EVENT_SCORE = "SCORE"
export const EVENT_START = "START"
export const EVENT_BOSS = "BOSS"
export const EVENT_COLLECT = "COLLECT"
