import {
    EVENT_DEATH,
    EVENT_HIT,
    EVENT_JUMP,
    EVENT_SCORE,
    EVENT_START,
    GAME_TIME,
    SPRITE_CLOUD
} from "../config"
import { audio, mixer, music, play, sound, wave } from "../modules/audio"
import { getPosition, setPosition } from "../modules/entity/components/transform"
import { addChild, createEntity, TEntity } from "../modules/entity/entity"
import { off, on, TEvent } from "../modules/event"
import { kill, timer, TTimerToken } from "../modules/scheduler"
import { DOC, MOBILE } from "../modules/utils"
import { initEnemies } from "./enemies"
import {
    createBoss,
    getFloorsSpeed,
    initFloors,
    resetFloors,
    setEnemyPercent,
    setFloorsSpeed
} from "./floors"
import { initHouses, playHouseIntro } from "./houses"
import { initHud, playHudIntro, setInfo } from "./hud"
import { initItems } from "./items"
import { bindPlayer, initPlayer, resetPlayer, unbindPlayer } from "./player"
import { initPower } from "./power"
import { initTrail, resetTrail } from "./trail"

const musicVolume = 0.5
const gameScene: TEntity = createEntity(["game", { t: [, , 1] }])
const container = createEntity(["container", { t: [, [0, 54]] }])
const clouds = createEntity([
    "clouds",
    ,
    [
        [, { t: [, [90, -40], [-1.3, 1]], s: SPRITE_CLOUD, c: [1, 1, 1, 0.2] }],
        [, { t: [, [-70, -30], 1], s: SPRITE_CLOUD, c: [1, 1, 1, 0.3] }],
        [, { t: [, [-100, 15], [1.2, 0.7]], s: SPRITE_CLOUD, c: [1, 1, 1, 0.7] }]
    ]
])

let skipToken: TTimerToken
let themeMusic: AudioBufferSourceNode

export function initGame() {
    addChild(gameScene, initHud())
    addChild(gameScene, container)
    addChild(container, initPlayer())
    addChild(container, initPower())
    addChild(container, initTrail())
    addChild(container, initEnemies())
    addChild(container, initItems())
    addChild(container, initFloors())
    addChild(gameScene, initHouses())
    addChild(gameScene, clouds)
    on("click", onClick, DOC)
    on(EVENT_START, onStart)
    on(EVENT_DEATH, onDeath)
    return gameScene
}

async function onClick() {
    off("click", onClick, DOC)
    setInfo("Loading...")
    await audio(22050)
    const chip = wave((n) => (4 / (n * Math.PI)) * Math.sin(Math.PI * n * 0.18))
    await sound(EVENT_HIT, [chip, 0.3, [0.5, 0]], [440, 880, 440, 220])
    await sound(EVENT_JUMP, ["custom", 0.1, [0.2, 0.4, 0]], [220, 440])
    await sound(EVENT_SCORE, ["sine", 0.1, [0.5, 0]], [220, 110, 0])
    await music("theme", [
        [
            [chip, 0.3, [0.3, 0.1]],
            "8|2|" +
                "1e2,1e2,1gb2,1e2,1g2,1e2,1a2,1ab2|4|" +
                "1a2,1a2,1b2,1a2,1c3,1a2,1d3,1db3|2|" +
                "1e2,1e2,1gb2,1e2,1g2,1e2,1a2,1ab2|2|" +
                "1b2,1b2,1db3,1b2,1d3,1b2,1e3,1eb3|1|" +
                "1a2,1a2,1b2,1a2,1c3,1a2,1d3,1db3|1",
            0.2
        ],
        [["custom", 0.2, [1, 0.2, 0]], "2,1a2,3,1a2,1a2|12", 0.2],
        [["sine", 0.2, [1, 0.2, 0]], "1a1,3,1a1,3|12", 0.2]
    ])

    on("visibilitychange", onVisibility, DOC)
    on("all", ([_, name]: TEvent) => play(name))
    onVisibility()
    setInfo()
    await Promise.all([playIntro(2), playHudIntro(2), playHouseIntro(2)])
    bindPlayer()
    setInfo(`${MOBILE() ? "Tap" : "Press Space"} to Play`)
}

async function playIntro(time: number) {
    const [x, y] = getPosition(container)
    await timer(time, (t) => setPosition(container, x, y * (1 - t)))
}

function onVisibility() {
    mixer("master", DOC.hidden ? 0 : 1)
}

async function onStart() {
    mixer("music", musicVolume)
    themeMusic = play("theme", true, "music")
    resetTrail()
    resetPlayer()
    resetFloors()
    const speed = -100
    skipToken = [1]
    await timer(0.5, (t) => setFloorsSpeed(t * speed), 0, skipToken)
    await timer(
        GAME_TIME,
        (t) => {
            setEnemyPercent(t * 28 + 5)
            setFloorsSpeed((t * speed) / 2 + speed)
        },
        0,
        skipToken
    )
    skipToken = null
    createBoss()
}

async function onDeath() {
    if (skipToken) {
        kill(skipToken, true)
        skipToken = null
    }
    const speed = getFloorsSpeed()
    unbindPlayer()
    await timer(1, (t) => {
        setFloorsSpeed((1 - t) * speed)
        mixer("music", (1 - t) * musicVolume)
    })
    themeMusic?.stop()
    bindPlayer()
}
