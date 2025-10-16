/**
 * 隐私保护工具
 * 
 * 提供数据脱敏功能,保护敏感信息
 * 
 * @module lib/privacy-utils
 */

/**
 * 手机号脱敏
 * 
 * 隐藏中间4位数字
 * 
 * @param phone - 手机号
 * @returns 脱敏后的手机号
 * 
 * @example
 * ```ts
 * maskPhone('13800138000') // => '138****8000'
 * maskPhone('12345678901') // => '123****8901'
 * ```
 */
export function maskPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  
  // 移除所有非数字字符
  const cleaned = phone.replace(/\D/g, '');
  
  // 检查是否为11位手机号
  if (cleaned.length !== 11) {
    return phone; // 返回原值,不进行脱敏
  }
  
  return cleaned.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 邮箱脱敏
 * 
 * 隐藏用户名部分,只保留首字符和域名
 * 
 * @param email - 邮箱地址
 * @returns 脱敏后的邮箱
 * 
 * @example
 * ```ts
 * maskEmail('user@example.com')     // => 'u***@example.com'
 * maskEmail('john.doe@company.com') // => 'j***@company.com'
 * maskEmail('a@test.com')           // => 'a***@test.com'
 * ```
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }
  
  if (!email.includes('@')) {
    return email; // 不是有效邮箱,返回原值
  }
  
  const [username, domain] = email.split('@');
  
  if (!username || !domain) {
    return email; // 格式不正确,返回原值
  }
  
  // 只显示用户名首字符
  const maskedUsername = username[0] + '***';
  
  return `${maskedUsername}@${domain}`;
}

/**
 * 姓名脱敏
 * 
 * 隐藏除首字符外的所有字符
 * 
 * @param name - 姓名
 * @returns 脱敏后的姓名
 * 
 * @example
 * ```ts
 * maskName('张三')       // => '张*'
 * maskName('李四')       // => '李*'
 * maskName('王五六')     // => '王**'
 * maskName('John Doe')  // => 'J*** D**'
 * ```
 */
export function maskName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }
  
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return '';
  }
  
  // 如果包含空格,处理每个部分
  if (trimmed.includes(' ')) {
    return trimmed
      .split(' ')
      .map(part => part[0] + '***')
      .join(' ');
  }
  
  // 单个名字: 首字符 + 星号
  return trimmed[0] + '*'.repeat(Math.max(1, trimmed.length - 1));
}

/**
 * 身份证号脱敏
 * 
 * 隐藏中间10位数字
 * 
 * @param idCard - 身份证号
 * @returns 脱敏后的身份证号
 * 
 * @example
 * ```ts
 * maskIdCard('110101199001011234') // => '1101**********1234'
 * maskIdCard('12345678901234567X') // => '1234**********567X'
 * ```
 */
export function maskIdCard(idCard: string): string {
  if (!idCard || typeof idCard !== 'string') {
    return '';
  }
  
  const cleaned = idCard.trim();
  
  // 中国身份证号为15位或18位
  if (cleaned.length !== 15 && cleaned.length !== 18) {
    return idCard; // 不是有效身份证号,返回原值
  }
  
  // 显示前4位和后4位
  return cleaned.replace(/^(.{4})(.*)(.{4})$/, '$1**********$3');
}

/**
 * 银行卡号脱敏
 * 
 * 隐藏中间数字,只保留前4位和后4位
 * 
 * @param cardNo - 银行卡号
 * @returns 脱敏后的银行卡号
 * 
 * @example
 * ```ts
 * maskBankCard('6222021234567890123') // => '6222 **** **** 0123'
 * ```
 */
export function maskBankCard(cardNo: string): string {
  if (!cardNo || typeof cardNo !== 'string') {
    return '';
  }
  
  // 移除所有非数字字符
  const cleaned = cardNo.replace(/\D/g, '');
  
  if (cleaned.length < 12) {
    return cardNo; // 太短,不是有效银行卡号
  }
  
  // 保留前4位和后4位
  const first4 = cleaned.substring(0, 4);
  const last4 = cleaned.substring(cleaned.length - 4);
  const middle = '****'.repeat(Math.ceil((cleaned.length - 8) / 4));
  
  return `${first4} ${middle} ${last4}`;
}

/**
 * 地址脱敏
 * 
 * 隐藏详细地址,只保留省市
 * 
 * @param address - 完整地址
 * @returns 脱敏后的地址
 * 
 * @example
 * ```ts
 * maskAddress('北京市朝阳区某某街道123号') // => '北京市朝阳区***'
 * maskAddress('上海市浦东新区陆家嘴环路1000号') // => '上海市浦东新区***'
 * ```
 */
