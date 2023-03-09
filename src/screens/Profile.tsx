import { Platform, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import {
  Center,
  ScrollView,
  VStack,
  Skeleton,
  Text,
  Heading,
  KeyboardAvoidingView,
  useToast,
} from 'native-base';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { ScreenHeader } from '@components/ScreenHeader';
import { UserPhoto } from '@components/UserPhoto';
import { Input } from '@components/Input';
import { Button } from '@components/Button';

type FormDataProps = {
  name: string;
  old_password: string;
  new_password: string;
  new_password_confirm: string;
};

const profileSchema = yup.object({
  name: yup.string().required('Informe o nome.'),
  old_password: yup
    .string()
    .required('Informe a senha antiga.')
    .min(6, 'A senha deve ter pelo menos 6 dígitos.'),
  new_password: yup
    .string()
    .required('Informe a nova senha.')
    .min(6, 'A nova senha deve ter pelo menos 6 dígitos.'),
  new_password_confirm: yup
    .string()
    .required('Confirme a nova senha.')
    .oneOf(
      [yup.ref('new_password')],
      'A confirmação da nova senha não confere.'
    ),
});

const PHOTO_SIZE = 33;

export function Profile() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataProps>({
    resolver: yupResolver(profileSchema),
  });

  const [photoIsLoading, setPhotoIsLoading] = useState(false);
  const [userPhoto, setUserPhoto] = useState('https://github.com/rilsonO.png');
  const toast = useToast();

  async function handleUserPhotoSelect() {
    setPhotoIsLoading(true);
    try {
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true,
      });

      if (photoSelected.canceled) return;

      if (photoSelected.assets[0].uri) {
        const photoInfo = (await FileSystem.getInfoAsync(
          photoSelected.assets[0].uri
        )) as FileSystem.FileInfo & { size?: number };

        if (photoInfo.size && photoInfo.size / 1024 / 1024 > 5) {
          return toast.show({
            title: 'Essa Imagem é muito grande. Escolha uma de até 5MB',
            placement: 'top',
            bgColor: 'red.500',
          });
        }

        setUserPhoto(photoSelected.assets[0].uri);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setPhotoIsLoading(false);
    }
  }

  function handleUpdateProfile({
    name,
    old_password,
    new_password,
    new_password_confirm,
  }: FormDataProps) {
    console.log({ name, old_password, new_password, new_password_confirm });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <VStack flex={1}>
        <ScreenHeader title='Perfil' />

        <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
          <Center mt={6} px={10}>
            {photoIsLoading ? (
              <Skeleton
                w={PHOTO_SIZE}
                h={PHOTO_SIZE}
                rounded='full'
                startColor='gray.500'
                endColor='gray.400'
              />
            ) : (
              <UserPhoto
                source={{ uri: userPhoto }}
                alt='Foto do usuário'
                size={PHOTO_SIZE}
              />
            )}

            <TouchableOpacity onPress={handleUserPhotoSelect}>
              <Text
                color='green.500'
                fontWeight='bold'
                fontSize='md'
                mt={2}
                mb={8}
              >
                Alterar foto
              </Text>
            </TouchableOpacity>

            <Controller
              control={control}
              name='name'
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder='nome'
                  value={value}
                  onChangeText={onChange}
                  bg='gray.600'
                  errorMessage={errors.name?.message}
                />
              )}
            />

            <Input placeholder='E-mail' bg='gray.600' isDisabled />

            <Heading
              color='gray.200'
              fontSize='md'
              mb={2}
              alignSelf='flex-start'
              mt={12}
              fontFamily='heading'
            >
              Alterar senha
            </Heading>

            <Controller
              control={control}
              name='old_password'
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder='Senha antiga'
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  bg='gray.600'
                  errorMessage={errors.old_password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name='new_password'
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder='Nova senha'
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  bg='gray.600'
                  errorMessage={errors.new_password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name='new_password_confirm'
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder='Confirme a nova senha'
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onSubmitEditing={handleSubmit(handleUpdateProfile)}
                  returnKeyType='send'
                  bg='gray.600'
                  errorMessage={errors.new_password_confirm?.message}
                />
              )}
            />

            <Button
              title='Atualizar'
              mt={4}
              onPress={handleSubmit(handleUpdateProfile)}
            />
          </Center>
        </ScrollView>
      </VStack>
    </KeyboardAvoidingView>
  );
}
