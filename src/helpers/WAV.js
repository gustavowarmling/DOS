import { BitSeparator } from "./bitSeparator"

export const WAV = {
  // chunk description
  CHUNK_ID: 'RIFF',
  FORMAT: 'WAVE',

  // 'fmt ' sub-chunk
  FMT_SUBCHUNK_ID: 'fmt ',
  FMT_AUDIO_FORMAT: 1,

  // 'data' sub-chunk
  DATA_SUBCHUNK_ID: 'data',

  decode_fmt_chunk: (data, bitPerBlock) => {
    // audio format (litlle endian) - 2 bytes
    const audioFormatBytes = data.slice(0, 2).reverse()
    const audioFormat = BitSeparator.assemble(audioFormatBytes, bitPerBlock)

    // number of channel (litlle endian) - 2 bytes
    const channelNumberBytes = data.slice(2, 4).reverse()
    const channelNumber = BitSeparator.assemble(channelNumberBytes, bitPerBlock)

    // sample rate (litlle endian) - 4 bytes
    const sampleRateBytes = data.slice(4, 8).reverse()
    const sampleRate = BitSeparator.assemble(sampleRateBytes, bitPerBlock)

    // byterate (litlle endian) - 4 bytes
    const byteRateBytes = data.slice(8, 12).reverse()
    const byteRate = BitSeparator.assemble(byteRateBytes, bitPerBlock)

    // block align (little endian) - 2 bytes
    const blockAlignBytes = data.slice(12, 14)
    const blockAlign = BitSeparator.assemble(blockAlignBytes, bitPerBlock)

    // bits per sample (litlle endian) - 2 bytes
    const bitsPerSampleBytes = data.slice(14, 16).reverse()
    const bitsPerSample = BitSeparator.assemble(bitsPerSampleBytes, bitPerBlock)

    let content = {
        audioFormat: audioFormat,
        channelNumber: channelNumber,
        sampleRate: sampleRate,
        byteRate: byteRate,
        blockAlign: blockAlign,
        bitsPerSample: bitsPerSample
    }

    return content
  },

  decode_data_chunk: (data, bitPerBlock, nchannel, bitsPerSample) => {
    nchannel = Math.floor(nchannel)
    bitsPerSample = Math.floor(bitsPerSample)
    const bytesPerSample = bitsPerSample / 8
    const max_amplitude = Math.pow(2, bitsPerSample) - 1

    let values = []

    for (let i = 0; i < data.length; i += bytesPerSample * nchannel) {
        let cvalues = {}

        for (let j = 0; j < nchannel; j++) {
            const byteIndex = i + (j * bytesPerSample)
            const bytes = data.slice(byteIndex, byteIndex + bytesPerSample).reverse()
            let value = BitSeparator.assemble(bytes, bitPerBlock)
            let offset = 0

            if (bytesPerSample < 2) {
                offset = max_amplitude / 2
                value = (value - offset) / Math.floor(max_amplitude / 2) * 100
            }
            else {
                if (value > (max_amplitude / 2)) {
                    offset = max_amplitude
                }
                value = (value - offset) / Math.floor(max_amplitude / 2) * 100
            }

            const channelName = 'ch_' + (j + 1).toString()
            cvalues[channelName] = value
        }

        values.push(cvalues)
    }

    let content = {
        data: values
    }

    return content
  },

  decode_wave_format: (data, bitPerBlock) => {
    // chunk ID (big-endian) - 4 bytes
    const chunIDBytes = data.slice(0, 4)
    const chunkID = BitSeparator.assembleString(chunIDBytes)

    // chunk size (litlle-endian) - 4 bytes
    const chunkSizeBytes = data.slice(4, 8).reverse()
    const chunkSize = BitSeparator.assemble(chunkSizeBytes, bitPerBlock)

    // format (big-endian) - 4 bytes
    const formatBytes = data.slice(8, 12)
    const format = BitSeparator.assembleString(formatBytes)

    let result = {
        chunkID: chunkID,
        chunkSize: chunkSize,
        chunkContent: { format: format },
        subChunks: []
    }

    let byteIndex = 12
    let nchannel = 1
    let bitsPerSample = 16

    while (byteIndex < data.length) {
        const chunkIDBytes = data.slice(byteIndex, byteIndex + 4)
        const subChunkID = BitSeparator.assembleString(chunkIDBytes)

        const subChunkSizeBytes = data.slice(byteIndex + 4, byteIndex + 8).reverse()
        const subChunkSize = BitSeparator.assemble(subChunkSizeBytes, bitPerBlock)

        byteIndex += 8

        let subChunk = {
            chunkID: subChunkID,
            chunkSize: subChunkSize
        }

        let subChunkContent

        switch (subChunkID) {
            case 'fmt ':
                subChunkContent = WAV.decode_fmt_chunk(data.slice(byteIndex, byteIndex + subChunkSize), bitPerBlock)
                nchannel = subChunkContent.channelNumber ?? 1
                bitsPerSample = subChunkContent.bitsPerSample ?? 16
                break
            case 'data':
                subChunkContent = WAV.decode_data_chunk(data.slice(byteIndex, byteIndex + subChunkSize), bitPerBlock, nchannel, bitsPerSample)
                break
            default:
                break
        }

        byteIndex += subChunkSize

        subChunk.chunkContent = subChunkContent
        result.subChunks?.push(subChunk)
    }

    return result
  },

  decode_3gp_format: (data, bitPerBlock) => {
    // size - 4 bytes
    const chunkSizeBytes = data.slice(0, 4)
    const chunkSize = BitSeparator.assemble(chunkSizeBytes, bitPerBlock)

    // chunk ID - 4 bytes
    const chunIDBytes = data.slice(4, 8)
    const chunkID = BitSeparator.assembleString(chunIDBytes)

    // format - 4 bytes
    const formatBytes = data.slice(8, 12)
    const format = BitSeparator.assembleString(formatBytes)

    let result = {
        chunkID: chunkID,
        chunkSize: chunkSize,
        chunkContent: { format: format },
        subChunks: []
    }

    let byteIndex = chunkSize

    while (byteIndex < data.length) {
        // sub chunk ID
        const subChunkSizeBytes = data.slice(byteIndex, byteIndex + 4)
        const subChunkSize = BitSeparator.assemble(subChunkSizeBytes, bitPerBlock)

        // sub chunk size
        const chunkIDBytes = data.slice(byteIndex + 4, byteIndex + 8)
        const subChunkID = BitSeparator.assembleString(chunkIDBytes)

        byteIndex += 8

        let subChunk = {
            chunkID: subChunkID,
            chunkSize: subChunkSize
        }

        byteIndex += subChunkSize - 8

        result.subChunks?.push(subChunk)
    }

    return result
  },

  encode: (signal, nchannel, sampleRate, bitsPerSample) => {
    nchannel = Math.floor(nchannel)
    sampleRate = Math.floor(sampleRate)
    bitsPerSample = Math.floor(bitsPerSample)

    let data = []
    const subchunk1Size = 16
    const subchunk2Size = (signal.length * nchannel) * (bitsPerSample / 8)
    const chunkSize = 4 + (8 + subchunk1Size) + (8 + subchunk2Size)

    // -> set the header
    // chunk ID (big-endian) - 4 bytes
    data.push(...BitSeparator.splitString(WAV.CHUNK_ID))
    // chunk size (litlle-endian) - 4 bytes
    data.push(...BitSeparator.split(chunkSize, 8, 4).reverse())
    // format (big-endian) - 4 bytes
    data.push(...BitSeparator.splitString(WAV.FORMAT))

    const byteRate = sampleRate * nchannel * (bitsPerSample / 8)
    const blocAlign = nchannel * (bitsPerSample / 8)

    // sub chunk 1 ID (big-endian) - 4 bytes
    data.push(...BitSeparator.splitString(WAV.FMT_SUBCHUNK_ID))
    // sub chunk 1 size (litlle-endian) - 4 bytes
    data.push(...BitSeparator.split(subchunk1Size, 8, 4).reverse())
    // audio format (litlle endian) - 2 bytes
    data.push(...BitSeparator.split(WAV.FMT_AUDIO_FORMAT, 8, 2).reverse())
    // number of channel (litlle endian) - 2 bytes
    data.push(...BitSeparator.split(nchannel, 8, 2).reverse())
    // sample rate (litlle endian) - 4 bytes
    data.push(...BitSeparator.split(sampleRate, 8, 4).reverse())
    // byterate (litlle endian) - 4 bytes
    data.push(...BitSeparator.split(byteRate, 8, 4).reverse())
    // block align (little endian) - 2 bytes
    data.push(...BitSeparator.split(blocAlign, 8, 2).reverse())
    // bits per sample (litlle endian) - 2 bytes
    data.push(...BitSeparator.split(bitsPerSample, 8, 2).reverse())

    // -> set the data
    // sub chunk 2 ID (big-endian) - 4 bytes
    data.push(...BitSeparator.splitString(WAV.DATA_SUBCHUNK_ID))
    // sub chunk 2 size (litlle endian) - 4 bytes
    data.push(...BitSeparator.split(subchunk2Size, 8, 4).reverse())

    const max_amplitude = Math.pow(2, bitsPerSample) - 1

    for (let i = 0; i < signal.length; i++) {
        let value = signal[i]

        if (value < 0) {
            value = Math.max(value, -100)
            value = (value * Math.floor(max_amplitude / 2) / 100)
            if ((bitsPerSample / 8) < 2)
                value += max_amplitude / 2
            else
                value += max_amplitude
        }
        else {
            value = Math.min(value, 100)
            value = (value * Math.floor(max_amplitude / 2) / 100)
            if ((bitsPerSample / 8) < 2)
                value += max_amplitude / 2
        }

        value = Math.floor(value)

        // data value in big-endian
        const valueInByte = BitSeparator.split(value, 8, bitsPerSample / 8).reverse()

        for (let j = 0; j < nchannel; j++) {
            data.push(...valueInByte)
        }
    }

    const buffer = new Uint8Array(data)
    return buffer
  },

  decode: (bytes) => {
    const data = Array.from(bytes)
    const bitPerBlock = 8

    let result = null

    // format (big-endian) - 4 bytes
    const formatBytes = data.slice(8, 12)
    const format = BitSeparator.assembleString(formatBytes)

    switch (format) {
        case '3gp4':
            result = WAV.decode_3gp_format(data, bitPerBlock)
            break
        case 'WAVE':
            result = WAV.decode_wave_format(data, bitPerBlock)
            break
        default:
            break
    }

    return result
  }
}