import { useState } from "react";
import { VersionProvider } from "./components/VersionContext";
import { LeftSidebar } from "./components/LeftSidebar";
import { MainContent } from "./components/MainContent";
import { RequirementsPageWithInlineEdit } from "./components/RequirementsPageWithFixedHeaderReordered";
import { RequirementPoolPageSimplified as RequirementPoolPage } from "./components/RequirementPoolPageSimplified";
import { ScheduledRequirementsPageUpdated as ScheduledRequirementsPageVersionGrouped } from "./components/ScheduledRequirementsPageUpdated";
import { RequirementDetailPageWithPRD as RequirementDetailPage } from "./components/RequirementDetailPageWithPRD";
import { PRDPage as PRDPageComplete } from "./components/PRDPageUpdated";
import { PRDPage } from "./components/PRDPageFixed";
import { PRDCreateEditPageFromRequirement } from "./components/PRDCreateEditPageFromRequirement";
import { PRDDetailPageFromRequirement } from "./components/PRDDetailPageFromRequirement";
import { VersionRequirementsPageFixed } from "./components/VersionRequirementsPageFixed";
import { PrototypePage } from "./components/PrototypePageCompleteFixed";

import { DesignManagementPage } from "./components/DesignManagementPageSimplified";
import { DesignPage } from "./components/DesignPageCompleteFixed";
import { DesignDetailPage } from "./components/DesignDetailPage";
import { DesignDetailPageUpdated } from "./components/DesignDetailPageUpdated";
import { DesignEditPage } from "./components/DesignEditPage";
import { PrototypeDetailPageUpdated as PrototypeDetailPage } from "./components/PrototypeDetailPageUpdated";
import { PrototypeEditPage } from "./components/PrototypeEditPage";
import { BugsPageWithNavigation as BugsPage } from "./components/BugsPageWithNavigation";
import { BugDetailPageWithNavigation as BugDetailPage } from "./components/BugDetailPageWithNavigation";
import { BugEditPageWithNavigation as BugEditPage } from "./components/BugEditPageWithNavigation";
import { BugCreatePage } from "./components/BugCreatePage";
import { RequirementEditPage } from "./components/RequirementEditPageUpdated";
import { MyAssignedRequirementsPage } from "./components/MyAssignedRequirementsPage";
import { MyKanbanPage } from "./components/MyKanbanPage";
import { MyTodoPage } from "./components/MyTodoPage";

import { VersionManagementPage } from "./components/VersionManagementPage";
import { VersionIntegrationDemo } from "./components/VersionIntegrationDemo";
import { PRDDraftFlowTest } from "./components/PRDDraftFlowTest";

import { RequirementLinkingDemo } from "./components/RequirementLinkingDemo";
import { PRDNavigationDemo } from "./components/PRDNavigationDemo";
import { RequirementWithSubtasksPage } from "./components/RequirementWithSubtasksPage";
import { DepartmentDashboard } from "./components/DepartmentDashboard";
import { ArchivePage } from "./components/ArchivePage";

