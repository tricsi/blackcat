import { max, min, pow, random, round } from "./math"

/** [WaveType, Length, Curve] */
export type TSoundProps = [OscillatorType | number[], number, number | number[]]

/** [SoundProps, Notes, Tempo] */
export type TChannelProps = [TSoundProps, string, number]

type TSound = {
    props: TSoundProps
    ctx: AudioContext | OfflineAudioContext
    src: AudioBufferSourceNode | OscillatorNode
    vol: GainNode
    filter: BiquadFilterNode
}

type TChannel = {
    props: TChannelProps
    data: number[][]
    size: number
    length: number
}

const KEYS: string[] = "c,db,d,eb,e,f,gb,g,ab,a,bb,b".split(",")
const FREQ: number[] = []
const MIXERS = new Map<string, GainNode>()
const BUFFERS = new Map<string, AudioBuffer>()

let BITRATE: number,
    CONTEXT: AudioContext,
    NOISE: AudioBuffer

/**
 * Creates a sound object with the given properties and audio context.
 * 
 * @param props - The sound properties ([WaveType, Length, Curve]).
 * @param ctx - The OfflineAudioContext to use.
 * @returns The created TSound object.
 */
function createSound(props: TSoundProps, ctx: OfflineAudioContext): TSound {
    const wave = props[0]
    const vol = ctx.createGain()
    vol.connect(ctx.destination)
    const filter = ctx.createBiquadFilter()
    filter.connect(vol)
    let src: AudioBufferSourceNode | OscillatorNode
    if (wave === "custom") {
        filter.type = "bandpass"
        src = ctx.createBufferSource()
        src.buffer = NOISE
        src.loop = true
    } else {
        filter.type = "highpass"
        filter.frequency.value = 20
        src = ctx.createOscillator()
        if (typeof wave === "string") {
            src.type = wave
        } else {
            const real = Float32Array.from([0, ...wave])
            src.setPeriodicWave(
                ctx.createPeriodicWave(
                    real,
                    real.map(() => 0)
                )
            )
        }
    }
    src.connect(filter)
    return { props, ctx, src, vol, filter }
}

/**
 * Sets an AudioParam to a value or a value curve over a specified duration.
 * 
 * @param param - The AudioParam to set.
 * @param value - The value or curve to set.
 * @param length - The duration of the change.
 * @param offset - The start time offset.
 */
function setParam(param: AudioParam, value: number | number[], length: number, offset: number) {
    value instanceof Array
        ? param.setValueCurveAtTime(Float32Array.from(value), offset, length - 0.01)
        : param.setValueAtTime(value, offset)
}

/**
 * Configures a sound's frequency and gain envelope.
 * 
 * @param sound - The sound object to configure.
 * @param freq - The frequency or frequencies to set.
 * @param length - The duration of the sound.
 * @param offset - The start time offset.
 */
function setSound(sound: TSound, freq: number | number[], length = sound.props[1], offset = 0) {
    const curve = sound.props[2]
    const { src, vol, filter } = sound
    setParam(src instanceof OscillatorNode ? src.frequency : filter.frequency, freq, length, offset)
    setParam(vol.gain, freq ? curve : 0, length, offset)
}

/**
 * Starts playback of a sound for a given duration.
 * 
 * @param sound - The sound object to play.
 * @param length - The duration to play the sound.
 */
function playSound(sound: TSound, length = sound.props[1]) {
    sound.src.start()
    sound.src.stop(length)
}

/**
 * Creates a channel object from channel properties.
 * 
 * @param props - The channel properties ([SoundProps, Notes, Tempo]).
 * @returns The created TChannel object.
 */
function createChannel(props: TChannelProps): TChannel {
    let size = 0
    let length = 0
    const [, notes, tempo] = props
    const sheet = notes.split("|")
    const data = sheet
        .reduce((p, n, i) => p + (i % 2 ? ("," + sheet[i - 1]).repeat(parseInt(n) - 1) : (p ? "," : "") + n), "")
        .split(",")
        .map((code) => {
            const div = code.match(/^([\d.]+)/)
            if (div) {
                const time = parseFloat(div[1])
                const freqs = code.match(/([a-z]+\d+)/g)
                const out = [time]
                length += time * tempo
                if (freqs) {
                    size = max(freqs.length, size)
                    out.push(...freqs.map(f => {
                        const note = f.match(/([a-z]+)(\d+)/)
                        return note ? FREQ[parseInt(note[2]) * 12 + KEYS.indexOf(note[1])] : 0
                    }))
                }
                return out
            }
        })
    return { props, data, size, length }
}

