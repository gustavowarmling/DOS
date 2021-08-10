import { Audio } from "expo-av";

export const SoundPlayerService = {
  play: async (file) => {
   try {
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false })

    const { sound } = await Audio.Sound.createAsync({ uri: file })

    if (sound) {
        await sound.setPositionAsync(0)
        await sound.playAsync()
    }
   } catch (error) {
     console.log(error)
   }
  },
}