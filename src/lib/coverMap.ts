/**
 * Maps a fractional point on a source image (0..1, 0..1) to a fractional
 * point within a differently-sized box the image fills via CSS
 * `object-fit: cover`. Needed because the envelope photo's flap/seal
 * geometry (clip-path, hinge line, seal position) was measured in the
 * source image's own pixel space, but `cover` scales and crops that image
 * differently depending on the viewport's aspect ratio — without this, the
 * flap cutout drifts out of alignment with the photo underneath on any
 * screen whose aspect ratio isn't the image's own.
 */
export function coverMapPoint(
  imgW: number,
  imgH: number,
  boxW: number,
  boxH: number,
  fx: number,
  fy: number,
): [number, number] {
  if (boxW === 0 || boxH === 0) return [fx, fy]
  const scale = Math.max(boxW / imgW, boxH / imgH)
  const renderedW = imgW * scale
  const renderedH = imgH * scale
  const offsetX = (boxW - renderedW) / 2
  const offsetY = (boxH - renderedH) / 2
  const screenX = offsetX + fx * imgW * scale
  const screenY = offsetY + fy * imgH * scale
  return [screenX / boxW, screenY / boxH]
}

/** The `cover` scale factor alone — how many screen px per source-image px. */
export function coverScale(imgW: number, imgH: number, boxW: number, boxH: number): number {
  if (imgW === 0 || imgH === 0) return 1
  return Math.max(boxW / imgW, boxH / imgH)
}
