import { Button } from '@components/Button';
import { useNavigation } from '@react-navigation/native';
import { Heading, VStack } from 'native-base';

export function NotFound() {
  const { goBack } = useNavigation();
  function handleGoBack() {
    goBack();
  }

  return (
    <VStack flex={1} px='4'>
      <VStack flex={1} px='4' justifyContent='center'>
        <Heading color='white' textAlign='center'>
          Ops! Houve um problema com a sua notificação!
        </Heading>
      </VStack>
      <Button title='Voltar' onPress={goBack} />
    </VStack>
  );
}
