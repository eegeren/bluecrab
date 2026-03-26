import Image from 'next/image'

interface Props {
  src?: string
  username?: string
  size?: number
  className?: string
}

export default function Avatar({ src, username = '?', size = 40, className = '' }: Props) {
  const initials = username.slice(0, 2).toUpperCase()
  const colors = [
    'bg-blue-500', 'bg-blue-500', 'bg-emerald-500',
    'bg-rose-500', 'bg-amber-500', 'bg-cyan-500',
  ]
  const color = colors[username.charCodeAt(0) % colors.length]

  if (src) {
    return (
      <Image
        src={src}
        alt={username}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className={`${color} ${className} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  )
}
