import Icon from '@expo/vector-icons/Feather'
import {
  Image,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import * as ImagePicker from 'expo-image-picker'
import * as SecureStore from 'expo-secure-store'

import DateTimePicker from '@react-native-community/datetimepicker'
import dayjs from 'dayjs'
import { Link, useRouter } from 'expo-router'
import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Logo from '../src/assets/logo.svg'
import { api } from '../src/lib/api'

export default function NewMemories() {
  const router = useRouter()

  const { bottom, top } = useSafeAreaInsets()
  const [isPublic, setIsPublic] = useState(false)
  const [content, setContent] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [date, setDate] = useState<Date | null>(new Date())
  const [show, setShow] = useState(false)

  const dateChange = (e: any, selectedDate: Date) => {
    setShow(false)
    setDate(selectedDate)
  }

  const handleSubmit = async () => {
    const token = await SecureStore.getItemAsync('token')
    let coverUrl = ''
    if (preview) {
      const uploadFormData = new FormData()
      uploadFormData.append('file', {
        name: 'image.jpg',
        uri: preview,
        type: 'image/jpeg',
      } as any)

      try {
        const { data } = await api.post('/upload', uploadFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        coverUrl = data.fileUrl
      } catch (e) {
        console.log(`new (line58): ${e}`)
      }
    }
    try {
      await api.post(
        '/memories',
        {
          coverUrl,
          content,
          isPublic,
          createdAt: date ?? new Date(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
    } catch (e) {
      console.log(`new (line77): ${e}`)
    }
    router.push('/memories')
  }

  const openImgPicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      })
      if (!result.canceled) {
        setPreview(result.assets[0].uri)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const showMode = (currentMode) => {
    if (Platform.OS === 'android') {
      setShow(false)
    }
    setShow(currentMode)
  }

  return (
    <ScrollView
      className="flex-1 px-8"
      contentContainerStyle={{ paddingBottom: bottom, paddingTop: top }}
    >
      <View className="mt-4 flex-row items-center justify-between">
        <Logo />
        <Link href="/memories" asChild>
          <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-purple-500">
            <Icon name="arrow-left" size={16} color="#fff" />
          </TouchableOpacity>
        </Link>
      </View>
      <View className="mt-6 space-y-6">
        <TouchableOpacity
          activeOpacity={0.7}
          className="flex-row justify-between"
          onPress={() => showMode('date')}
        >
          <View className="flex-row items-center gap-2">
            <View className="h-px w-5 bg-gray-50" />
            <Text className="font-body text-xs leading-relaxed text-gray-100">
              {dayjs(date).format('D[ de ]MMMM[, ]YYYY')}
            </Text>
          </View>
          <Icon name="calendar" color="#fff" size={24} />
          {show && (
            <DateTimePicker value={date} mode="date" onChange={dateChange} />
          )}
        </TouchableOpacity>
        <View className="flex-row items-center gap-2">
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            thumbColor={isPublic ? '#9b79ea' : '#9e9ea0'}
            trackColor={{ false: '#767577', true: '#372560' }}
          />
          <Text className="font-body text-base text-gray-200">
            Tornar memoria publica
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          className="h-32 justify-center rounded-lg border border-dashed border-gray-500 bg-black/20"
          onPress={openImgPicker}
        >
          {preview ? (
            <Image
              source={{ uri: preview }}
              alt=""
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <View className="flex-row items-center justify-center gap-2">
              <Icon name="image" color="#fff" />
              <Text className="font-body text-sm text-gray-200">
                Adicionar foto ou video de capa
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          multiline
          className="p-0 font-body text-lg text-gray-50"
          placeholder="Fique livre para adicionar fotos, vídeos e relatos sobre essa experiência que você quer lembrar para sempre."
          placeholderTextColor="#56565a"
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
        />
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleSubmit}
        className="items-center self-end rounded-3xl bg-green-500 px-5 py-3"
      >
        <Text className="font-alt text-sm text-black">SALVAR</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
