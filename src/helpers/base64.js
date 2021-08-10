export const Base64 = {
  keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

  encode: (str) => {
    let output = []
    let chr1, chr2, chr3
    let enc1, enc2, enc3, enc4
    let i = 0

    do {
        chr1 = str.charCodeAt(i++)
        chr2 = str.charCodeAt(i++)
        chr3 = str.charCodeAt(i++)

        enc1 = chr1 >> 2
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
        enc4 = chr3 & 63

        if (isNaN(chr2)) {
            enc3 = enc4 = 64
        } else if (isNaN(chr3)) {
            enc4 = 64
        }

        output.push(
            Base64.keyStr.charAt(enc1) +
            Base64.keyStr.charAt(enc2) +
            Base64.keyStr.charAt(enc3) +
            Base64.keyStr.charAt(enc4))
    } while (i < str.length)

    return output.join('')
  },

  decode: (str) => {
    let output = ""
    let chr1, chr2, chr3
    let enc1, enc2, enc3, enc4
    let i = 0

    // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
    var base64test = /[^A-Za-z0-9\+\/\=]/g
    if (base64test.exec(str)) {
        console.warn("There were invalid base64 characters in the input text.\n" +
            "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
            "Expect errors in decoding.")
    }

    str = str.replace(/[^A-Za-z0-9\+\/\=]/g, "")

    do {
        enc1 = Base64.keyStr.indexOf(str.charAt(i++))
        enc2 = Base64.keyStr.indexOf(str.charAt(i++))
        enc3 = Base64.keyStr.indexOf(str.charAt(i++))
        enc4 = Base64.keyStr.indexOf(str.charAt(i++))

        chr1 = (enc1 << 2) | (enc2 >> 4)
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
        chr3 = ((enc3 & 3) << 6) | enc4

        output = output + String.fromCharCode(chr1)

        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2)
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3)
        }

    } while (i < str.length)

    return output
  },

    base64_to_array: (base64) => {
        base64 = base64.replace(/\=/gi, '')
        let arr = []
        for (let i = 0; i < base64.length; i++) {
            const char = base64[i]
            const index = Base64.keyStr.indexOf(char)
            arr.push(index)
        }
        return arr
    },
}