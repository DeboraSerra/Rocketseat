import Image from 'next/image'
import logo from '../assets/logo.svg'
import Link from 'next/link'

const Hero = () => {
  return (
    <div className="space-y-5">
      <Image src={logo} alt="logo" width={160} height={48} />
      <div className="max-w-[420px] space-y-1">
        <h1 className="text-5xl font-bold leading-tight text-gray-50">
          Sua cápsula do tempo
        </h1>
        <p className="font-light leading-relaxed">
          Colecione momentos marcantes da sua jornada e compartilhe (se quiser)
          com o mundo!
        </p>
      </div>
      <Link
        href="/memories/new"
        className="inline-block rounded-3xl bg-green-500 px-5 py-3 font-alt text-lg uppercase leading-none text-black hover:bg-green-600"
      >
        CADASTRAR LEMBRANçA
      </Link>
    </div>
  )
}

export default Hero
