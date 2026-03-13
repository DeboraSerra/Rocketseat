'use client'

import { ChangeEvent, useState } from 'react'

const MediaPicker = () => {
  const [preview, setPreview] = useState<string | null>(null)

  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const previewUrl = URL.createObjectURL(files[0])
    setPreview(previewUrl)
  }

  return (
    <>
      <input
        type="file"
        id="media"
        name="coverUrl"
        className="invisible h-0 w-0"
        onChange={onFileSelect}
        accept="image/*"
      />
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt=""
          className="aspect-video w-full rounded-lg object-cover"
        />
      )}
    </>
  )
}

export default MediaPicker
