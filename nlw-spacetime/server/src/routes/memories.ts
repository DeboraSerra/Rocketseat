import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import prisma from '../lib/prisma'

export async function memoriesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (req) => {
    await req.jwtVerify()
  })
  app.get('/memories', async (req) => {
    const memories = await prisma.memory.findMany({
      where: {
        userId: req.user.sub,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        coverUrl: true,
        content: true,
        id: true,
        createdAt: true,
      },
    })
    return memories.map(({ id, content, coverUrl, createdAt }) => {
      return {
        id,
        coverUrl,
        excerpt: content.substring(0, 115).concat('...'),
        createdAt,
      }
    })
  })

  app.get('/memories/:id', async (req, res) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(req.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (memory.userId !== req.user.sub && !memory.isPublic) {
      return res.status(401).send()
    }
    return memory
  })

  app.post('/memories', async (req) => {
    const { user } = req
    const bodySchema = z.object({
      coverUrl: z.string(),
      content: z.string(),
      isPublic: z.coerce.boolean().default(false),
      createdAt: z.string().datetime().default(new Date().toLocaleDateString()),
    })
    const { coverUrl, content, isPublic, createdAt } = bodySchema.parse(
      req.body,
    )
    const memory = await prisma.memory.create({
      data: {
        userId: user.sub,
        coverUrl,
        content,
        isPublic,
        createdAt,
      },
    })
    return memory
  })

  app.put('/memories/:id', async (req, res) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(req.params)

    const bodySchema = z.object({
      coverUrl: z.string(),
      content: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })
    const { coverUrl, content, isPublic } = bodySchema.parse(req.body)

    let memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (memory.userId !== req.user.sub) {
      return res.status(401).send()
    }

    memory = await prisma.memory.update({
      data: {
        coverUrl,
        content,
        isPublic,
      },
      where: {
        id,
      },
    })
    return memory
  })

  app.delete('/memories/:id', async (req, res) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(req.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (memory.userId !== req.user.sub) {
      return res.status(401).send()
    }

    await prisma.memory.delete({
      where: {
        id,
      },
    })
  })
}
