import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {View, Text, StyleSheet} from 'react-native';
import {Button, Input} from 'react-native-elements';
import {showMessage} from 'react-native-flash-message';
import EncryptedStorage from 'react-native-encrypted-storage';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

//Bring in components
import Loading from '../Components/Loading';
import StateMonitor from '../Components/StateMonitor';

//Bring in reducers
import {unlock} from '../Reducers/lockSlice';
import {logout, pending, clear} from '../Reducers/loginSlice';

const Dashboard = ({navigation}) => {
  const [pin, setPin] = useState(null);
  const [pinSet, setPinSet] = useState(false);
  const [pinNull, setPinNull] = useState(true);
  const dispatch = useDispatch();

  const userLogin = useSelector(state => state.userLogin);
  const {loading, error, userInfo} = userLogin;

  const lockedState = useSelector(state => state.lockedState);
  const {locked} = lockedState;

  useEffect(() => {
    if (locked && !pinNull) {
      navigation.navigate('LockScreen');
    }

    dispatch(clear());
    if (!userInfo.email) {
      navigation.navigate('Login');
    }

    if (pinSet) {
      showMessage({
        message: 'Pin Created!',
        type: 'success',
        floating: false,
        style: {alignItems: 'center'},
        position: 'top',
      });
      setPinSet(false);
      setPin(null);
    }
  }, [userInfo, loading, error, locked, pin, pinSet]);

  const logoutHandler = async e => {
    e.preventDefault();
    dispatch(pending());
    dispatch(logout());
    dispatch(unlock());
    try {
      await EncryptedStorage.removeItem('pin');
      setPinNull(true);
    } catch (e) {
      // saving error
      console.log(e);
    }
  };

  const handlePin = e => {
    e.preventDefault();
    storeData(pin);
  };

  const storeData = async value => {
    try {
      await EncryptedStorage.setItem('pin', value);
      setPinSet(true);
      setPinNull(false);
    } catch (e) {
      // saving error
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Loading />
      ) : (
        <KeyboardAwareScrollView contentContainerStyle={styles.container}>
          <View style={styles.container}>
            <Text style={styles.text}>Welcome {userInfo.name}</Text>
            <View style={styles.secretData}>
              <Text style={styles.secretText}>Super secret data....</Text>
              <StateMonitor />
            </View>
            <View style={styles.buttonContainer}>
              <Input
                placeholder="Pin"
                keyboardType="decimal-pad"
                onChangeText={e => setPin(e)}
                value={pin}
              />
              <Button title="Create Pin" onPress={handlePin} />
            </View>
            <View style={styles.buttonContainer}>
              <Button title="Logout" onPress={logoutHandler} />
            </View>
          </View>
        </KeyboardAwareScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    paddingTop: 5,
  },
  buttonContainer: {
    flex: 1,
  },
  secretData: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secretText: {
    fontSize: 20,
  },
});

export default Dashboard;
