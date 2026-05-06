import { QRCodeSVG } from 'qrcode.react'

interface Props {
  url: string
  roomCode: string
}

export default function QRCodeDisplay({ url, roomCode }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-md">
      <QRCodeSVG value={url} size={160} />
      <div className="text-center">
        <p className="text-sm text-gray-500">房間碼</p>
        <p className="text-4xl font-mono font-bold tracking-widest text-blue-700">{roomCode}</p>
      </div>
    </div>
  )
}
