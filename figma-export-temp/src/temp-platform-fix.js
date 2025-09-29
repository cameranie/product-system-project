// 用于修复预排期需求管理页面的应用端列
// 需要在数据行中添加应用端的DropdownMenu

// 原代码需要替换的部分（应该在项目列之后，评审状态列之前）：
// 添加应用端列的DropdownMenu

const platformCellCode = `
                          {/* 应用端 - 可编辑 */}
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs">
                                  {requirement.platform || '未指定'}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                {platforms.map((platform) => (
                                  <DropdownMenuItem 
                                    key={platform} 
                                    onClick={() => handlePlatformChange(requirement.id, platform)}
                                  >
                                    {platform}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
`;

console.log("需要在预排期需求管理页面中添加上述代码");