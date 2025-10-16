/**
 * ESLint 安全规则配置
 * 
 * P1 功能：代码安全扫描规则
 */

module.exports = {
  extends: [
    '@next/eslint-config-next',
    'plugin:security/recommended',
    'plugin:react-hooks/recommended',
  ],
  
  plugins: [
    'security',
    'no-secrets',
    'xss',
  ],
  
  rules: {
    // 安全相关规则
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'warn',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-non-literal-require': 'warn',
    'security/detect-object-injection': 'warn',
    'security/detect-possible-timing-attacks': 'warn',
    'security/detect-pseudoRandomBytes': 'error',
    'security/detect-unsafe-regex': 'error',
    
    // 防止敏感信息泄露
    'no-secrets/no-secrets': 'error',
    
    // XSS 防护
    'xss/no-mixed-html': 'error',
    'xss/no-location-href-assign': 'error',
    
    // 其他安全规则
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-alert': 'warn',
    'no-console': 'warn',
  },
  
  env: {
    browser: true,
    node: true,
    es6: true,
  },
};


