import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from '../src/App'

describe('App', () => {
  it('renders loading state initially', () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}))

    render(<App />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders health status after API call', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: () => Promise.resolve({ message: 'OK' }),
    } as Response)

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Health status: OK')).toBeInTheDocument()
    })
  })
})
