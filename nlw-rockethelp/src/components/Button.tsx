import { Button as ButtonNative, IButtonProps, Heading } from 'native-base';

type Props = IButtonProps & {
  text: string;
}

export function Button({ text, ...rest }: Props) {
  return (
    <ButtonNative bg="green.700" h={14} fontSize="sm" rounded="sm" _pressed={{ bg: "green.500" }} { ...rest }>
      <Heading color="white" fontSize="sm">
        {text}
      </Heading>
    </ButtonNative>
  )
}
