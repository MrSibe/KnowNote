/**
 * 统一的错误处理类型
 * 用于替代混用的 throw Error 和返回错误对象模式
 */

/**
 * Result 类型 - 代表操作的成功或失败
 * @template T - 成功时的数据类型
 * @template E - 失败时的错误类型,默认为 Error
 */
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E }

/**
 * 创建成功的 Result
 * @param data - 成功的数据
 * @returns 成功的 Result 对象
 * @example
 * const result = Ok({ id: '123', name: 'test' })
 * // result = { success: true, data: { id: '123', name: 'test' } }
 */
export function Ok<T>(data: T): Result<T, never> {
  return { success: true, data }
}

/**
 * 创建失败的 Result
 * @param error - 错误对象或错误消息
 * @returns 失败的 Result 对象
 * @example
 * const result = Err(new Error('Something went wrong'))
 * // result = { success: false, error: Error('Something went wrong') }
 *
 * const result2 = Err('Invalid input')
 * // result2 = { success: false, error: Error('Invalid input') }
 */
export function Err<E = Error>(error: E | string): Result<never, E> {
  const errorObj = typeof error === 'string' ? (new Error(error) as E) : error
  return { success: false, error: errorObj }
}

/**
 * 检查 Result 是否为成功
 * @param result - Result 对象
 * @returns 如果成功返回 true
 */
export function isOk<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success === true
}

/**
 * 检查 Result 是否为失败
 * @param result - Result 对象
 * @returns 如果失败返回 true
 */
export function isErr<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return result.success === false
}

/**
 * 从 Result 中提取数据,如果失败则抛出错误
 * @param result - Result 对象
 * @returns 成功的数据
 * @throws 如果 Result 是失败状态
 * @example
 * const result = Ok(42)
 * const value = unwrap(result) // value = 42
 *
 * const failResult = Err('Failed')
 * const value2 = unwrap(failResult) // throws Error('Failed')
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.success) {
    return result.data
  }
  throw result.error
}

/**
 * 从 Result 中提取数据,如果失败则返回默认值
 * @param result - Result 对象
 * @param defaultValue - 失败时的默认值
 * @returns 成功的数据或默认值
 * @example
 * const result = Ok(42)
 * const value = unwrapOr(result, 0) // value = 42
 *
 * const failResult = Err('Failed')
 * const value2 = unwrapOr(failResult, 0) // value2 = 0
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (result.success) {
    return result.data
  }
  return defaultValue
}

/**
 * 将异步函数包装为返回 Result 的函数
 * @param fn - 异步函数
 * @returns 返回 Result 的异步函数
 * @example
 * const safeFetch = wrapAsync(async (url: string) => {
 *   const response = await fetch(url)
 *   return response.json()
 * })
 *
 * const result = await safeFetch('https://api.example.com/data')
 * if (result.success) {
 *   console.log(result.data)
 * } else {
 *   console.error(result.error)
 * }
 */
export function wrapAsync<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<Result<R>> {
  return async (...args: T) => {
    try {
      const data = await fn(...args)
      return Ok(data)
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)))
    }
  }
}

/**
 * 将同步函数包装为返回 Result 的函数
 * @param fn - 同步函数
 * @returns 返回 Result 的函数
 * @example
 * const safeParseInt = wrapSync((str: string) => {
 *   const num = parseInt(str, 10)
 *   if (isNaN(num)) throw new Error('Invalid number')
 *   return num
 * })
 *
 * const result = safeParseInt('42')  // { success: true, data: 42 }
 * const result2 = safeParseInt('abc') // { success: false, error: Error('Invalid number') }
 */
export function wrapSync<T extends unknown[], R>(fn: (...args: T) => R): (...args: T) => Result<R> {
  return (...args: T) => {
    try {
      const data = fn(...args)
      return Ok(data)
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
