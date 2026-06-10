import { Router, type RequestHandler } from 'express'
import { body, param, validationResult } from 'express-validator'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import { adminDb } from '../services/firebaseAdmin.js'
import type { Request, Response } from 'express'

export const memoriesRouter = Router()
memoriesRouter.use(requireAuth)

const COLLECTION = 'memories'

const MEMORY_TYPES = [
  'ItemLocation', 'LastSeen', 'HouseholdLabel',
  'Medication', 'UserPreference', 'Place', 'SafetyNote',
] as const

// Validators for POST (required fields must be present)
const createMemoryFields = [
  body('name').notEmpty().isString().trim(),
  body('description').optional().isString().trim(),
  body('memoryType').notEmpty().isIn(MEMORY_TYPES),
  body('key').notEmpty().isString().trim(),
  body('value').notEmpty().isString().trim(),
  body('assignedAgentIds').optional().isArray(),
]

// Validators for PUT (all fields optional, validated only if present)
const updateMemoryFields = [
  body('name').optional().isString().trim().notEmpty(),
  body('description').optional().isString().trim(),
  body('memoryType').optional().isIn(MEMORY_TYPES),
  body('key').optional().isString().trim().notEmpty(),
  body('value').optional().isString().trim().notEmpty(),
  body('assignedAgentIds').optional().isArray(),
]

function validate(req: Request, res: Response): boolean {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ error: 'Validation failed', details: errors.array() })
    return false
  }
  return true
}

// GET /api/memories
memoriesRouter.get('/', (async (req, res) => {
  const { userId } = req as AuthenticatedRequest
  try {
    const snapshot = await adminDb
      .collection(COLLECTION)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'asc')
      .get()
    const memories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    res.json(memories)
  } catch (err) {
    console.error('GET /memories error:', err)
    res.status(500).json({ error: 'Failed to fetch memories' })
  }
}) as RequestHandler)

// POST /api/memories
memoriesRouter.post('/', createMemoryFields, (async (req, res) => {
  if (!validate(req, res)) return
  const { userId } = req as AuthenticatedRequest
  const now = new Date().toISOString()
  const data = {
    userId,
    name: req.body.name as string,
    description: (req.body.description as string | undefined) ?? '',
    memoryType: req.body.memoryType as string,
    key: req.body.key as string,
    value: req.body.value as string,
    assignedAgentIds: (req.body.assignedAgentIds as string[] | undefined) ?? [],
    createdAt: now,
    updatedAt: now,
    lastUsedAt: null as string | null,
  }
  try {
    const ref = await adminDb.collection(COLLECTION).add(data)
    res.status(201).json({ id: ref.id, ...data })
  } catch (err) {
    console.error('POST /memories error:', err)
    res.status(500).json({ error: 'Failed to create memory' })
  }
}) as RequestHandler)

// PUT /api/memories/:id
memoriesRouter.put('/:id', param('id').isString().notEmpty(), ...updateMemoryFields, (async (req, res) => {
  if (!validate(req, res)) return
  const { userId } = req as AuthenticatedRequest
  const id = String(req.params['id'])
  try {
    const docRef = adminDb.collection(COLLECTION).doc(id)
    const doc = await docRef.get()
    if (!doc.exists || doc.data()?.userId !== userId) {
      res.status(404).json({ error: 'Memory not found' })
      return
    }
    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() }
    const allowed = ['name', 'description', 'memoryType', 'key', 'value', 'assignedAgentIds', 'lastUsedAt'] as const
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field]
    }
    await docRef.update(updates)
    const updated = await docRef.get()
    res.json({ id: updated.id, ...updated.data() })
  } catch (err) {
    console.error('PUT /memories/:id error:', err)
    res.status(500).json({ error: 'Failed to update memory' })
  }
}) as RequestHandler)

// DELETE /api/memories/:id
memoriesRouter.delete('/:id', param('id').isString().notEmpty(), (async (req, res) => {
  if (!validate(req, res)) return
  const { userId } = req as AuthenticatedRequest
  const id = String(req.params['id'])
  try {
    const docRef = adminDb.collection(COLLECTION).doc(id)
    const doc = await docRef.get()
    if (!doc.exists || doc.data()?.userId !== userId) {
      res.status(404).json({ error: 'Memory not found' })
      return
    }
    await docRef.delete()
    res.status(204).send()
  } catch (err) {
    console.error('DELETE /memories/:id error:', err)
    res.status(500).json({ error: 'Failed to delete memory' })
  }
}) as RequestHandler)
