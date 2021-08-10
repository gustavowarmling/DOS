import React, {useState} from 'react';

import { Base64 } from '../helpers/base64';
import { BitSeparator } from '../helpers/bitSeparator';
import { SignalBuilder } from '../helpers/signalBuilder';
import { concat, linspace, normalize } from '../helpers/tools';
import { WAV } from '../helpers/WAV';
import { SoundStorage } from '../helpers/soundStorage';
import { SoundPlayerService } from '../helpers/soundPlayer';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';

export function Home() {
  const [inputText, setInputText] = useState('');

  function handleInputTextChange(value) {
    setInputText(value);
  }

  function encode_base64_to_signal(base64, sample_rate, bloc_duration) {
    const base64_values = Base64.base64_to_array(base64)

    const freqs = linspace(100, 600, 6)
    const freq_porteuse = 50
    const amp = 90

    let signal = []

    for (let i = 0; i < base64_values.length; i++) {
      const val = base64_values[i]
      const binary_arr = BitSeparator.split(val, 1, 6)

      let bloc_signal = SignalBuilder.generateSignal(freq_porteuse, 0, bloc_duration, sample_rate, amp)

      for (let j = 0; j < freqs.length; j++) {
          if (binary_arr[j] != 0) {
              const freq = freqs[j]
              const freq_i_signal = SignalBuilder.generateSignal(freq, 0, bloc_duration, sample_rate, amp)
              bloc_signal = concat(bloc_signal, freq_i_signal)
          }
      }

      bloc_signal = normalize(bloc_signal, amp)
      signal = [...signal, ...bloc_signal]
    }

    return signal
  }

  async function encode (message) {
    const SAMPLE_RATE = 44100
    const BLOC_DURATION = 0.05
    const BIT_PER_SAMPLE = 16
    let wavSignal = []

    const message_b64 = Base64.encode(message)
    const signal = encode_base64_to_signal(message_b64, SAMPLE_RATE, BLOC_DURATION)

    const sound = WAV.encode(signal, 1, SAMPLE_RATE, BIT_PER_SAMPLE)
    
    for (let i = 0; i < sound.length; i++){
        wavSignal.push(sound[i])
    }

    let filename = await SoundStorage.save(wavSignal, 1, SAMPLE_RATE, BIT_PER_SAMPLE)
    SoundPlayerService.play(filename)
  }

  onConvert = () => {
    const base64 = inputText;
    
    if (base64) {
      encode(base64)
    }
  }

  async function handleGenerateAudio() {
    onConvert();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teste de DOS</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite o texto"
        placeholderTextColor="#999"
        onChangeText={handleInputTextChange}
      />

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.6}
        onPress={handleGenerateAudio}>
        <Text style={styles.buttonText}>Gerar audio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121015',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#1F1E25',
    color: '#FFF',
    fontSize: 18,
    padding: Platform.OS === 'ios' ? 15 : 10,
    marginTop: 30,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#A370F7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
