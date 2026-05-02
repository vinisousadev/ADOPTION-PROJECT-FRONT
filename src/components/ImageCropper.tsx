import { useState } from 'react'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'

type ImageCropperProps = {
  imageSrc: string
  onCancel: () => void
  onConfirm: (croppedAreaPixels: Area) => void
}

export function ImageCropper({
  imageSrc,
  onCancel,
  onConfirm,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  return (
    <div className="cropper-panel">
      <div className="cropper-frame">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={4 / 3}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
        />
      </div>

      <div className="cropper-controls">
        <label htmlFor="photoZoom">Zoom</label>
        <input
          id="photoZoom"
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
        />
      </div>

      <div className="actions">
        <button
          className="button"
          type="button"
          onClick={() => {
            if (croppedAreaPixels) {
              onConfirm(croppedAreaPixels)
            }
          }}
        >
          Usar recorte
        </button>
        <button className="button button--secondary" type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  )
}
