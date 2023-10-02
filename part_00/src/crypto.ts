import { Buff, Bytes } from '@cmdcode/buff-utils'
import { Event, EventTemplate } from 'nostr-tools'

// Attempt to import the crypto library from somewhere.
const { subtle } = globalThis?.crypto ?? crypto ?? window?.crypto

if (
    typeof subtle === 'undefined' ||
    subtle.importKey === undefined ||
    subtle.encrypt === undefined ||
    subtle.decrypt === undefined
) {
    throw new Error('Subtle crypto library not found on this device!')
}

async function get_key(secret: Bytes) {
    /* Convert our secret into a CryptoKey object. */
    const seed = Buff.bytes(secret)
    const options = { name: 'AES-CBC' }
    const usage = ['encrypt', 'decrypt'] as KeyUsage[]
    return subtle.importKey('raw', seed, options, true, usage)
}

export async function encrypt(
    message: string,
    secret: Bytes,
    vector?: Bytes
) {
    /* Encrypt a message using a CryptoKey object. */
    const key = await get_key(secret)
    const msg = Buff.str(message)
    const iv = (vector !== undefined)
        ? Buff.bytes(vector)
        : Buff.random(16)
    const opt = { name: 'AES-CBC', iv }
    return subtle.encrypt(opt, key, msg)
        .then((bytes) => new Buff(bytes).base64 + '?iv=' + iv.base64)
}

export async function decrypt(
    encoded: string,
    secret: Bytes
) {
    /* Decrypt an encrypted message using a CryptoKey object. */
    if (!encoded.includes('?iv=')) {
        throw new Error('Missing vector on encrypted message!')
    }
    const [message, vector] = encoded.split('?iv=')
    const key = await get_key(secret)
    const msg = Buff.base64(message)
    const iv = Buff.base64(vector)
    const opt = { name: 'AES-CBC', iv }
    return subtle.decrypt(opt, key, msg)
        .then(decoded => new Buff(decoded).str)
}

export function get_secret(seed: string){
    return Buff.str(seed).digest.hex
}

export function get_label(secret: string): string{
    return Buff.hex(secret).digest.hex;
}

export async function encrypt_event(template: EventTemplate, secret?: string): Promise<EventTemplate>{
    const temp = {...template}
    if(typeof secret === 'string'){
        const {content, tags} = temp
        const label = get_label(secret)
        const encrypted = await encrypt(content, secret)
        temp.content = encrypted
        temp.tags = [...tags, ['h', label]]
    }
    return temp;
}

export async function decrypt_event(event:Event, secret?: string): Promise<Event>{
    const ev_copy = {...event}
    if(typeof secret === 'string'){
        const {content, tags} = ev_copy
        const label = get_label(secret)
        const htags = tags.filter(e=>e[0] === 'h')
        const hashes = htags.map(e => e[1])
        if(hashes.includes(label) && content.includes('?iv=')){
            ev_copy.content = await decrypt(content, secret)
        }
    }

    return ev_copy;
}


