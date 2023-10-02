import {NostrSocket, Signer} from '../src/index.js'

const signer = Signer.generate()
const pubkey = await signer.getPublicKey()
const relays = ['wss://relay.damus.io']
const config = {echo: true, cipher: 'deadbeef'}

const socket = new NostrSocket(signer, pubkey, relays, config)

socket.on('ping', (payload, envelope) =>{
    console.log('payload: ', payload)
    console.log('envelope: ', envelope)
})

socket.on('_ok', (data)=>{
    console.log('ok: ', data)
})

socket.on('_failure', (data)=>{
    console.log('fail: ', data)
})

socket.pub('ping', 'Hello from localhost!')

