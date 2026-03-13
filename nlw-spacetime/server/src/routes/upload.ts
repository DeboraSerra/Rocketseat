import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { createWriteStream } from 'fs'
import { extname, resolve } from 'path'
import { pipeline } from 'stream'
import { promisify } from 'util'

const pump = promisify(pipeline)

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/upload', async (req, res) => {
    const data = await req.file({
      limits: {
        fileSize: 5_242_880, // 5mb
      },
    })

    if (!data) {
      return res.status(400).send('too big')
    }

    const mimetypeRegex = /^(image|video)\/[a-zA-Z]+/
    const isValidFormat = mimetypeRegex.test(data.mimetype)

    if (!isValidFormat) {
      return res.status(400).send('wrong format')
    }

    const fileId = randomUUID()
    const extension = extname(data.filename)
    const fileName = fileId.concat(extension)

    const writeStream = createWriteStream(
      resolve(__dirname, '../../uploads/', fileName),
    )

    await pump(data.file, writeStream)

    const fullUrl = req.protocol.concat('://').concat(req.hostname)

    const fileUrl = new URL(`/uploads/${fileName}`, fullUrl).toString()

    return { fileUrl }
  })
}
