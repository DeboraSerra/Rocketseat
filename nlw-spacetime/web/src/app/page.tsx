import EmptyMemories from '@/components/EmptyMemories'
import { api } from '@/lib/api'
import dayjs from 'dayjs'
import ptBr from 'dayjs/locale/pt-br'
import { ArrowRight } from 'lucide-react'
import { cookies } from 'next/dist/client/components/headers'
import Image from 'next/image'
import Link from 'next/link'

dayjs.locale(ptBr)

interface MemoryType {
  coverUrl: string
  excerpt: string
  id: string
  createdAt: string
}

export default async function Home() {
  const isAuthenticated = cookies().has('token')

  if (!isAuthenticated) return <EmptyMemories />

  const { data: memories } = await api.get('/memories', {
    headers: {
      Authorization: `Bearer ${cookies().get('token')?.value}`,
    },
  })

  if (memories.length === 0) return <EmptyMemories />

  return (
    <div className="flex flex-col gap-10 p-8">
      {(memories as MemoryType[]).map(
        ({ coverUrl, excerpt, id, createdAt }) => (
          <div key={id} className="space-y-4">
            <time className="-ml-8 flex items-center gap-2 text-sm text-gray-100 before:h-px before:w-5 before:bg-gray-50">
              {dayjs(createdAt).format('D[ de ]MMMM[, ]YYYY')}
            </time>
            <Image
              src={coverUrl}
              alt=""
              width={400}
              height={200}
              className="aspect-video w-full rounded-lg object-cover"
            />
            <p className="text-lg leading-relaxed text-gray-100">{excerpt}</p>
            <Link
              href={`/memories/${id}`}
              className="flex items-center gap-2 text-sm text-gray-200 hover:text-gray-100"
            >
              Ler mais <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ),
      )}
    </div>
  )
}