export function maskAddress(address: string): string {
  if (!address || typeof address !== 'string') {
    return '';
  }
  
  // 尝试提取省市区
  const provinceMatch = address.match(/^(.+?[省市])/);
  const districtMatch = address.match(/^(.+?[省市].+?[区县市])/);
  
  if (districtMatch) {
    return districtMatch[1] + '***';
  }
  
  if (provinceMatch) {
    return provinceMatch[1] + '***';
  }
  
  // 如果无法识别,返回前面部分 + ***
  const maxLength = Math.min(10, Math.floor(address.length / 2));
  return address.substring(0, maxLength) + '***';
}

/**
 * 通用字符串脱敏
 * 
 * 隐藏中间部分,保留首尾
 * 
 * @param str - 要脱敏的字符串
 * @param keepStart - 保留开头字符数 (默认: 3)
 * @param keepEnd - 保留结尾字符数 (默认: 3)
 * @returns 脱敏后的字符串
 * 
 * @example
 * ```ts
 * maskString('sensitive-data', 3, 3) // => 'sen******ata'
 * maskString('123456789', 2, 2)      // => '12*****89'
 * ```
 */
export function maskString(
  str: string,
  keepStart: number = 3,
  keepEnd: number = 3
): string {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  const length = str.length;
  
  if (length <= keepStart + keepEnd) {
    return str; // 字符串太短,不脱敏
  }
  
  const start = str.substring(0, keepStart);
  const end = str.substring(length - keepEnd);
  const middle = '*'.repeat(Math.max(4, length - keepStart - keepEnd));
  
  return `${start}${middle}${end}`;
}

/**
 * IP 地址脱敏
 * 
 * 隐藏后两段
 * 
 * @param ip - IP地址
 * @returns 脱敏后的IP地址
 * 
 * @example
 * ```ts
 * maskIP('192.168.1.100') // => '192.168.*.*'
 * ```
 */
export function maskIP(ip: string): string {
  if (!ip || typeof ip !== 'string') {
    return '';
  }
  
  const parts = ip.split('.');
  
  if (parts.length !== 4) {
    return ip; // 不是有效的IPv4地址
  }
  
  return `${parts[0]}.${parts[1]}.*.*`;
}

/**
 * 批量脱敏对象
 * 
 * 根据配置对对象的指定字段进行脱敏
 * 
 * @param obj - 要脱敏的对象
 * @param config - 脱敏配置 { 字段名: 脱敏函数 }
 * @returns 脱敏后的对象
 * 
 * @example
 * ```ts
 * const user = {
 *   name: '张三',
 *   phone: '13800138000',
 *   email: 'zhangsan@example.com',
 *   age: 30,
 * };
 * 
 * const masked = maskObject(user, {
 *   name: maskName,
 *   phone: maskPhone,
 *   email: maskEmail,
 * });
 * 
 * // 结果:
 * // {
 * //   name: '张*',
 * //   phone: '138****8000',
 * //   email: 'z***@example.com',
 * //   age: 30, // 未配置的字段保持原样
 * // }
 * ```
 */
export function maskObject<T extends Record<string, any>>(
  obj: T,
  config: Partial<Record<keyof T, (value: any) => string>>
): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const result = { ...obj };
  
  for (const key in config) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const maskFn = config[key];
      if (maskFn && typeof maskFn === 'function') {
        result[key] = maskFn(obj[key]) as any;
      }
    }
  }
  
  return result;
}

/**
 * 根据数据类型自动脱敏
 * 
 * 自动识别手机号、邮箱、身份证等,并进行脱敏
 * 
 * @param value - 要脱敏的值
 * @returns 脱敏后的值
 * 
 * @example
 * ```ts
 * autoMask('13800138000')           // => '138****8000' (识别为手机号)
 * autoMask('user@example.com')      // => 'u***@example.com' (识别为邮箱)
 * autoMask('110101199001011234')    // => '1101**********1234' (识别为身份证)
 * autoMask('regular text')          // => 'regular text' (普通文本,不脱敏)
 * ```
 */
export function autoMask(value: string): string {
  if (!value || typeof value !== 'string') {
    return value;
  }
  
  const trimmed = value.trim();
  
  // 手机号 (11位数字)
  if (/^1[3-9]\d{9}$/.test(trimmed)) {
    return maskPhone(trimmed);
  }
  
  // 邮箱
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return maskEmail(trimmed);
  }
  
  // 身份证号 (15位或18位)
  if (/^\d{15}(\d{2}[0-9X])?$/.test(trimmed)) {
    return maskIdCard(trimmed);
  }
  
  // 银行卡号 (13-19位数字)
  if (/^\d{13,19}$/.test(trimmed)) {
    return maskBankCard(trimmed);
  }
  
  // IP地址
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(trimmed)) {
    return maskIP(trimmed);
  }
  
  // 默认不脱敏
  return value;
}
