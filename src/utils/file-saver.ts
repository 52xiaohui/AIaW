import { Filesystem } from '@capacitor/filesystem'
import { IsCapacitor } from 'src/utils/platform-api'
import { exportFile } from 'quasar'

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
      // 将 data 转换为字符串
      let stringData: string
      
      if (data instanceof ArrayBuffer) {
        stringData = arrayBufferToBase64(data)
      } else if (data instanceof Blob) {
        stringData = await blobToBase64(data)
      } else {
        stringData = data
      }
      
      // 使用 Capacitor Filesystem API 保存文件
      const result = await Filesystem.writeFile({
        path: fileName,
        data: stringData,
        directory: 'DOCUMENTS',
        encoding: 'utf8',
        recursive: true
      })
      
      return { success: true, path: result.uri }
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
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

/**
 * ArrayBuffer 转 Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  
  return window.btoa(binary)
}

/**
 * Blob 转 Base64
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      // 去除 "data:xxx;base64," 前缀
      const base64 = base64String.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}


