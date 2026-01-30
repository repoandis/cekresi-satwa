import { Client } from 'minio'

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || '192.168.0.76',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.NODE_ENV === 'production',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123'
})

export const storage = {
  uploadFile: async (bucket: string, objectName: string, buffer: Buffer, metaData?: any) => {
    return await minioClient.putObject(bucket, objectName, buffer, metaData)
  },
  
  getFile: async (bucket: string, objectName: string) => {
    return await minioClient.getObject(bucket, objectName)
  },
  
  getFileUrl: (bucket: string, objectName: string) => {
    const endpoint = process.env.MINIO_ENDPOINT || '192.168.0.76'
    const port = process.env.MINIO_PORT || '9000'
    return `http://${endpoint}:${port}/${bucket}/${objectName}`
  },
  
  deleteFile: async (bucket: string, objectName: string) => {
    return await minioClient.removeObject(bucket, objectName)
  },
  
  listFiles: async (bucket: string, prefix?: string) => {
    const stream = minioClient.listObjects(bucket, prefix, true)
    const files: any[] = []
    
    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => files.push(obj))
      stream.on('error', reject)
      stream.on('end', () => resolve(files))
    })
  }
}

export default minioClient
