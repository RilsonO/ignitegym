import { Children, createContext, ReactNode, useEffect, useState } from 'react';
import { UserDTO } from '@dtos/UserDTO';
import { api } from '@services/api';
import {
  storageUserGet,
  storageUserRemove,
  storageUserSave,
} from '@storage/storageUser';
import {
  storageAuthTokenGet,
  storageAuthTokenRemove,
  storageAuthTokenSave,
} from '@storage/storageAuthToken';
import { tagExercisesCountUpdate } from '../notifications/notificationsTags';
import { HistoryByDayDTO } from '@dtos/HistoryByDayDTO';

export type AuthContextDataProps = {
  user: UserDTO;
  updateUserProfile: (userUpdated: UserDTO) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchHistory: () => Promise<HistoryByDayDTO[]>;
  historyIsLoading: boolean;
  isLoadingUserStorageData: boolean;
  syncWeeklyExerciseCount: (
    exercisesHistory: HistoryByDayDTO[]
  ) => Promise<void>;
};

type AuthContextProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextDataProps>(
  {} as AuthContextDataProps
);

function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<UserDTO>({} as UserDTO);
  const [isLoadingUserStorageData, setIsLoadingUserStorageData] =
    useState(true);
  const [historyIsLoading, setHistoryIsLoading] = useState(false);

  async function fetchHistory() {
    try {
      setHistoryIsLoading(true);
      const response = await api.get(`/history`);
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setHistoryIsLoading(false);
    }
  }

  function getRecentMonday(): Date {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Offset para voltar para a última segunda-feira
    const mondayOffset = dayOfWeek > 1 ? dayOfWeek - 1 : 6;
    const monday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - mondayOffset
    );
    return monday;
  }

  function parseDate(dateString: string): Date {
    const [day, month, year] = dateString.split('.');
    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
    return parsedDate;
  }

  function sumExercisesUntilRecentMonday(data: HistoryByDayDTO[]): number {
    const currentDate = new Date();
    const recentMonday = getRecentMonday();
    let sum = 0;

    for (let i = 0; i < data.length; i++) {
      const entry = data[i];

      // Converte a string de data no formato "DD.MM.YYYY" para um objeto Date
      const entryDate = parseDate(entry.title);

      // Verifica se a data é posterior à recentMonday e não ultrapassa a currentDate
      if (entryDate >= recentMonday && entryDate <= currentDate) {
        sum += entry.data.length;
      }
    }

    return sum;
  }

  async function syncWeeklyExerciseCount(
    exercisesHistory: HistoryByDayDTO[]
  ): Promise<void> {
    const weeklyExerciseCount = sumExercisesUntilRecentMonday(exercisesHistory);
    await tagExercisesCountUpdate(String(weeklyExerciseCount));
  }

  async function userAndTokenUpdate(userData: UserDTO, token: string) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  }

  async function storageUserAndTokenSave(
    userData: UserDTO,
    token: string,
    refresh_token: string
  ) {
    try {
      setIsLoadingUserStorageData(true);

      await storageUserSave(userData);
      await storageAuthTokenSave({ token, refresh_token });
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorageData(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { data } = await api.post('/sessions', { email, password });
      console.log('token:', data.token);

      if (data.user && data.token && data.refresh_token) {
        await storageUserAndTokenSave(
          data.user,
          data.token,
          data.refresh_token
        );
        await userAndTokenUpdate(data.user, data.token);
      }
    } catch (error) {
      throw error;
    }
  }

  async function signOut() {
    try {
      setIsLoadingUserStorageData(true);

      setUser({} as UserDTO);
      await storageUserRemove();
      await storageAuthTokenRemove();
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorageData(false);
    }
  }

  async function updateUserProfile(userUpdated: UserDTO) {
    try {
      setUser(userUpdated);
      await storageUserSave(userUpdated);
    } catch (error) {
      throw error;
    }
  }

  async function loadUserData() {
    try {
      setIsLoadingUserStorageData(true);

      const userLogged = await storageUserGet();
      const { token } = await storageAuthTokenGet();

      if (token && userLogged) {
        userAndTokenUpdate(userLogged, token);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorageData(false);
    }
  }

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    const subscribe = api.registerInterceptTokenManager(signOut);

    return () => {
      subscribe();
    };
  }, [signOut]);

  return (
    <AuthContext.Provider
      value={{
        user,
        updateUserProfile,
        signIn,
        signOut,
        fetchHistory,
        historyIsLoading,
        isLoadingUserStorageData,
        syncWeeklyExerciseCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthContextProvider };
