export const BitSeparator = {
  split: (n, bitsPerElement, nbElement) => {
    if (bitsPerElement < 1 || !Number.isInteger(bitsPerElement)) {
        throw "Bits per element has to be greeter or equal to 1"
    }

    n = Math.abs(n)
    const mask = Math.pow(2, bitsPerElement) - 1
    let result = []

    while (n != 0) {
        const val = n & mask
        result.unshift(val)
        n = n >> bitsPerElement
    }

    if (nbElement && result.length > nbElement) {
        result = result.slice(result.length - nbElement)
    }

    for (let i = result.length; nbElement && i < nbElement; i++) {
        result.unshift(0)
    }

    return result
  }, 

  assemble: (arr, bitsPerElement) => {
    if (bitsPerElement < 1 || !Number.isInteger(bitsPerElement)) {
        throw "Bits per element has to be greeter or equal to 1"
    }

    let result = 0
    const base = Math.pow(2, bitsPerElement)

    for (let i = 0; i < arr.length; i++) {
        const val = arr[i]
        result += val * Math.pow(base, arr.length - i - 1)
    }

    return result
  },

  splitString: (str, bitsPerCaracter = 8) => {
    if (bitsPerCaracter < 1 || !Number.isInteger(bitsPerCaracter)) {
        throw "Bits per element has to be greeter or equal to 1"
    }

    let result = []

    if (str) {
        for (let i = 0; i < str.length; i++) {
            const c = str[i]
            const cVal = c.charCodeAt(0)
            const representation = BitSeparator.split(cVal, bitsPerCaracter, 1)
            result.push(...representation)
        }
    }

    return result
  },

  assembleString: (bytes) => {
    let result = ''

    for (let i = 0; bytes && i < bytes.length; i++) {
        const val = bytes[i]
        const character = String.fromCharCode(val)

        result += character
    }

    return result
  }
}