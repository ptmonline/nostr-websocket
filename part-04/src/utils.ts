import {
  Event,
  EventTemplate,
  validateEvent,
  verifySignature
} from 'nostr-tools'

export const now = () => Math.floor(Date.now() / 1000)

export function formatEvent (
  label    : string,
  payload  : string,
  template : EventTemplate
) : EventTemplate {
  return {
    ...template,
    content : JSON.stringify([ label, payload ]),
  }
}

export function parseEvent (
  event : Event
) : any[] {
  const arr = JSON.parse(event.content)
  if (!Array.isArray(arr) || arr.length < 2) {
    throw new TypeError('Invalid content payload!')
  }
  return arr
}

export function verifyEvent(
  event : Event
) : void {
  validateEvent(event)
  if (!verifySignature(event)) {
    throw new Error('Invalid signature!')
  }
}