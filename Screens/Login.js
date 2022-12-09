import React, {useState, useEffect} from 'react';
import {StyleSheet, Image, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Input, Button} from 'react-native-elements';
import {useSelector, useDispatch} from 'react-redux';
import {showMessage} from 'react-native-flash-message';

import Logo from '../assets/icon.png';
import Loading from '../Components/Loading';
import {clear, loginRequest, pending} from '../Reducers/loginSlice';

const Login = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();

  const userLogin = useSelector(state => state.userLogin);
  const {loading, error, userInfo} = userLogin;

  useEffect(() => {
    dispatch(clear());
    if (userInfo && userInfo.email) {
      navigation.navigate('Dashboard');
    }
    if (error) {
      showMessage({
        message: error,
        type: 'danger',
        floating: false,
        style: {alignItems: 'center'},
        fontWeight: 'bold',
        position: 'top',
      });
    }
  }, [userInfo, navigation, error]);

  const loginHandler = () => {
    if (email === '' || password === '') {
      showMessage({
        message: 'You must complete all fields!',
        type: 'warning',
        floating: false,
        style: {alignItems: 'center'},
        position: 'top',
      });
    } else {
      dispatch(pending());
      dispatch(loginRequest(email.toLowerCase(), password));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <Loading />
      ) : (
        <ScrollView>
          <KeyboardAwareScrollView>
            <Image style={styles.image} source={Logo} />
            <Input
              placeholder="Email Address"
              onChangeText={e => setEmail(e)}
            />

            <Input
              placeholder="Password"
              secureTextEntry={true}
              onChangeText={e => setPassword(e)}
            />
            <Button
              buttonStyle={styles.loginButton}
              title="Login"
              onPress={loginHandler}
            />
            <Button
              buttonStyle={styles.registerButton}
              titleStyle={{color: 'black'}}
              title="Register"
              onPress={() => navigation.navigate('Register')}
            />
          </KeyboardAwareScrollView>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    marginTop: 20,
    width: 200,
    height: 180,
    alignSelf: 'center',
    borderRadius: 25,
    marginBottom: 50,
  },
  form: {
    marginTop: 50,
    margin: 25,
  },
  loginButton: {
    margin: 25,
    backgroundColor: '#2196f3',
    fontWeight: 'bold',
  },
  registerButton: {
    margin: 25,
    marginTop: 0,
    backgroundColor: '#F3F3F3',
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Login;
