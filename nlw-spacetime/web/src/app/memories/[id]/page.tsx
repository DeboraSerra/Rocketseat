import { api } from '@/lib/api'
import dayjs from 'dayjs'
import ptBr from 'dayjs/locale/pt-br'
import { ChevronLeft } from 'lucide-react'
import { cookies } from 'next/dist/client/components/headers'
import Image from 'next/image'
import Link from 'next/link'

dayjs.locale(ptBr)

interface MemoryType {
  coverUrl: string
  content: string
  createdAt: string
}

export const dynamicParams = true

const Memory = async ({ params }: { params: { id: string } }) => {
  const token = cookies().get('token')?.value
  const { data: memory } = await api.get(`/memories/${params.id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  const { createdAt, coverUrl, content } = memory as MemoryType
  return (
    <div className="space-y-4 px-8 py-4">
      <Link
        href="/"
        className="flex items-center gap-1 text-sm text-gray-200 hover:text-gray-100"
      >
        <ChevronLeft className="h-4 w-4" /> voltar à timeline
      </Link>
      <time className="-ml-8 flex items-center gap-2 text-sm text-gray-100 before:h-px before:w-5 before:bg-gray-50">
        {dayjs(createdAt).format('D[ de ]MMMM[, ]YYYY')}
      </time>
      <Image
        src={coverUrl}
        alt=""
        width={400}
        height={200}
        className="aspect-square w-full rounded-lg object-cover"
      />
      <p className="text-lg leading-relaxed text-gray-100">{content}</p>
    </div>
  )
}

export default Memory
