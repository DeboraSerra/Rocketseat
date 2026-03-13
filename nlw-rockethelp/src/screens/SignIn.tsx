import { VStack, Heading, Icon, useTheme } from 'native-base';
import auth from '@react-native-firebase/auth';
import { Envelope, Key } from 'phosphor-react-native';
import { useState } from 'react';
import { Alert } from 'react-native';
import Logo from '../assets/logo_primary.svg';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { colors } = useTheme();

  const handleLogin = () => {
    if (!email || !password) {
      return Alert.alert('Email e senha são obrigatórios');
    }
    auth
  }
  return (
    <VStack flex={1} alignItems="center" bg="gray.600" px={8} pt={24}>
      <Logo />
      <Heading color="gray.100" fontSize="xl" mt={20} mb={6}>
        Acesse sua conta
      </Heading>
      <Input
        placeholder="E-mail"
        mb={4}
        InputLeftElement={<Icon as={ <Envelope color={colors.gray[300]} /> } ml={4} />}
        name="email"
        value={ email }
        onChangeText={ setEmail }
      />
      <Input
        placeholder="Senha"
        InputLeftElement={<Icon as={ <Key color={colors.gray[300]} /> } ml={4} />}
        secureTextEntry
        name="password"
        value={ password }
        onChangeText={ setPassword }
      />
      <Button text="Entrar" mt={8} w="full" />
    </VStack>
  );
}
