/**
 * ESLint 复杂度分析配置
 * 
 * P1 功能：代码复杂度扫描
 */

module.exports = {
  extends: [
    '@next/eslint-config-next',
  ],
  
  plugins: [
    'complexity',
    'sonarjs',
  ],
  
  rules: {
    // 复杂度规则
    'complexity': ['warn', { max: 10 }],
    'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
    'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
    'max-params': ['warn', { max: 4 }],
    'max-depth': ['warn', { max: 4 }],
    'max-nested-callbacks': ['warn', { max: 3 }],
    
    // SonarJS 规则
    'sonarjs/cognitive-complexity': ['warn', 15],
    'sonarjs/no-duplicate-string': ['warn', { threshold: 3 }],
    'sonarjs/no-identical-functions': 'warn',
    'sonarjs/no-redundant-boolean': 'warn',
    'sonarjs/no-unused-collection': 'warn',
    'sonarjs/prefer-immediate-return': 'warn',
    'sonarjs/prefer-single-boolean-return': 'warn',
  },
};