export default function App() {
  const [currentPage, setCurrentPage] = useState(
    "requirement-pool",
  );
  const [navigationContext, setNavigationContext] =
    useState<any>(null);
  const [sidebarWidth, setSidebarWidth] = useState(280);

  const handleNavigate = (page: string, context?: any) => {
    setCurrentPage(page);
    setNavigationContext(context);
  };

  const handleSidebarWidthChange = (width: number) => {
    setSidebarWidth(width);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "requirement-pool":
        return (
          <RequirementPoolPage
            context={navigationContext}
            onNavigate={handleNavigate}
          />
        );

      case "requirements":
        return (
          <RequirementsPageWithInlineEdit
            context={navigationContext}
            onNavigate={handleNavigate}
          />
        );
      case "scheduled-requirements":
        return (
          <ScheduledRequirementsPageVersionGrouped
            context={navigationContext}
            onNavigate={handleNavigate}
          />
        );
      case "requirement-detail":
        return (
          <RequirementDetailPage
            requirementId={navigationContext?.requirementId}
            source={navigationContext?.source}
            onNavigate={handleNavigate}
          />
        );
      case "requirement-edit":
        return (
          <RequirementEditPage
            requirement={navigationContext?.requirement}
            isEdit={navigationContext?.isEdit}
            source={navigationContext?.source}
            onSave={(requirement) => {
              // 这里处理保存逻辑
              console.log("保存需求:", requirement);

              // 根据来源页面决定返回页面
              const sourcePage =
                navigationContext?.source || "requirement-pool";
              handleNavigate(sourcePage);
            }}
            onCancel={() => {
              // 返回来源页面
              const sourcePage =
                navigationContext?.source || "requirement-pool";
              handleNavigate(sourcePage);
            }}
            onNavigate={handleNavigate}
          />
        );
      case "requirement-create":
        return (
          <RequirementEditPage
            requirement={undefined}
            isEdit={false}
            source={navigationContext?.source}
            onSave={(requirement) => {
              // 这里处理保存逻辑
              console.log("创建需求:", requirement);

              // 创建成功后跳转到需求详情页
              handleNavigate("requirement-detail", {
                requirementId: requirement.id,
                source:
                  navigationContext?.source ||
                  "requirement-pool",
              });
            }}
            onCancel={() => {
              // 返回来源页面
              const sourcePage =
                navigationContext?.source || "requirement-pool";
              handleNavigate(sourcePage);
            }}
            onNavigate={handleNavigate}
          />
        );
      case "prd":
        // 处理创建或查看PRD的逻辑
        if (
          navigationContext?.mode === "create" &&
          navigationContext?.returnTo === "requirement-detail"
        ) {
          // 如果是从需求详情页创建PRD，使用专门的创建页面
          return (
            <PRDCreateEditPageFromRequirement
              context={navigationContext}
              onNavigate={handleNavigate}
            />
          );
        } else if (
          navigationContext?.mode === "view" &&
          navigationContext?.returnTo === "requirement-detail"
        ) {
          // 如果是从需求详情页查看PRD，使用专门的详情页面
          return (
            <PRDDetailPageFromRequirement
              context={navigationContext}
              onNavigate={handleNavigate}
            />
          );
        } else if (navigationContext?.mode === "create") {
          // 其他创建模式，使用PRDPageFixed来处理创建
          return (
            <PRDPage
              context={{
                ...navigationContext,
                mode: "create",
                returnTo: navigationContext?.returnTo,
                returnContext: navigationContext?.returnContext,
              }}
              onNavigate={handleNavigate}
            />
          );
        } else if (navigationContext?.mode === "edit-draft") {
          // 草稿编辑模式，使用PRDPageFixed来处理草稿编辑
          return (
            <PRDPage
              context={{
                ...navigationContext,
                mode: "edit-draft",
                returnTo: navigationContext?.returnTo || "prd",
                returnContext: navigationContext?.returnContext,
              }}
              onNavigate={handleNavigate}
            />
          );
        } else if (navigationContext?.mode === "view") {
          // 其他查看模式，使用PRDPageFixed来处理查看
          return (
            <PRDPage
              context={{
                ...navigationContext,
                mode: "view",
                returnTo: navigationContext?.returnTo,
                returnContext: navigationContext?.returnContext,
              }}
              onNavigate={handleNavigate}
            />
          );
        } else {
          // 默认显示PRD管理页面
          return (
            <PRDPageComplete
              context={navigationContext}
              onNavigate={handleNavigate}
            />
          );
        }
      case "prd-detail":
        return (
          <PRDPage
            context={{
              ...navigationContext,
              mode: "view",
              returnTo: navigationContext?.returnTo,
              returnContext: navigationContext?.returnContext,
            }}
            onNavigate={handleNavigate}
          />
        );
      case "prd-edit":
        return (
          <PRDPage
            context={{
              ...navigationContext,
              mode: "edit",
              returnTo: "prd-detail",
              returnContext: {
                prdId: navigationContext?.prdId,
                prd: navigationContext?.prd,
                mode: "view",
              },
            }}
            onNavigate={handleNavigate}
          />
        );
      case "prd-create":
        return (
          <PRDPage
            context={navigationContext}
            onNavigate={handleNavigate}
          />
        );
      case "prototype":
        // 处理原型的创建和查看逻辑
        if (navigationContext?.mode === "create") {
          // 创建新原型，并自动关联需求
          return (
            <PrototypeEditPage
              isCreate={true}
              requirementId={navigationContext?.requirementId}
              requirementTitle={
                navigationContext?.requirementTitle
              }
              returnTo={navigationContext?.returnTo}
              returnContext={navigationContext?.returnContext}
              onNavigate={handleNavigate}
            />
          );
        } else if (
          navigationContext?.mode === "view" &&
          navigationContext?.prototypeId
        ) {
          // 查看已有原型详情
          return (
            <PrototypeDetailPage
              prototypeId={navigationContext.prototypeId}
              requirementId={navigationContext?.requirementId}
              returnTo={navigationContext?.returnTo}
              returnContext={navigationContext?.returnContext}
              onNavigate={handleNavigate}
            />
          );
        } else {
          // 默认显示原���管理页面
          return (
            <PrototypePage
              context={navigationContext}
              onNavigate={handleNavigate}
            />
          );
        }
      case "prototype-management":
        return (
          <PrototypePage
            context={navigationContext}
            onNavigate={handleNavigate}
          />
        );
      case "design-management":
        // 处理UI设计的创建逻辑
        if (navigationContext?.mode === "create") {
          // 创建新设计稿，并自动关联需求
          return (
            <DesignEditPage
              isCreate={true}
              requirementId={navigationContext?.requirementId}
              requirementTitle={
                navigationContext?.requirementTitle
              }
              returnTo={navigationContext?.returnTo}
              returnContext={navigationContext?.returnContext}
              onNavigate={handleNavigate}
            />
          );
        } else {
          // 默认显示设计管理页面
          return (
            <DesignPage
              context={navigationContext}
              onNavigate={handleNavigate}
            />
          );
        }
      case "design-detail":
        // 查看设计稿详情
        return (
          <DesignDetailPageUpdated
            designId={navigationContext?.designId}
            requirementId={navigationContext?.requirementId}
            returnTo={navigationContext?.returnTo}
            returnContext={navigationContext?.returnContext}
            onNavigate={handleNavigate}
          />
        );
      case "design-edit":
        // 编辑设计稿
        return (
          <DesignEditPage
            designId={navigationContext?.designId}
            isCreate={navigationContext?.isCreate}
            requirementId={navigationContext?.requirementId}
            requirementTitle={
              navigationContext?.requirementTitle
            }
            returnTo={navigationContext?.returnTo}
            returnContext={navigationContext?.returnContext}
            onNavigate={handleNavigate}
          />
        );
      case "prototype-detail":
        return (
          <PrototypeDetailPage
            prototypeId={navigationContext?.prototypeId}
            onNavigate={handleNavigate}
          />
        );
      case "prototype-edit":
        return (
          <PrototypeEditPage
            prototypeId={navigationContext?.prototypeId}
            isCreate={navigationContext?.isCreate}
            onNavigate={handleNavigate}
          />
        );
      case "prototype-create":
        return (
          <PrototypeEditPage
            isCreate={true}
            onNavigate={handleNavigate}
          />
        );
      case "version-requirements":
        return (
          <VersionRequirementsPageFixed
            onNavigate={handleNavigate}
          />
        );
      case "bugs":
        return (
          <BugsPage
            context={navigationContext}
            onNavigate={handleNavigate}
          />
        );
      case "bug-create":
        return (
          <BugCreatePage
            context={navigationContext}
            onNavigate={handleNavigate}
          />
        );
      case "bug-detail":
        return (
          <BugDetailPage
            bugId={navigationContext?.bugId}
            context={navigationContext}
            onNavigate={handleNavigate}
          />
        );
      case "bug-edit":
        return (
          <BugEditPage
            bugId={navigationContext?.bugId}
            isCreate={navigationContext?.isCreate}
            context={navigationContext}
            onNavigate={handleNavigate}
          />
        );
      case "my-assigned":
        return (
          <MyAssignedRequirementsPage
            onNavigate={handleNavigate}
          />
        );
      case "my-kanban":
        return <MyKanbanPage onNavigate={handleNavigate} />;
      case "my-todo":
        return <MyTodoPage onNavigate={handleNavigate} />;

      case "requirement-with-subtasks":
        return (
          <RequirementWithSubtasksPage
            taskId={navigationContext?.taskId}
            task={navigationContext?.task}
            onNavigate={handleNavigate}
          />
        );

      case "version-management":
        return (
          <VersionManagementPage onNavigate={handleNavigate} />
        );
      case "version-integration-demo":
        return <VersionIntegrationDemo />;
      case "prd-draft-flow-test":
        return <PRDDraftFlowTest onNavigate={handleNavigate} />;
      case "requirement-linking-demo":
        return (
          <RequirementLinkingDemo onNavigate={handleNavigate} />
        );
      case "prd-navigation-demo":
        return (
          <PRDNavigationDemo onNavigate={handleNavigate} />
        );
      case "product-dashboard":
        return (
          <DepartmentDashboard
            onNavigate={handleNavigate}
            department="product"
          />
        );
      case "development-dashboard":
        return (
          <DepartmentDashboard
            onNavigate={handleNavigate}
            department="development"
          />
        );
      case "testing-dashboard":
        return (
          <DepartmentDashboard
            onNavigate={handleNavigate}
            department="testing"
          />
        );
      case "design-dashboard":
        return (
          <DepartmentDashboard
            onNavigate={handleNavigate}
            department="design"
          />
        );
      case "archive-version-requirements":
        return (
          <ArchivePage
            onNavigate={handleNavigate}
            type="version-requirements"
          />
        );
      case "team-management":
        return (
          <div className="p-6">
            <h1>团队管理</h1>
            <p className="text-muted-foreground">
              团队管理功能开发中...
            </p>
          </div>
        );
      case "tag-management":
        return (
          <div className="p-6">
            <h1>标签管理</h1>
            <p className="text-muted-foreground">
              标签管理功能开发中...
            </p>
          </div>
        );
      case "settings":
        return (
          <div className="p-6">
            <h1>系统设置</h1>
            <p className="text-muted-foreground">
              系统设置功能开发中...
            </p>
          </div>
        );
      default:
        return <RequirementPoolPage />;
    }
  };

  return (
    <VersionProvider>
      <div className="min-h-screen bg-background">
        <LeftSidebar
          onNavigate={setCurrentPage}
          onWidthChange={handleSidebarWidthChange}
        />
        <main
          className="min-h-screen bg-background transition-all duration-200"
          style={{ marginLeft: `${sidebarWidth}px` }}
        >
          {renderCurrentPage()}
        </main>
      </div>
    </VersionProvider>
  );
}