// 需要在第783行附近找到并替换这一行：
// <TableRow key={requirement.id} className="hover:bg-muted/50">
// 替换为：
// <TableRow 
//   key={requirement.id} 
//   className={`hover:bg-muted/50 ${
//     highlightRequirementId === requirement.id 
//       ? 'bg-green-50 border-green-200 shadow-sm' 
//       : ''
//   }`}
// >