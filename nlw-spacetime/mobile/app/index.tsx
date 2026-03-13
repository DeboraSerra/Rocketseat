import { makeRedirectUri, useAuthRequest } from 'expo-auth-session'
import { useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { useEffect } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { BaiJamjuree_700Bold } from '@expo-google-fonts/bai-jamjuree'
import {
  Roboto_400Regular,
  Roboto_700Bold,
  useFonts,
} from '@expo-google-fonts/roboto'

import Logo from '../src/assets/logo.svg'
import { api } from '../src/lib/api'

const saveInfo = async (key: string, value: string) => {
  await SecureStore.setItemAsync(key, value)
}

const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint:
    'https://github.com/settings/connections/applications/d6e76ea215e073538949',
}

export default function App() {
  const router = useRouter()
  const [hasLoadedFronts] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
    BaiJamjuree_700Bold,
  })

  const [, res, signInWithGithub] = useAuthRequest(
    {
      clientId: 'd6e76ea215e073538949',
      scopes: ['identity'],
      redirectUri: makeRedirectUri({
        scheme: 'nlwspacetime',
      }),
    },
    discovery,
  )

  const getToken = async (code: string) => {
    try {
      const response = await api.post('/register', { code })
      const { token } = response.data
      await saveInfo('token', token)
      router.push('/memories')
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (res && res.type === 'success') {
      const { code } = res.params
      getToken(code)
    }
  }, [res])

  if (!hasLoadedFronts) return null

  return (
    <View className="flex-1 items-center px-4 py-8">
      <View className="flex-1 items-center justify-center gap-6">
        <Logo />
        <View className="space-y-2">
          <Text className="text-center font-title text-2xl text-gray-50">
            Sua cápsula do tempo
          </Text>
          <Text className="text-center font-body text-base leading-relaxed text-gray-100">
            Colecione momentos marcantes da sua jornada e compartilhe (se
            quiser) com o mundo!
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          className="rounded-3xl bg-green-500 px-5 py-3"
          onPress={() => signInWithGithub()}
        >
          <Text className="font-alt text-sm text-black">
            COMEÇAR A CADASTRAR
          </Text>
        </TouchableOpacity>
      </View>
      <Text className="font-body text-xs leading-relaxed text-gray-200">
        Feito com 💜 no NLW da{' '}
        <Text className="text-gray-200 underline">Rocketseat</Text>
      </Text>
    </View>
  )
}
