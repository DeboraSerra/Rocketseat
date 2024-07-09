import InputBox from "@/components/InputBox";
import { Image, Text, View } from "react-native";

export default function Index() {
  return (
    <View className='flex-1 justify-center items-center px-5'>
      <Image
        source={require("@/assets/logo.png")}
        className='h-16'
        resizeMode='contain'
      />
      <Image source={require('@/assets/bg.png')} className="absolute" />
      <Text className='text-zinc-400 text-center font-regular text-sm mt-3'>
        Convide seus amigos e planeje sua{"\n"}próxima viagem!
      </Text>
      <InputBox />
    </View>
  );
}
