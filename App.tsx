import { Platform, StatusBar } from 'react-native';
import { NativeBaseProvider } from 'native-base';
import {
  useFonts,
  Roboto_400Regular,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';
import { THEME } from './src/theme';
import { Loading } from '@components/Loading';
import { Routes } from './src/routes';
import OneSignal from 'react-native-onesignal';

import { AuthContextProvider } from '@contexts/AuthContext';

const { ONE_SIGNAL_APP_ID_ANDROID } = process.env;
const { ONE_SIGNAL_APP_ID_IOS } = process.env;

const oneSignalAppId =
  Platform.OS === 'ios' ? ONE_SIGNAL_APP_ID_IOS : ONE_SIGNAL_APP_ID_ANDROID;

OneSignal.setAppId(oneSignalAppId as string);

OneSignal.promptForPushNotificationsWithUserResponse((response) => {
  // console.log(response);
});

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold });

  return (
    <NativeBaseProvider theme={THEME}>
      <StatusBar
        barStyle='light-content'
        backgroundColor={'transparent'}
        translucent
      />
      <AuthContextProvider>
        {fontsLoaded ? <Routes /> : <Loading />}
      </AuthContextProvider>
    </NativeBaseProvider>
  );
}
