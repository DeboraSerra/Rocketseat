import { Input as NativeBaseInput, IInputProps } from 'native-base';

type Props = IInputProps & {
  name?: string,
  value?: string,
  onChangeText?: Function,
}

export function Input({ ...rest }: Props) {
  return (
    <NativeBaseInput
      bg="gray.700"
      h={14}
      size="md"
      borderWidth={0}
      fontSize="md"
      fontFamily="body"
      color="white"
      placeholderTextColor="gray.300"
      _focus={{
        borderWidth: 1,
        borderColor: "green.500",
        bg: "gray.700",
      }}
      { ...rest }
    />
  )
}
