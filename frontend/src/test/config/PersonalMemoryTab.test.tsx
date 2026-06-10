import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PersonalMemoryTab from '@/components/config/tabs/PersonalMemoryTab'
import { DEFAULT_TRIGGER_CONFIG } from '@/services/triggerConfig'

const DEFAULT_PROPS = {
  onAddItem: vi.fn(),
  onEditItem: vi.fn(),
  onDeleteItem: vi.fn(),
  onDeleteCategory: vi.fn(),
  onAddCategory: vi.fn(),
  triggerConfig: DEFAULT_TRIGGER_CONFIG,
  onUpdateTriggerConfig: vi.fn(),
}

const mockCategories = [
  {
    id: 'cat-1',
    name: 'Location',
    items: [
      {
        id: 'item-1', userId: 'u1', name: 'Location', description: '',
        memoryType: 'Place' as const, key: 'Library', value: '3rd floor',
        assignedAgentIds: [], createdAt: '', updatedAt: '', lastUsedAt: null,
      },
    ],
  },
]

describe('PersonalMemoryTab', () => {
  it('renders category name', () => {
    render(<PersonalMemoryTab {...DEFAULT_PROPS} categories={mockCategories} />)
    expect(screen.getByText('Location')).toBeInTheDocument()
  })

  it('renders key:value item', () => {
    render(<PersonalMemoryTab {...DEFAULT_PROPS} categories={mockCategories} />)
    expect(screen.getByText('Library')).toBeInTheDocument()
    expect(screen.getByText('3rd floor')).toBeInTheDocument()
  })

  it('filters out placeholder items (key=note, value=Add items below)', () => {
    const categoriesWithPlaceholder = [
      {
        id: 'cat-2',
        name: 'Kitchen',
        items: [
          {
            id: 'item-ph', userId: 'u1', name: 'Kitchen', description: '',
            memoryType: 'ItemLocation' as const, key: 'note', value: 'Add items below',
            assignedAgentIds: [], createdAt: '', updatedAt: '', lastUsedAt: null,
          },
        ],
      },
    ]
    render(<PersonalMemoryTab {...DEFAULT_PROPS} categories={categoriesWithPlaceholder} />)
    expect(screen.queryByText('Add items below')).not.toBeInTheDocument()
  })

  it('calls onDeleteItem when trash icon clicked', () => {
    const onDeleteItem = vi.fn()
    render(<PersonalMemoryTab {...DEFAULT_PROPS} categories={mockCategories} onDeleteItem={onDeleteItem} />)
    fireEvent.click(screen.getByRole('button', { name: /delete library/i }))
    expect(onDeleteItem).toHaveBeenCalledWith('item-1')
  })

  it('shows inline form when + Add New Data clicked', () => {
    render(<PersonalMemoryTab {...DEFAULT_PROPS} categories={mockCategories} />)
    fireEvent.click(screen.getByText('+ Add New Data'))
    expect(screen.getByPlaceholderText('Key (e.g. glasses)')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Value (e.g. on the nightstand)')).toBeInTheDocument()
  })

  it('calls onAddItem with category name (not id) plus key and value', () => {
    const onAddItem = vi.fn()
    render(<PersonalMemoryTab {...DEFAULT_PROPS} categories={mockCategories} onAddItem={onAddItem} />)
    fireEvent.click(screen.getByText('+ Add New Data'))
    fireEvent.change(screen.getByPlaceholderText('Key (e.g. glasses)'), { target: { value: 'Pool' } })
    fireEvent.change(screen.getByPlaceholderText('Value (e.g. on the nightstand)'), { target: { value: 'Farmway LRT' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    // Uses cat.name ('Location'), not cat.id ('cat-1')
    expect(onAddItem).toHaveBeenCalledWith('Location', 'Pool', 'Farmway LRT')
  })

  it('shows add category input when + Add Category clicked', () => {
    render(<PersonalMemoryTab {...DEFAULT_PROPS} categories={[]} />)
    fireEvent.click(screen.getByText('+ Add Category'))
    expect(screen.getByPlaceholderText('Category name (e.g. Kitchen)')).toBeInTheDocument()
  })

  it('calls onAddCategory and hides form on Create', () => {
    const onAddCategory = vi.fn()
    render(<PersonalMemoryTab {...DEFAULT_PROPS} categories={[]} onAddCategory={onAddCategory} />)
    fireEvent.click(screen.getByText('+ Add Category'))
    fireEvent.change(screen.getByPlaceholderText('Category name (e.g. Kitchen)'), { target: { value: 'Kitchen' } })
    fireEvent.click(screen.getByRole('button', { name: /create/i }))
    expect(onAddCategory).toHaveBeenCalledWith('Kitchen')
    expect(screen.queryByPlaceholderText('Category name (e.g. Kitchen)')).not.toBeInTheDocument()
  })

  it('renders Voice Memory Triggers section', () => {
    render(<PersonalMemoryTab {...DEFAULT_PROPS} categories={[]} />)
    expect(screen.getByText('Voice Memory Triggers')).toBeInTheDocument()
  })

  it('shows trigger phrases from config', () => {
    render(<PersonalMemoryTab {...DEFAULT_PROPS} categories={[]} />)
    expect(screen.getByText(/"remember that"/i)).toBeInTheDocument()
  })

  it('calls onUpdateTriggerConfig when toggle clicked', () => {
    const onUpdateTriggerConfig = vi.fn()
    render(<PersonalMemoryTab {...DEFAULT_PROPS} categories={[]} onUpdateTriggerConfig={onUpdateTriggerConfig} />)
    fireEvent.click(screen.getByRole('switch'))
    expect(onUpdateTriggerConfig).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    )
  })
})
