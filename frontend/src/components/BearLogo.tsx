interface Props {
  size?: number
}

export default function BearLogo({ size = 48 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 左耳 */}
      <circle cx="22" cy="25" r="14" fill="#1a1a1a" />
      <circle cx="22" cy="25" r="9" fill="#3d2a1a" />
      {/* 右耳 */}
      <circle cx="78" cy="25" r="14" fill="#1a1a1a" />
      <circle cx="78" cy="25" r="9" fill="#3d2a1a" />
      {/* 臉 */}
      <ellipse cx="50" cy="57" rx="38" ry="36" fill="#1a1a1a" />
      {/* 月牙胸斑（台灣黑熊特徵） */}
      <path d="M 34 78 Q 50 68 66 78 Q 58 90 42 90 Z" fill="#f5e6c8" />
      {/* 眼白 */}
      <circle cx="36" cy="50" r="10" fill="white" />
      <circle cx="64" cy="50" r="10" fill="white" />
      {/* 眼珠 */}
      <circle cx="38" cy="51" r="6" fill="#1a1a1a" />
      <circle cx="62" cy="51" r="6" fill="#1a1a1a" />
      {/* 眼神亮點 */}
      <circle cx="40" cy="49" r="2" fill="white" />
      <circle cx="64" cy="49" r="2" fill="white" />
      {/* 鼻子 */}
      <ellipse cx="50" cy="64" rx="7" ry="5" fill="#3d2a1a" />
      {/* 嘴巴 */}
      <path d="M 44 68 Q 50 75 56 68" stroke="#3d2a1a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* 腮紅 */}
      <ellipse cx="28" cy="64" rx="7" ry="4" fill="#ff9999" opacity="0.5" />
      <ellipse cx="72" cy="64" rx="7" ry="4" fill="#ff9999" opacity="0.5" />
    </svg>
  )
}
