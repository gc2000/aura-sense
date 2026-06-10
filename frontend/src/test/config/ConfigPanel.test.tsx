import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ConfigPanel from '@/components/config/ConfigPanel'
import { mockAuraConfig, mockSubAgents, mockMemoryCategories } from '@/data/mockData'
import { DEFAULT_TRIGGER_CONFIG } from '@/services/triggerConfig'

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  auraConfig: mockAuraConfig,
  subAgents: mockSubAgents,
  memoryCategories: mockMemoryCategories,
  onSaveAura: vi.fn(),
  onSaveSubAgent: vi.fn(),
  onDeleteSubAgent: vi.fn(),
  onAddSubAgent: vi.fn(),
  onAddMemoryItem: vi.fn(),
  onEditMemoryItem: vi.fn(),
  onDeleteMemoryItem: vi.fn(),
  onDeleteMemoryCategory: vi.fn(),
  onAddMemoryCategory: vi.fn(),
  triggerConfig: DEFAULT_TRIGGER_CONFIG,
  onUpdateTriggerConfig: vi.fn(),
}

describe('ConfigPanel', () => {
  it('does not render when closed', () => {
    render(<ConfigPanel {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders when open', () => {
    render(<ConfigPanel {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Config Panel')).toBeInTheDocument()
  })

  it('renders all 4 tabs', () => {
    render(<ConfigPanel {...defaultProps} />)
    expect(screen.getByRole('tab', { name: /general/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /^aura$/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /sub-agents/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /^memory$/i })).toBeInTheDocument()
  })

  it('General tab is active by default', () => {
    render(<ConfigPanel {...defaultProps} />)
    expect(screen.getByRole('tab', { name: /general/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('switches to Aura tab on click', () => {
    render(<ConfigPanel {...defaultProps} />)
    fireEvent.click(screen.getByRole('tab', { name: /^aura$/i }))
    expect(screen.getByRole('tab', { name: /^aura$/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Aura Core Orchestrator')).toBeInTheDocument()
  })

  it('switches to Sub-Agents tab on click', () => {
    render(<ConfigPanel {...defaultProps} />)
    fireEvent.click(screen.getByRole('tab', { name: /sub-agents/i }))
    expect(screen.getByText('Sub-Agent Management')).toBeInTheDocument()
  })

  it('switches to Memory tab on click', () => {
    render(<ConfigPanel {...defaultProps} />)
    fireEvent.click(screen.getByRole('tab', { name: /^memory$/i }))
    expect(screen.getByText('Memory Categories')).toBeInTheDocument()
  })

  it('calls onClose when Close button clicked', () => {
    const onClose = vi.fn()
    render(<ConfigPanel {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /close config panel/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
