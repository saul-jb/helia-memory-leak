# helia-memory-leak
A simple project to display the potential growing memory allocation inside of Helia.

## Install

```
npm ci
npm run build
```

## Run

### Import

This test generates a 1GB file and imports it into Helia with FS backed blockstore and datastore. The expectation is for memory usage to remain low (< 1GB) but the observation is that memory usage grows above 1GB and does not seem to be garabge collected.

```
node dist/src/import.js
```

#### Results

```
memory usage (baseline): {
  rss: 140808192,
  heapTotal: 58314752,
  heapUsed: 24736696,
  external: 7290940,
  arrayBuffers: 4681974
}
memory usage (after import): {
  rss: 775819264,
  heapTotal: 537399296,
  heapUsed: 498282288,
  external: 102539350,
  arrayBuffers: 98545402
}
memory usage (after waiting): {
  rss: 1124208640,
  heapTotal: 854085632,
  heapUsed: 772064736,
  external: 52657468,
  arrayBuffers: 48663616
}
```



### Import Without Helia

This test generates a 1GB file and imports it into a FS backed blockstore. This test is to show that the increased memory allocation is a problem in Helia's networked blockstore and not the importer.

```
node dist/src/import-no-helia.js
```

#### Results

```
memory usage (baseline): {
  rss: 99057664,
  heapTotal: 19021824,
  heapUsed: 9012184,
  external: 9408555,
  arrayBuffers: 8778019
}
memory usage (after import): {
  rss: 136679424,
  heapTotal: 28983296,
  heapUsed: 11684536,
  external: 6581270,
  arrayBuffers: 5949572
}
memory usage (after waiting): {
  rss: 126705664,
  heapTotal: 10633216,
  heapUsed: 8363992,
  external: 658101,
  arrayBuffers: 26403
}
```

### Transfer

This test generates a 1GB file and imports it into Helia with FS backed blockstore and datastore and then pins it from another helia instance. The expectation is for memory usage to remain low (< 1GB) but the observation is that memory usage does not grow unlike the first test until it is transfered to the other Helia isntance and then grows above 1GB and does not seem to be garabge collected.

```
node dist/src/transfer.js
```

#### Results

```
memory usage (baseline): {
  rss: 144084992,
  heapTotal: 58531840,
  heapUsed: 26035488,
  external: 11171097,
  arrayBuffers: 8561443
}
memory usage (after import): {
  rss: 188289024,
  heapTotal: 64036864,
  heapUsed: 30826088,
  external: 13789794,
  arrayBuffers: 11180676
}
memory usage (after transfer): {
  rss: 1313165312,
  heapTotal: 248643584,
  heapUsed: 153435624,
  external: 541881717,
  arrayBuffers: 537756793
}
memory usage (after waiting): {
  rss: 1204224000,
  heapTotal: 145186816,
  heapUsed: 90500576,
  external: 366450739,
  arrayBuffers: 362323735
}
```
