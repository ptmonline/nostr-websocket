import { Event, EventTemplate, getEventHash, validateEvent, verifySignature } from 'nostr-tools'

// Get the current UTC time, in seconds.
export const now = () => Math.floor(Date.now() / 1000)

export function format_event(label: string, payload: any, template: EventTemplate): EventTemplate {
    return { ...template, content: JSON.stringify([label, payload]) }
}

export function parse_event(event: Event): any[] {
    const arr = JSON.parse(event.content)
    if (!Array.isArray(arr) || arr.length < 1) {
        throw new TypeError('Invalid content payload')
    }
    return arr;
}

export function verify_event(event: Event): void {
    validateEvent(event);
    if (getEventHash(event) !== event.id) {
        throw new Error('Event ID is invalid')
    }
    if (!verifySignature(event)) {
        throw new Error('Event signature is invalid')
    }
}

