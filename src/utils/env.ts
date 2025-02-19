/**
 * 判断当前是否在客户端环境
 */
export const isClient = () => typeof document !== 'undefined';

/**
 * 判断当前是否在服务端环境
 */
export const isServer = () => !isClient();
