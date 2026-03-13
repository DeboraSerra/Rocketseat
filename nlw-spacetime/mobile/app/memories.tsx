import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { api } from '../src/lib/api'

import Icon from '@expo/vector-icons/Feather'
import { Link, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import dayjs from 'dayjs'
import ptBr from 'dayjs/locale/pt-br'
import Logo from '../src/assets/logo.svg'

dayjs.locale(ptBr)

interface MemoryType {
  coverUrl: string
  excerpt: string
  id: string
  createdAt: string
}

export default function Memories() {
  const { bottom, top } = useSafeAreaInsets()
  const router = useRouter()
  const [memories, setMemories] = useState<MemoryType[]>([])

  const getMemories = async () => {
    const token = await SecureStore.getItemAsync('token')
    try {
      const { data } = await api.get('/memories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setMemories(data)
    } catch (e) {
      console.log(`memories: ${e}`)
    }
  }

  useEffect(() => {
    getMemories()
  }, [])

  const signOut = async () => {
    await SecureStore.deleteItemAsync('token')
    router.push('/')
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: bottom, paddingTop: top }}
    >
      <View className="mb-6 mt-4 flex-row items-center justify-between">
        <Logo onPress={() => router.push('/')} />
        <View className="flex-row gap-2">
          <Link href="/" asChild>
            <TouchableOpacity
              className="h-10 w-10 items-center justify-center rounded-full bg-red-500"
              onPress={signOut}
            >
              <Icon name="log-out" size={16} color="#000" />
            </TouchableOpacity>
          </Link>
          <Link href="/new" asChild>
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-green-500">
              <Icon name="plus" size={16} color="#000" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>
      <View className="space-y-10">
        {memories &&
          memories.map(({ id, excerpt, coverUrl, createdAt }) => (
            <View key={id} className="space-y-4 px-8">
              <View className="absolute -top-3 flex-row items-center gap-2">
                <View className="h-px w-5 bg-gray-50" />
                <Text className="font-body text-xs leading-relaxed text-gray-100">
                  {dayjs(createdAt).format('D[ de ]MMMM[, ]YYYY')}
                </Text>
              </View>
              <View className="space-y-4">
                <Image
                  source={{ uri: coverUrl }}
                  alt=""
                  className="aspect-video w-full rounded-lg object-cover"
                />
                <Text className="font-body text-base leading-relaxed text-gray-100">
                  {excerpt}
                </Text>
                <Link href={`/memories/${id}`}>
                  <Text className="items-center font-body text-sm text-gray-200 hover:text-gray-100">
                    Ler mais
                    <Icon name="arrow-right" size={16} color="#9e9ea0" />
                  </Text>
                </Link>
              </View>
            </View>
          ))}
      </View>
    </ScrollView>
  )
}
