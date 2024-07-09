import "@/style/global.css";
import "@/utils/dayjsLocaleConfig";
import { Slot } from "expo-router";
import { StatusBar, View } from "react-native";

import { Loading } from "@/components/Loading";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts,
} from "@expo-google-fonts/inter";

export default function Layout() {
  const [loader] = useFonts({
    Inter_500Medium,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  if (!loader) return <Loading />;

  return (
    <View className='flex-1 justify-center items-center bg-zinc-950 text-zinc-50'>
      <StatusBar
        barStyle='light-content'
        backgroundColor='transparent'
        translucent
      />
      <Slot />
    </View>
  );
}
