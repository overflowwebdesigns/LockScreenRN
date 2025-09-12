import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {StyleSheet} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import EncryptedStorage from 'react-native-encrypted-storage';
import {showMessage} from 'react-native-flash-message';
import {Button, Input} from 'react-native-elements';
import {unlock} from '../Reducers/lockSlice';
import {SafeAreaView} from 'react-native-safe-area-context';

const LockScreen = ({navigation}) => {
  const [pin, setPin] = useState(null);
  const dispatch = useDispatch();

  const lockedState = useSelector(state => state.lockedState);
  const {locked} = lockedState;

  useEffect(() => {
    if (!locked) {
      navigation.navigate('Dashboard');
    }
  }, [locked]);

  const handleUnlock = () => {
    getData(pin);
  };
  const getData = async pin => {
    try {
      const value = await EncryptedStorage.getItem('pin');
      if (value !== null) {
        // value previously stored
        if (value === pin) {
          dispatch(unlock());
        } else {
          showMessage({
            message: 'Incorrect Pin!',
            type: 'danger',
            floating: false,
            style: {alignItems: 'center'},
            position: 'top',
          });
        }
      }
    } catch (e) {
      // error reading value
      console.log(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView contentContainerStyle={styles.container}>
        <Input
          placeholder="Pin"
          onChangeText={e => setPin(e)}
          keyboardType="decimal-pad"
        />
        <Button title="Unlock" onPress={handleUnlock} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  test: {
    marginTop: '25%',
  },
});

export default LockScreen;
