import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Toggle from '@/components/ui/Toggle'

describe('Toggle', () => {
  it('renders label', () => {
    render(<Toggle checked={false} onChange={vi.fn()} label="Enable search" />)
    expect(screen.getByText('Enable search')).toBeInTheDocument()
  })

  it('reflects checked state via aria-checked', () => {
    render(<Toggle checked={true} onChange={vi.fn()} label="Toggle" />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('reflects unchecked state via aria-checked', () => {
    render(<Toggle checked={false} onChange={vi.fn()} label="Toggle" />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onChange with toggled value on click', () => {
    const onChange = vi.fn()
    render(<Toggle checked={false} onChange={onChange} label="Toggle" />)
    fireEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('renders description when provided', () => {
    render(<Toggle checked={false} onChange={vi.fn()} label="Label" description="Some description" />)
    expect(screen.getByText('Some description')).toBeInTheDocument()
  })
})
