/**
 * api.js — axios wrapper for the FastAPI backend.
 * All calls go through /api proxy → http://localhost:8000
 */
import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  timeout: 120_000, // 2 min — SD inference can be slow on CPU/MPS
})

/**
 * Fetch health status of the backend.
 * @returns {{ status, model_loaded, device, mock_mode }}
 */
export async function getHealth() {
  const { data } = await client.get('/health')
  return data
}

/**
 * Fetch available cartoon styles.
 * @returns {Array<{ key, label, description, emoji }>}
 */
export async function getStyles() {
  const { data } = await client.get('/styles')
  return data
}

/**
 * Cartoonize an image.
 * @param {File}   imageFile     - The uploaded image file
 * @param {string} styleKey      - Style preset key (e.g. "disney")
 * @param {object} [options]     - Optional overrides
 * @param {number} [options.strength=0.72]
 * @param {number} [options.guidanceScale=7.5]
 * @param {number} [options.numSteps=30]
 * @param {Function} [onProgress] - axios upload progress callback
 * @returns {string} Object URL for the result JPEG blob
 */
export async function cartoonize(imageFile, styleKey, options = {}, onProgress) {
  const {
    strength = 0.72,
    guidanceScale = 7.5,
    numSteps = 30,
  } = options

  const form = new FormData()
  form.append('image', imageFile)
  form.append('style', styleKey)
  form.append('strength', String(strength))
  form.append('guidance_scale', String(guidanceScale))
  form.append('num_steps', String(numSteps))

  const response = await client.post('/cartoonize', form, {
    responseType: 'blob',
    onUploadProgress: onProgress,
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return URL.createObjectURL(response.data)
}
