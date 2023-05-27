import { HistoryCard } from '@components/HistoryCard';
import { Loading } from '@components/Loading';
import { ScreenHeader } from '@components/ScreenHeader';
import { HistoryByDayDTO } from '@dtos/HistoryByDayDTO';
import { useFocusEffect } from '@react-navigation/native';
import { AppError } from '@utils/AppError';
import { Heading, VStack, SectionList, Text, useToast } from 'native-base';
import { useCallback, useState } from 'react';
import { useAuth } from '@hooks/useAuth';

export function History() {
  const toast = useToast();
  const { syncWeeklyExerciseCount, historyIsLoading, fetchHistory } = useAuth();
  const [exercises, setExercises] = useState<HistoryByDayDTO[]>([]);

  async function fetchData() {
    try {
      const response = await fetchHistory();
      setExercises(response);
      await syncWeeklyExerciseCount(response);
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : 'Não foi possível carregar o histórico.';

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      });
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  return (
    <VStack flex={1}>
      <ScreenHeader title='Histórico de Exercícios' />

      {historyIsLoading ? (
        <Loading />
      ) : (
        <SectionList
          sections={exercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HistoryCard data={item} />}
          renderSectionHeader={({ section }) => (
            <Heading
              color='gray.200'
              fontSize='md'
              mt={10}
              mb={3}
              fontFamily='heading'
            >
              {section.title}
            </Heading>
          )}
          px={8}
          contentContainerStyle={
            exercises.length === 0 && { flex: 1, justifyContent: 'center' }
          }
          ListEmptyComponent={() => (
            <Text color='gray.100' textAlign='center'>
              Não há exercícios registrados ainda.{'\n'}Vamos fazer exercicios
              hoje?
            </Text>
          )}
        />
      )}
    </VStack>
  );
}
