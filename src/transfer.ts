/* eslint-disable no-console */

import events from 'events'
import fs from 'fs/promises'
import Path from 'path'
import { fileURLToPath } from 'url'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { unixfs, globSource } from '@helia/unixfs'
import { identify } from '@libp2p/identify'
import { tcp } from '@libp2p/tcp'
import { FsBlockstore } from 'blockstore-fs'
import { FsDatastore } from 'datastore-fs'
import { createHelia } from 'helia'
import { fixedSize } from 'ipfs-unixfs-importer/chunker'
import all from 'it-all'
import { createLibp2p } from 'libp2p'
import createFile from './generate-file.js'

export const packagePath = Path.join(Path.dirname(fileURLToPath(import.meta.url)), '../../')

events.setMaxListeners(40)

const testDir = Path.join(packagePath, 'test-out')

// Make sure the directory is empty before starting.
try {
  await fs.rm(testDir, { recursive: true })
} catch (error) {
  // Ignore
} finally {
  await fs.mkdir(testDir)
}

const filePath = Path.join(testDir, 'file.data')

await createFile(filePath, 10 ** 9)

const names = ['helia-0', 'helia-1']

const helias = await Promise.all(names.map(async name => createHelia({
  blockstore: new FsBlockstore(Path.join(testDir, `${name}-blockstore`)),
  datastore: new FsDatastore(Path.join(testDir, `${name}-datastore`)),
  libp2p: await createLibp2p({
    transports: [tcp()],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()],
    addresses: { listen: ['/ip4/127.0.0.1/tcp/0'] },
    services: { identify: identify(), pubsub: gossipsub({ allowPublishToZeroTopicPeers: true }) }
  })
})))

await helias[1].libp2p.dial(helias[0].libp2p.getMultiaddrs())

const ufs = unixfs(helias[0])

console.log('memory usage (baseline):', process.memoryUsage())

const [{ cid }] = await all(ufs.addAll(globSource(testDir, '*'), { chunker: fixedSize() }))

console.log('memory usage (after import):', process.memoryUsage())

await all(helias[1].pins.add(cid))

console.log('memory usage (after transfer):', process.memoryUsage())

await new Promise(resolve => setTimeout(resolve, 30000))

console.log('memory usage (after waiting):', process.memoryUsage())

await Promise.all(helias.map(async helia => helia.stop()))

await new Promise(resolve => setTimeout(resolve, 1000))

await fs.rm(testDir, { recursive: true })
