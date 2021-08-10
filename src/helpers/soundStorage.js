import { FileSystem } from 'react-native-unimodules';
import { Base64 } from "./base64";
import { WAV } from './WAV';

export const SoundStorage = {
  DataStorageDir: 'data/',

  checkStorageDir: async () => {
    const dir = FileSystem.documentDirectory + SoundStorage.DataStorageDir
    const info = await FileSystem.getInfoAsync(dir)

    if (!info.exists) {
        await FileSystem.makeDirectoryAsync(dir)
    }
  },

  getFiles: async () => {
    await SoundStorage.checkStorageDir()

    const dir = FileSystem.documentDirectory + SoundStorage.DataStorageDir
    let files = await FileSystem.readDirectoryAsync(dir)
    files = files.filter((x) => x.match(/.wav|.3gp/))

    for (let i = 0; i < files.length; i++) {
        files[i] = dir + files[i]
    }

    return files
  },

  read: async (file) => {
    const content = await FileSystem.readAsStringAsync(file, { encoding: FileSystem.EncodingType.Base64 })
    const str = Base64.decode(content)

    let buffer = new Uint8Array(str.length)

    for (let i = 0; i < str.length; i++) {
        buffer[i] = str.charCodeAt(i);
    }

    return buffer
  },

  move: async (uri) => {
    const filename = uri.split('/').pop()
    const newUri = FileSystem.documentDirectory + SoundStorage.DataStorageDir + filename
    await FileSystem.moveAsync({ from: uri, to: newUri })

    return newUri
  },

  save: async (signal, nchannel, sampleRate, bitsPerSample) => {
    const bytes = WAV.encode(signal, nchannel, sampleRate, bitsPerSample)

    await SoundStorage.checkStorageDir()

    let str = ''
    for (let i = 0; i < bytes.length; i++) {
        const val = bytes[i]
        const char = String.fromCharCode(val)
        str += char
    }

    const base64Content = Base64.encode(str)

    const output_folder = FileSystem.documentDirectory + SoundStorage.DataStorageDir
    const currentDate = new Date().toJSON().replace(/[:.]/g, '_')
    const filename = output_folder + "sound_" + currentDate + ".wav"

    await FileSystem.writeAsStringAsync(filename, base64Content, { encoding: 'base64' })

    return filename
  },

  delete: async (file) => {
    await FileSystem.deleteAsync(file)
  }
}