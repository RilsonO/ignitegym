import { Center, Text } from 'native-base';

type Props = {
  title: string;
};
export function ScreenHeader({ title }: Props) {
  return (
    <Center bg='gray.600' pb={6} pt={16}>
      <Text color='gray.100' fontSize='xl'>
        {title}
      </Text>
    </Center>
  );
}
