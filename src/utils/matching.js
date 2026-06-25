import { runMatching } from './api'

export async function assignToCircles() {
  try {
    return await runMatching()
  } catch(e) {
    console.error('Matching error:', e)
  }
}