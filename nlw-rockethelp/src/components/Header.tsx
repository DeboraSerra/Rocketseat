import { Heading, HStack, IconButton, StyledProps, useTheme } from 'native-base';
import Logo from '../assets/logo_secondary.svg';
import { CaretLeft } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';

type Props = StyledProps & {
  title?: string;
}

export function Header({ title, ...rest}: Props) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  function handleGoBack() {
    navigation.goBack();
  }
  return (
    <HStack
      {...rest}
      w="full"
      justifyContent="space-between"
      alignItems="center"
      bg="gray.600"
      pt={12}
      pb={5}
      px={6}
    >
      <IconButton
        onPress={handleGoBack}
        icon={ <CaretLeft size={26} color={colors.gray[300]} />}
      />
      <Heading color="gray.100" textAlign="center" fontSize="lg" flex={1} ml={-6}>
        {title}
      </Heading>
    </HStack>
  )
}
