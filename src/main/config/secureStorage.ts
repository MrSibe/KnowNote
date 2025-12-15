/**
 * 安全存储工具
 * 使用 Electron safeStorage API 加密敏感数据
 */

import { safeStorage } from 'electron'
import Logger from '../../shared/utils/logger'

/**
 * 加密文本数据
 * @param plainText 明文
 * @returns Base64 编码的加密数据，如果加密失败返回 null
 */
export function encryptString(plainText: string): string | null {
  try {
    // 检查加密是否可用
    if (!safeStorage.isEncryptionAvailable()) {
      Logger.warn('SecureStorage', 'Encryption not available on this platform')
      return null
    }

    const encrypted = safeStorage.encryptString(plainText)
    return encrypted.toString('base64')
  } catch (error) {
    Logger.error('SecureStorage', 'Failed to encrypt string:', error)
    return null
  }
}

/**
 * 解密文本数据
 * @param encryptedBase64 Base64 编码的加密数据
 * @returns 解密后的明文，如果解密失败返回 null
 */
export function decryptString(encryptedBase64: string): string | null {
  try {
    if (!encryptedBase64) {
      return null
    }

    const buffer = Buffer.from(encryptedBase64, 'base64')
    const decrypted = safeStorage.decryptString(buffer)
    return decrypted
  } catch (error) {
    Logger.error('SecureStorage', 'Failed to decrypt string:', error)
    return null
  }
}

/**
 * 检查加密是否可用
 */
export function isEncryptionAvailable(): boolean {
  return safeStorage.isEncryptionAvailable()
}

/**
 * 加密对象中的敏感字段
 * @param obj 包含敏感数据的对象
 * @param sensitiveFields 需要加密的字段名数组
 * @returns 加密后的对象（原对象会被修改）
 */
export function encryptObjectFields<T extends Record<string, any>>(
  obj: T,
  sensitiveFields: string[]
): T {
  const result: Record<string, any> = { ...obj }

  for (const field of sensitiveFields) {
    if (field in result && typeof result[field] === 'string') {
      const encrypted = encryptString(result[field])
      if (encrypted) {
        result[field] = encrypted
        // 添加标记表示该字段已加密
        result[`__encrypted_${field}`] = true
      }
    }
  }

  return result as T
}

/**
 * 解密对象中的敏感字段
 * @param obj 包含加密数据的对象
 * @param sensitiveFields 需要解密的字段名数组
 * @returns 解密后的对象（原对象会被修改）
 */
export function decryptObjectFields<T extends Record<string, any>>(
  obj: T,
  sensitiveFields: string[]
): T {
  const result: Record<string, any> = { ...obj }

  for (const field of sensitiveFields) {
    // 检查是否有加密标记
    const encryptedMarker = `__encrypted_${field}`
    if (result[encryptedMarker] && field in result && typeof result[field] === 'string') {
      const decrypted = decryptString(result[field])
      if (decrypted) {
        result[field] = decrypted
      }
      // 移除加密标记
      delete result[encryptedMarker]
    }
  }

  return result as T
}

/**
 * Provider 配置的敏感字段列表
 */
export const PROVIDER_SENSITIVE_FIELDS = ['apiKey', 'apiSecret', 'accessToken']

/**
 * 加密 Provider 配置
 * @param config Provider 配置对象
 * @returns 加密后的配置
 */
export function encryptProviderConfig(config: Record<string, any>): Record<string, any> {
  return encryptObjectFields(config, PROVIDER_SENSITIVE_FIELDS)
}

/**
 * 解密 Provider 配置
 * @param config 加密的 Provider 配置对象
 * @returns 解密后的配置
 */
export function decryptProviderConfig(config: Record<string, any>): Record<string, any> {
  return decryptObjectFields(config, PROVIDER_SENSITIVE_FIELDS)
}
