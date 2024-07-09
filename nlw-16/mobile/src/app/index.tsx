import InputBox from "@/components/InputBox";
import { Loading } from "@/components/Loading";
import { tripStorage } from "@/storage/trip";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";

export default function Index() {
  const [isGettingTrip, setIsGettingTrip] = useState(true);
  useEffect(() => {
    getTrip();
  }, []);

  const getTrip = async () => {
    try {
      const tripId = await tripStorage.get();
      if (!tripId) {
        return setIsGettingTrip(false)
      }
      if (tripId) {
        return router.navigate(`/trip/${tripId}`);
      }
    } catch (e) {
      console.log(e);
      setIsGettingTrip(false);
    }
  }

  if (isGettingTrip) return <Loading />;

  return (
    <View className='flex-1 justify-center items-center px-5'>
      <Image
        source={require("@/assets/logo.png")}
        className='h-16'
        resizeMode='contain'
      />
      <Image source={require("@/assets/bg.png")} className='absolute' />
      <Text className='text-zinc-400 text-center font-regular text-sm mt-3'>
        Convide seus amigos e planeje sua{"\n"}próxima viagem!
      </Text>
      <InputBox />
    </View>
  );
}
