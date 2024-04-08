/* eslint-disable no-console */

import events from 'events'
import fs from 'fs/promises'
import Path from 'path'
import { fileURLToPath } from 'url'
import { unixfs, globSource } from '@helia/unixfs'
import { FsBlockstore } from 'blockstore-fs'
import { fixedSize } from 'ipfs-unixfs-importer/chunker'
import all from 'it-all'
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

const helia = { blockstore: new FsBlockstore(Path.join(testDir, 'raw-blockstore')) }

const ufs = unixfs(helia)

console.log('memory usage (baseline):', process.memoryUsage())

await all(ufs.addAll(globSource(testDir, '*'), { chunker: fixedSize() }))

console.log('memory usage (after import):', process.memoryUsage())

await new Promise(resolve => setTimeout(resolve, 30000))

console.log('memory usage (after waiting):', process.memoryUsage())

await fs.rm(testDir, { recursive: true })
