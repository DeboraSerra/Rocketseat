'use client'

import { api } from '@/lib/api'
import { ptBR } from 'date-fns/locale'
import dayjs from 'dayjs'
import Cookie from 'js-cookie'
import { Calendar, Camera } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import MediaPicker from './MediaPicker'
import ptBr from 'dayjs/locale/pt-br'

dayjs.locale(ptBr)

const MemoryForm = () => {
  const router = useRouter()
  const [date, setDate] = useState(new Date())
  const [showPicker, setShowPicker] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    const fileToUpload = formData.get('coverUrl')
    let coverUrl = ''
    if (fileToUpload) {
      const uploadFormData = new FormData()
      uploadFormData.set('file', fileToUpload)
      const { data } = await api.post('/upload', uploadFormData)
      coverUrl = data.fileUrl
    }
    await api.post(
      '/memories',
      {
        coverUrl,
        content: formData.get('content'),
        isPublic: formData.get('isPublic'),
        createdAt: date,
      },
      {
        headers: {
          Authorization: `Bearer ${Cookie.get('token')}`,
        },
      },
    )
    router.push('/')
  }

  return (
    <form className="flex flex-1 flex-col gap-2" onSubmit={handleSubmit}>
      <div className="flex items-center gap-4">
        <time className="-ml-8 flex items-center gap-2 text-sm text-gray-100 before:h-px before:w-5 before:bg-gray-50">
          {dayjs(date).format('D[ de ]MMMM[, ]YYYY')}
          <Calendar
            onClick={() => setShowPicker(!showPicker)}
            className="cursor-pointer"
          />
          {showPicker && (
            <div className="absolute top-[128px] rounded-lg bg-gray-950">
              <DayPicker
                selected={date}
                onDayClick={(val: any) => {
                  setDate(val)
                  setShowPicker(false)
                }}
                locale={ptBR}
                defaultMonth={new Date()}
                initialFocus
              />
            </div>
          )}
        </time>
        <label
          htmlFor="media"
          className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-200 hover:text-gray-100"
        >
          <Camera className="h-4 w-4" />
          Anexar mídia
        </label>
        <label
          htmlFor="isPublic"
          className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-200 hover:text-gray-100"
        >
          <input
            type="checkbox"
            name="isPublic"
            id="isPublic"
            className="h-4 w-4 rounded border-gray-700 bg-gray-700 text-purple-500"
          />
          Tornar memória pública
        </label>
      </div>
      <MediaPicker />
      <textarea
        name="content"
        id="content"
        placeholder="Fique livre para adicionar fotos, vídeos e relatos sobre essa experiência que você quer lembrar para sempre."
        spellCheck={false}
        className="w-full flex-1 resize-none rounded border-0 bg-transparent p-0 text-lg leading-relaxed text-gray-100 placeholder:text-gray-400 focus:ring-0"
      />
      <button
        type="submit"
        className="inline-block self-end rounded-3xl bg-green-500 px-5 py-3 font-alt text-lg uppercase leading-none text-black hover:bg-green-600"
      >
        Salvar
      </button>
    </form>
  )
}

export default MemoryForm
