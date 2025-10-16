/**
 * 初始化版本管理测试数据
 * 
 * 使用方法：
 * 1. 在浏览器控制台复制粘贴这段代码
 * 2. 或者访问版本管理页面 (/versions) 手动添加版本
 */

// 计算版本时间节点
function calculateVersionSchedule(releaseDate) {
  const release = new Date(releaseDate);
  
  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };
  
  const getWednesday = (date) => {
    const monday = getMonday(date);
    return new Date(monday.getTime() + 2 * 24 * 60 * 60 * 1000);
  };
  
  const getFriday = (date) => {
    const monday = getMonday(date);
    return new Date(monday.getTime() + 4 * 24 * 60 * 60 * 1000);
  };
  
  // PRD时间：上线前第四周的周一到周三
  const prdWeekStart = getMonday(new Date(release.getTime() - 4 * 7 * 24 * 60 * 60 * 1000));
  const prdStartDate = prdWeekStart;
  const prdEndDate = getWednesday(prdWeekStart);
  
  // 原型设计时间：上线前第三周的周一到周五
  const prototypeWeekStart = getMonday(new Date(release.getTime() - 3 * 7 * 24 * 60 * 60 * 1000));
  const prototypeStartDate = prototypeWeekStart;
  const prototypeEndDate = getFriday(prototypeWeekStart);
  
  // 开发时间：上线前两周周一开始至前一周周五
  const devWeekStart = getMonday(new Date(release.getTime() - 2 * 7 * 24 * 60 * 60 * 1000));
  const devStartDate = devWeekStart;
  const devEndDate = getFriday(new Date(release.getTime() - 1 * 7 * 24 * 60 * 60 * 1000));
  
  // 测试时间：上线当周的周一到上线日期
  const testStartDate = getMonday(release);
  const testEndDate = release;
  
  return {
    prdStartDate: prdStartDate.toISOString().split('T')[0],
    prdEndDate: prdEndDate.toISOString().split('T')[0],
    prototypeStartDate: prototypeStartDate.toISOString().split('T')[0],
    prototypeEndDate: prototypeEndDate.toISOString().split('T')[0],
    devStartDate: devStartDate.toISOString().split('T')[0],
    devEndDate: devEndDate.toISOString().split('T')[0],
    testStartDate: testStartDate.toISOString().split('T')[0],
    testEndDate: testEndDate.toISOString().split('T')[0]
  };
}

// 生成测试版本数据
function generateTestVersions() {
  const platforms = ['iOS', '安卓', 'PC', 'web'];
  const versions = [];
  const now = new Date();
  
  platforms.forEach((platform, index) => {
    // 为每个平台生成 2-3 个版本
    for (let i = 0; i < 2; i++) {
      const releaseDate = new Date(now.getTime() + (index * 7 + i * 14) * 24 * 60 * 60 * 1000);
      const versionNumber = `${i + 1}.${index}.0`;
      
      versions.push({
        id: `${platform}-${versionNumber}-${Date.now()}-${Math.random()}`,
        platform: platform,
        versionNumber: versionNumber,
        releaseDate: releaseDate.toISOString().split('T')[0],
        schedule: calculateVersionSchedule(releaseDate.toISOString().split('T')[0]),
        createdAt: now.toLocaleString('zh-CN'),
        updatedAt: now.toLocaleString('zh-CN')
      });
    }
  });
  
  return versions;
}

// 初始化数据
function initVersionData() {
  const existingData = localStorage.getItem('version_management_versions');
  
  if (existingData) {
    const parsed = JSON.parse(existingData);
    console.log('当前已有版本数据：', parsed);
    const confirm = window.confirm(`当前已有 ${parsed.length} 条版本记录。是否要添加测试数据？`);
    if (!confirm) {
      console.log('取消操作');
      return;
    }
  }
  
  const testVersions = generateTestVersions();
  localStorage.setItem('version_management_versions', JSON.stringify(testVersions));
  
  console.log('✅ 成功添加测试版本数据！');
  console.log('添加的版本：', testVersions);
  console.log('\n版本号列表：');
  testVersions.forEach(v => {
    console.log(`  - ${v.platform} ${v.versionNumber} (上线日期: ${v.releaseDate})`);
  });
  console.log('\n请刷新页面查看效果！');
  
  return testVersions;
}

// 清除版本数据
function clearVersionData() {
  const confirm = window.confirm('确定要清除所有版本数据吗？');
  if (confirm) {
    localStorage.removeItem('version_management_versions');
    localStorage.removeItem('version_management_custom_platforms');
    console.log('✅ 已清除所有版本数据！');
    console.log('请刷新页面查看效果！');
  }
}

// 导出函数到全局
if (typeof window !== 'undefined') {
  window.initVersionData = initVersionData;
  window.clearVersionData = clearVersionData;
  window.generateTestVersions = generateTestVersions;
}

console.log('📦 版本数据初始化脚本已加载！');
console.log('\n可用命令：');
console.log('  - initVersionData()     // 初始化测试版本数据');
console.log('  - clearVersionData()    // 清除所有版本数据');
console.log('  - generateTestVersions() // 查看将要生成的测试数据');

// 如果在 Node.js 环境中
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initVersionData,
    clearVersionData,
    generateTestVersions,
    calculateVersionSchedule
  };
}

