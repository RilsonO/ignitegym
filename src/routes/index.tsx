import { useEffect, useState } from 'react';
import { useTheme, Box } from 'native-base';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { AuthRoutes } from './auth.routes';
import { AppRoutes } from './app.routes';

import { AuthContext } from '@contexts/AuthContext';
import { useAuth } from '@hooks/useAuth';
import { Loading } from '@components/Loading';
import OneSignal, {
  NotificationReceivedEvent,
  OSNotification,
} from 'react-native-onesignal';
import { Notification } from '@components/Notification';

export function Routes() {
  const { colors } = useTheme();
  const { user, isLoadingUserStorageData } = useAuth();

  const theme = DefaultTheme;
  theme.colors.background = colors.gray[700];

  const [notification, setNotification] = useState<OSNotification>();

  const authScreens = {
    signUp: {
      path: 'signUp',
    },
    NotFound: '*',
  };

  const appScreens = {
    history: {
      path: 'history',
    },
    exercise: {
      path: 'exercise/:exerciseId',
      parse: {
        exerciseId: (exerciseId: string) => exerciseId,
      },
    },
    NotFound: '*',
  };

  const linking = {
    prefixes: ['ignitegym://', 'com.rilson.ignitegym://', 'exp+ignitegym://'],
    config: {
      screens: user.id ? appScreens : authScreens,
    },
  };

  useEffect(() => {
    const unsubscribe = OneSignal.setNotificationWillShowInForegroundHandler(
      (notificationReceivedEvent: NotificationReceivedEvent) => {
        const response = notificationReceivedEvent.getNotification();

        setNotification(response);
      }
    );

    return () => unsubscribe;
  }, []);

  if (isLoadingUserStorageData) {
    return <Loading />;
  }

  return (
    <Box flex={1} bg='gray.700'>
      <NavigationContainer theme={theme} linking={linking}>
        {user.id ? <AppRoutes /> : <AuthRoutes />}

        {notification?.title && (
          <Notification
            data={notification}
            onClose={() => setNotification(undefined)}
          />
        )}
      </NavigationContainer>
    </Box>
  );
}
