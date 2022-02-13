import * as React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  TextInput,
  LogBox,
} from 'react-native';
import Tts from 'react-native-tts';
import DateTimePicker from '@react-native-community/datetimepicker';
import BackgroundTimer from 'react-native-background-timer';
import Sound from 'react-native-sound';
import database from '@react-native-firebase/database';

LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
Tts.setDefaultLanguage('en-GB');
Sound.setCategory('Playback');

let itemsRef = database().ref('/Scale/mean_weight');

const audio_path =
  'https://raw.githubusercontent.com/victormacedo10/jarvisApp/master/alarm_sound.mp3';

var audio = new Sound(audio_path, null, error => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }
  // if loaded successfully
  console.log(
    'duration in seconds: ' +
      audio.getDuration() +
      'number of channels: ' +
      audio.getNumberOfChannels(),
  );
});

function App() {
  const [todoText, onChangeText] = React.useState(
    'Good morning V,\n\nHere are your tasks for today\n\n',
  );
  const [timeoutId, changeTimeoutId] = React.useState({});
  // const [sound, setSound] = React.useState();
  const [date, setDate] = React.useState(new Date(1598051730000));
  const [show, setShow] = React.useState(false);
  const [showAlarm, setShowAlarm] = React.useState('No alarm set yet');
  const [playing, setPlaying] = React.useState();

  React.useEffect(() => {
    itemsRef.on('value', snapshot => {
      let data = snapshot.val();
      const items = Object.values(data);
      console.log("Printing Items:");
      console.log(snapshot);
    });
    audio.setVolume(1);
    return () => {
      audio.release();
    };
  }, []);

  const playPause = () => {
    if (audio.isPlaying()) {
      audio.pause();
      setPlaying(false);
    } else {
      setPlaying(true);
      audio.play(success => {
        if (success) {
          setPlaying(false);
          console.log('successfully finished playing');
        } else {
          setPlaying(false);
          console.log('playback failed due to audio decoding errors');
        }
      });
    }
  };

  async function setAudioFile(){
    playPause();
  }

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    setShow(false);
    setShowAlarm(
      `Alarm set to ${putZero(parseInt(currentDate.getHours(), 10))}:${putZero(
        parseInt(currentDate.getMinutes(), 10),
      )}`,
    );
    setAlarm(
      parseInt(currentDate.getHours(), 10),
      parseInt(currentDate.getMinutes(), 10),
    );
  };

  const showTimepicker = () => {
    setShow(true);
  };

  async function readTodoList() {
    await Tts.speak(todoText, {
      androidParams: {
        KEY_PARAM_PAN: -1,
        KEY_PARAM_VOLUME: 0.5,
        KEY_PARAM_STREAM: 'STREAM_MUSIC',
      },
    });
  }

  // Função para acrescentar zero no número que representa um tempo (hh:mm:ss)
  const putZero = data => {
    if (data < 10) {
      return `0${data}`;
    }
    return data;
  };

  const convertHHMMtoMS = (hh, mm) => {
    const timeMS = 1000 * (hh * 3600 + mm * 60);
    return timeMS;
  };

  const getDateTime = () => {
    const hh = parseInt(new Date().getHours(), 10); // pega a hora atual
    const mm = parseInt(new Date().getMinutes(), 10); // pega os minutos atuais
    const ss = parseInt(new Date().getSeconds(), 10); // pega os segundos atuais

    const timeMS = convertHHMMtoMS(hh, mm) + ss * 1000;

    return timeMS;
  };

  const setAlarm = (hh, mm) => {
    console.log(`hh = ${hh}`);
    console.log(`mm = ${mm}`);
    const timeMS = convertHHMMtoMS(hh, mm);
    const curTimeMS = getDateTime();
    console.log(`timeMS = ${timeMS}`);
    console.log(`curTimeMS = ${curTimeMS}`);

    if (timeMS >= curTimeMS) {
      const timeoutMS = timeMS - curTimeMS;
      console.log(`Setting timer to: ${timeoutMS}`);
      // Start a timer that runs once after X milliseconds
      changeTimeoutId(
        BackgroundTimer.setTimeout(() => {
          console.log(`Alarm playing: ${timeoutMS}`);
          playPause();
          setShowAlarm('No alarm set yet');
        }, timeoutMS),
      );
    } else {
      const timeoutMS = 86400 - curTimeMS + timeMS;
      console.log(`Setting timer to: ${timeoutMS}`);
      // Start a timer that runs once after X milliseconds
      changeTimeoutId(
        BackgroundTimer.setTimeout(() => {
          console.log(`Alarm playing: ${timeoutMS}`);
          playPause();
          setShowAlarm('No alarm set yet');
        }, timeoutMS),
      );
    }
  };

  const cancelAlarm = () => {
    BackgroundTimer.clearTimeout(timeoutId);
    setShowAlarm('No alarm set yet');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Jarvis</Text>
      <TextInput
        multiline
        editable
        numberOfLines={18}
        onChangeText={text => onChangeText(text)}
        value={todoText}
        style={styles.textInputBox}
      />
      <Text style={styles.alarmText}>{showAlarm}</Text>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      )}
      <View style={styles.alarmButton}>
        <TouchableOpacity
          style={styles.buttonBoxAlarm}
          activeOpacity={0.75}
          onPress={showTimepicker}>
          <Text style={styles.itemtext}>New</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonBoxCancelAlarm}
          activeOpacity={0.75}
          onPress={cancelAlarm}>
          <Text style={styles.itemtext}>Cancel</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonBox}>
        <TouchableOpacity
          style={styles.buttonBoxMusic}
          activeOpacity={0.75}
          onPress={setAudioFile}>
          <Text style={styles.itemtext}>Alarm Sound</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonBoxCurtain}
          activeOpacity={0.75}
          onPress={readTodoList}>
          <Text style={styles.itemtext}>Open Curtain</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonBoxWeight}
          activeOpacity={0.75}
          onPress={readTodoList}>
          <Text style={styles.itemtext}>Check Weight</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginVertical: '5%',
  },
  buttonBox: {
    justifyContent: 'space-between',
  },
  buttonBoxCurtain: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'yellow',
    textAlign: 'center',
    marginLeft: '5%',
    marginRight: '5%',
    marginBottom: '2%',
    height: 50,
  },
  buttonBoxWeight: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'gray',
    textAlign: 'center',
    marginLeft: '5%',
    marginRight: '5%',
    marginBottom: '2%',
    height: 50,
  },
  buttonBoxMusic: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'orange',
    textAlign: 'center',
    marginLeft: '5%',
    marginRight: '5%',
    marginBottom: '2%',
    height: 50,
  },
  buttonBoxAlarm: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'green',
    textAlign: 'center',
    marginLeft: '5%',
    marginRight: '5%',
    height: 50,
    width: 100,
  },
  buttonBoxCancelAlarm: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
    textAlign: 'center',
    marginLeft: '5%',
    marginRight: '5%',
    height: 50,
    width: 100,
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  alarmText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  itemtext: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textInputBox: {
    textAlignVertical: 'top',
    backgroundColor: 'white',
    borderColor: '#000000',
    borderWidth: 1,
    marginLeft: '5%',
    marginRight: '5%',
  },
  alarmButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginLeft: '5%',
    marginRight: '5%',
  },
});
