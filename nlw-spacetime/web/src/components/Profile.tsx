import { getUser } from '@/lib/auth'
import Image from 'next/image'

const Profile = () => {
  const { name, avatarUrl } = getUser()
  return (
    <div className="flex items-center gap-3 text-left">
      <Image
        src={avatarUrl}
        alt={name}
        width={40}
        height={40}
        className="h-10 w-10 rounded-full"
      />
      <p className="max-w-[280px] text-sm leading-snug">
        {name}
        <a
          href="/api/auth/logout"
          className="block text-red-400 underline transition-colors hover:text-red-300"
        >
          Quero sair
        </a>
      </p>
    </div>
  )
}

export default Profile
