const fs = require('fs');

// Read the current file
let content = fs.readFileSync('./components/ScheduledRequirementsPageUpdated.tsx', 'utf8');

// Define the batch actions UI to add
const batchActionsUI = `
        {/* 批量操作栏 */}
        {showBatchActions && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-800">
                    已选择 {selectedRequirements.length} 个需求
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBatchApproveFirstLevel}
                    className="bg-white border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    一键通过一级评审
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBatchApproveSecondLevel}
                    className="bg-white border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    一键通过二级评审
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBatchMoveToVersionRequirements}
                    className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Move className="h-4 w-4 mr-2" />
                    一键移动到版本需求管理
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedRequirements([])}
                    className="text-muted-foreground"
                  >
                    取消选择
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
`;

// Find the insertion point - after the filter card and before the version groups
// Look for the pattern that indicates the end of filter section
const filterSectionEnd = content.indexOf('</Card>');
const nextCardStart = content.indexOf('<Card>', filterSectionEnd + 10);

if (filterSectionEnd !== -1 && nextCardStart !== -1) {
  // Insert batch actions UI between filter card and next content
  const beforeBatch = content.substring(0, filterSectionEnd + 7); // Include </Card>
  const afterBatch = content.substring(filterSectionEnd + 7);
  
  const newContent = beforeBatch + batchActionsUI + afterBatch;
  
  // Write the updated content
  fs.writeFileSync('./components/ScheduledRequirementsPageUpdated.tsx', newContent);
  console.log('Successfully added batch actions UI');
} else {
  console.log('Could not find insertion point');
}