/**
 * Plays a channel by scheduling all its notes in the given context.
 * 
 * @param channel - The channel to play.
 * @param ctx - The OfflineAudioContext to use.
 */
function playChannel({ props, data, size }: TChannel, ctx: OfflineAudioContext) {
    const sounds: TSound[] = []
    for (let i = 0; i < size; i++) {
        sounds.push(createSound(props[0], ctx))
    }
    let time = 0
    data.forEach((note) => {
        const t = note[0] * props[2]
        sounds.forEach((sound, i) => setSound(sound, note[i + 1] || 0, t, time))
        time += t
    })
    sounds.forEach((sound) => playSound(sound, time))
}

/**
 * Creates an OfflineAudioContext and registers a complete event to store the rendered buffer.
 * 
 * @param id - The buffer ID.
 * @param time - The duration in seconds.
 * @returns The created OfflineAudioContext.
 */
function createOfflineContext(id: string, time: number): OfflineAudioContext {
    const ctx = new OfflineAudioContext(1, BITRATE * time, BITRATE)
    ctx.addEventListener("complete", (e) => BUFFERS.set(id, e.renderedBuffer))
    return ctx
}

/**
 * Generates a custom waveform array using a factory function.
 * 
 * @param factory - Function that returns a sample value for each index.
 * @returns The generated waveform array.
 */
export function wave(factory: (n: number) => number): number[] {
    return Array.from({ length: 8191 }, (_, n) => factory(n + 1))
}

/**
 * Renders a sound buffer offline and stores it by ID.
 * 
 * @param id - The buffer ID.
 * @param props - The sound properties.
 * @param freq - The frequency or frequencies to use.
 */
export async function sound(id: string, props: TSoundProps, freq: number | number[]) {
    const { length } = props
    const ctx = createOfflineContext(id, length)
    const sound = createSound(props, ctx)
    setSound(sound, freq)
    playSound(sound)
    await ctx.startRendering()
}

/**
 * Renders music from multiple channels offline and stores it by ID.
 * 
 * @param id - The buffer ID.
 * @param params - Array of channel properties.
 */
export async function music(id: string, params: TChannelProps[]) {
    const channels = params.map((param) => createChannel(param))
    const time = max(...channels.map((c) => c.length))
    const ctx = createOfflineContext(id, time)
    channels.forEach((channel) => playChannel(channel, ctx))
    await ctx.startRendering()
}

/**
 * Gets or creates a mixer (GainNode) for the given ID and sets its volume.
 * 
 * @param id - The mixer ID.
 * @param volume - The gain value (0-1).
 * @param destination - The audio node to connect to.
 * @returns The GainNode mixer.
 */
export function mixer(id: string, volume = -1, destination: AudioNode = CONTEXT?.destination): GainNode {
    let mixer = MIXERS.get(id)
    if (!mixer && destination) {
        mixer = CONTEXT.createGain()
        mixer.connect(destination)
        MIXERS.set(id, mixer)
    }
    if (mixer && volume >= 0) {
        mixer.gain.value = min(volume, 1)
    }
    return mixer
}

/**
 * Plays a rendered audio buffer by ID, optionally looping and routing through a mixer.
 * 
 * @param id - The buffer ID.
 * @param loop - Whether to loop playback.
 * @param gain - The mixer ID to route through.
 * @returns The AudioBufferSourceNode or null if not found.
 */
export function play(id: string, loop = false, gain = "master"): AudioBufferSourceNode {
    if (BUFFERS.has(id)) {
        const src = CONTEXT.createBufferSource()
        src.loop = loop
        src.buffer = BUFFERS.get(id)
        src.connect(mixer(gain))
        src.start()
        return src
    }
    return null
}

/**
 * Initializes the audio system, generates noise, and precomputes note frequencies.
 * 
 * @param bitrate - The audio sample rate.
 * @param ctx - The AudioContext to use.
 */
export async function audio(bitrate = 44100, ctx = new AudioContext()) {
    BITRATE = bitrate
    CONTEXT = ctx
    if (ctx.state === "suspended") {
        await ctx.resume()
    }
    NOISE = ctx.createBuffer(1, bitrate * 2, bitrate)
    const out = NOISE.getChannelData(0)
    for (let i = 0; i < bitrate * 2; i++) {
        out[i] = random() * 2 - 1
    }

    const a = pow(2, 1 / 12)
    for (let n = -57; n < 50; n++) {
        FREQ.push(pow(a, n) * 440)
    }
}
