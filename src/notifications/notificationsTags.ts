import OneSignal from 'react-native-onesignal';
import {
  USER_AUTH_STATUS,
  LAST_EXERCISES_DATE,
  WEEK_EXERCISES_COUNT,
} from './notificationTagsConfig';

type AllowedAuthStatus = 'authenticated' | 'unauthenticated';

export function tagUserAuthStatusUpdate(status: AllowedAuthStatus) {
  OneSignal.sendTag(USER_AUTH_STATUS, status);
}

export function tagUserLastExercisesDate(dateTimeUnix: string) {
  OneSignal.sendTag(LAST_EXERCISES_DATE, dateTimeUnix);
}

export function tagExercisesCountUpdate(weekExercisesCount: string) {
  OneSignal.sendTag(WEEK_EXERCISES_COUNT, weekExercisesCount);
}
