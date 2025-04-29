import { Filesystem, Directory, Encoding } from '@capacitor/filesystem' // Imported Encoding
import { IsCapacitor } from 'src/utils/platform-api'
import { exportFile } from 'quasar'
import { isPlatform } from '@ionic/vue'

/**
 * 保存文件到设备存储
 * @param fileName 文件名
 * @param data 文件数据（可以是字符串、ArrayBuffer 或 Blob）
 * @param mimeType 文件MIME类型（可选）
 * @returns Promise 返回保存结果
 */
export async function saveFile(
  fileName: string,
  data: string | ArrayBuffer | Blob,
  mimeType?: string
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    // 检查是否在原生平台（安卓/iOS）
    if (IsCapacitor) {
      const isAndroid = isPlatform('android')
      // 准备文件数据，避免不必要的base64转换
      let fileData: string
      const encoding: Encoding = Encoding.UTF8 // Changed type to Encoding and value to Encoding.UTF8

      if (data instanceof ArrayBuffer || data instanceof Blob) {
        // 对于二进制数据，使用Blob对象获取原始数据
        if (data instanceof ArrayBuffer) {
          // 转换ArrayBuffer为Blob
          const blob = new Blob([data], { type: mimeType || 'application/octet-stream' })
          // 使用文件读取器获取原始数据
          fileData = await readBlobAsText(blob)
        } else {
          // 直接读取Blob
          fileData = await readBlobAsText(data)
        }
      } else {
        // 处理文本内容
        fileData = data
      }

      // 尝试不同的目录保存文件 (Android 优先使用 Documents 或 External)
      if (isAndroid) {
        try {
          // 1. 尝试 Documents 目录
          const result = await Filesystem.writeFile({
            path: fileName,
            data: fileData,
            directory: Directory.Documents,
            encoding,
            recursive: true
          })
          return { success: true, path: result.uri }
        } catch (docsError) {
          try {
            // 2. 尝试 External 目录
            const result = await Filesystem.writeFile({
              path: fileName,
              data: fileData,
              directory: Directory.External,
              encoding,
              recursive: true
            })
            return { success: true, path: result.uri }
          } catch (externalError) {
            try {
              // 3. 尝试 Data 目录
              const result = await Filesystem.writeFile({
                path: fileName,
                data: fileData,
                directory: Directory.Data,
                encoding,
                recursive: true
              })
              return { success: true, path: result.uri }
            } catch (dataError) {
              // Removed unnecessary try...catch wrapper around Cache directory write
              // 4. 尝试 Cache 目录 (最后手段)
              const result = await Filesystem.writeFile({
                path: fileName,
                data: fileData,
                directory: Directory.Cache,
                encoding,
                recursive: true
              })
              return { success: true, path: result.uri }
              // The outer catch block will handle errors if Cache write fails
            }
          }
        }
      } else {
        // 非 Android 平台 (iOS 或 Web) 的原始逻辑
        try {
          // 首先尝试使用应用内部缓存目录 (iOS 通常是 Cache 或 Data)
          const result = await Filesystem.writeFile({
            path: fileName,
            data: fileData,
            directory: Directory.Cache, // iOS 默认或常用
            encoding,
            recursive: true
          })
          return { success: true, path: result.uri }
        } catch (innerError) {
          // 如果缓存目录失败，尝试应用数据目录
          // Removed unnecessary try...catch wrapper around Data directory write
          const result = await Filesystem.writeFile({
            path: fileName,
            data: fileData,
            directory: Directory.Data,
            encoding,
            recursive: true
          })
          return { success: true, path: result.uri }
          // The outer catch block will handle errors if Data write fails
        }
      }
    } else {
      // 非原生平台，使用浏览器的保存方法
      if (typeof data === 'string') {
        exportFile(fileName, data)
      } else if (data instanceof ArrayBuffer || data instanceof Blob) {
        exportFile(fileName, data)
      }
      return { success: true }
    }
  } catch (error) {
    console.error('保存文件失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * 读取Blob为文本内容
 * 避免使用base64编码，保持原始数据格式
 */
function readBlobAsText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.onerror = () => {
      reject(new Error('读取文件数据失败'))
    }
    reader.readAsText(blob)
  })
}

/**
 * 检查或请求文件保存权限
 * @returns Promise 返回是否有权限
 */
export async function checkFilePermissions(): Promise<boolean> {
  try {
    // 首先尝试Cache目录，这通常不需要特别权限
    await Filesystem.writeFile({
      path: '.temp-permission-check',
      data: 'temp',
      directory: Directory.Cache
    })

    await Filesystem.deleteFile({
      path: '.temp-permission-check',
      directory: Directory.Cache
    })

    return true
  } catch (error) {
    console.error('文件权限检查失败:', error)
    return false
  }
}
