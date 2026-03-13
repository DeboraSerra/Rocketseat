import * as SecureStore from 'expo-secure-store'
import { StatusBar } from 'expo-status-bar'
import { styled } from 'nativewind'
import { ImageBackground } from 'react-native'

import { BaiJamjuree_700Bold } from '@expo-google-fonts/bai-jamjuree'
import {
  Roboto_400Regular,
  Roboto_700Bold,
  useFonts,
} from '@expo-google-fonts/roboto'

import { SplashScreen, Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import blurBg from '../src/assets/luz.png'
import Stripes from '../src/assets/stripes.svg'

const StyledStripes = styled(Stripes)

export default function Layout() {
  const [isAuth, setIsAuth] = useState<null | boolean>(null)

  useEffect(() => {
    SecureStore.getItemAsync('token').then((token) => {
      setIsAuth(!!token)
    })
  }, [])

  const [hasLoadedFronts] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
    BaiJamjuree_700Bold,
  })

  if (!hasLoadedFronts) return <SplashScreen />

  return (
    <ImageBackground
      source={blurBg}
      imageStyle={{ position: 'absolute', left: '-100%' }}
      className="relative flex-1 bg-gray-900"
    >
      <StyledStripes className="absolute left-1" />
      <StatusBar style="light" backgroundColor="black" />
      {/* <Slot /> */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" redirect={isAuth} />
        <Stack.Screen name="memories" />
        <Stack.Screen name="new" />
      </Stack>
    </ImageBackground>
  )
}
