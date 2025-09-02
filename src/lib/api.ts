// API客户端 - 使用RESTful方式调用后端GraphQL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// 使用产品经理的固定token（从之前的登录获取）
function getAuthToken(): string | null {
  // 使用产品经理的token
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWYxdXdwdzcwMDRjMTBmMDhhbjNreGF3IiwiZW1haWwiOiJwbUBjb21wYW55LmNvbSIsInVzZXJuYW1lIjoicHJvZHVjdF9tYW5hZ2VyIiwicm9sZXMiOlsicHJvamVjdF9tYW5hZ2VyIl0sInBlcm1pc3Npb25zIjpbInVzZXI6cmVhZCIsInByb2plY3Q6Y3JlYXRlIiwicHJvamVjdDpyZWFkIiwicHJvamVjdDp1cGRhdGUiLCJ0YXNrOmNyZWF0ZSIsInRhc2s6cmVhZCIsInRhc2s6dXBkYXRlIiwidGFzazphc3NpZ24iLCJ0ZWFtOnJlYWQiLCJ0aW1lbG9nOnJlYWQiXSwiaWF0IjoxNzU2Nzc2MTQzLCJleHAiOjE3NTczODA5NDN9.3CoSas-rJCRUZdk3eLAGWnC2KSuggvIXvv3hZzo21wQ";
}

// GraphQL查询函数
async function graphqlRequest(query: string, variables?: Record<string, any>) {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'GraphQL error');
  }

  return result.data;
}

// 认证API
export const authApi = {
  // 登录
  async login(email: string, password: string) {
    const query = `
      mutation Login($input: LoginInputType!) {
        login(input: $input) {
          access_token
          user {
            id
            name
            email
          }
        }
      }
    `;

    const result = await graphqlRequest(query, { input: { email, password } });
    
    // 存储token
    if (result.login.access_token) {
      localStorage.setItem('auth_token', result.login.access_token);
    }
    
    return result.login;
  },

  // 登出
  logout() {
    localStorage.removeItem('auth_token');
  },

  // 检查是否已登录
  isAuthenticated(): boolean {
    return !!getAuthToken();
  }
};

// Issue相关API
export const issueApi = {
  // 获取Issue列表
  async getIssues(filters?: {
    projectId?: string;
    status?: string[];
    priority?: string[];
    inputSource?: string[];
    keyword?: string;
  }, pagination?: { skip?: number; take?: number }) {
    const query = `
      query GetIssues($filters: IssueFiltersInput, $pagination: PaginationInput) {
        issues(filters: $filters, pagination: $pagination) {
          issues {
            id
            title
            description
            status
            priority
            inputSource
            issueType
            businessValue
            userImpact
            createdAt
            updatedAt
            dueDate
            creator {
              id
              name
              email
            }
            assignee {
              id
              name
              email
            }
            project {
              id
              name
            }
            comments {
              id
              content
              createdAt
              author {
                name
              }
            }
          }
          total
          hasMore
        }
      }
    `;

    return graphqlRequest(query, { filters, pagination });
  },

  // 获取单个Issue
  async getIssue(id: string) {
    const query = `
      query GetIssue($id: ID!) {
        issue(id: $id) {
          id
          title
          description
          status
          priority
          inputSource
          issueType
          businessValue
          userImpact
          technicalRisk
          createdAt
          updatedAt
          dueDate
          creator {
            id
            name
            email
          }
          assignee {
            id
            name
            email
          }
          project {
            id
            name
          }
          comments {
            id
            content
            createdAt
            author {
              name
            }
            replies {
              id
              content
              createdAt
              author {
                name
              }
            }
          }
          tasks {
            id
            title
            status
            assignee {
              name
            }
          }
          prds {
            id
            title
            status
            author {
              name
            }
          }
        }
      }
    `;

    return graphqlRequest(query, { id });
  },

  // 创建Issue
  async createIssue(input: {
    title: string;
    description?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    inputSource: 'USER_FEEDBACK' | 'INTERNAL' | 'DATA_ANALYSIS' | 'STRATEGY';
    issueType: 'FEATURE' | 'ENHANCEMENT' | 'BUG_FIX' | 'TECHNICAL_DEBT' | 'RESEARCH';
    projectId: string;
    assigneeId?: string;
    businessValue?: string;
    userImpact?: string;
    technicalRisk?: string;
    dueDate?: string;
  }) {
    const query = `
      mutation CreateIssue($input: CreateIssueInput!) {
        createIssue(input: $input) {
          id
          title
          status
          createdAt
        }
      }
    `;

    return graphqlRequest(query, { input });
  },

  // 更新Issue状态
  async transitionStatus(id: string, targetStatus: string, comment?: string) {
    const query = `
      mutation TransitionIssueStatus($id: ID!, $targetStatus: IssueStatus!, $comment: String) {
        transitionIssueStatus(id: $id, targetStatus: $targetStatus, comment: $comment) {
          id
          status
          updatedAt
        }
      }
    `;

    return graphqlRequest(query, { id, targetStatus, comment });
  },

  // 添加评论
  async addComment(issueId: string, content: string, parentId?: string) {
    const query = `
      mutation AddIssueComment($input: AddIssueCommentInput!) {
        addIssueComment(input: $input) {
          id
          content
          createdAt
          author {
            name
          }
        }
      }
    `;

    return graphqlRequest(query, { input: { issueId, content, parentId } });
  },

  // 获取Issue统计
  async getStats(projectId?: string) {
    const query = `
      query GetIssueStats($projectId: ID) {
        issueStats(projectId: $projectId) {
          total
          byStatus {
            status
            count
          }
          byPriority {
            priority
            count
          }
          byInputSource {
            inputSource
            count
          }
          completionRate
        }
      }
    `;

    return graphqlRequest(query, { projectId });
  },
};

// 项目API (获取项目列表用于Issue创建)
export const projectApi = {
  async getProjects() {
    const query = `
      query GetProjects {
        projects {
          projects {
            id
            name
            key
            description
          }
        }
      }
    `;

    return graphqlRequest(query);
  }
};

// 用户API (获取用户列表用于分配)
export const userApi = {
  async getUsers() {
    const query = `
      query GetUsers {
        users {
          users {
            id
            name
            email
            username
          }
        }
      }
    `;

    return graphqlRequest(query);
  }
};

// 任务API
export const taskApi = {
  // 获取任务列表
  async getTasks(filters?: {
    projectId?: string;
    issueId?: string;
    assigneeId?: string;
    status?: string;
    priority?: string;
    search?: string;
  }, pagination?: { skip?: number; take?: number }) {
    const query = `
      query GetTasks($filters: TaskFiltersInput, $skip: Int, $take: Int) {
        tasks(filters: $filters, skip: $skip, take: $take) {
          tasks {
            id
            title
            description
            status
            priority
            startDate
            dueDate
            estimatedHours
            actualHours
            createdAt
            updatedAt
          }
          total
        }
      }
    `;

    return graphqlRequest(query, { 
      filters, 
      skip: pagination?.skip, 
      take: pagination?.take 
    });
  },

  // 获取单个任务
  async getTask(id: string) {
    const query = `
      query GetTask($id: ID!) {
        task(id: $id) {
          id
          title
          description
          status
          priority
          startDate
          dueDate
          estimatedHours
          actualHours
          createdAt
          updatedAt
          assignee {
            id
            name
            email
            username
          }
          creator {
            id
            name
            email
          }
          project {
            id
            name
            key
          }
          issue {
            id
            title
          }
        }
      }
    `;

    return graphqlRequest(query, { id });
  },

  // 创建任务
  async createTask(input: {
    title: string;
    description?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
    projectId: string;
    issueId?: string;
    assigneeId?: string;
    estimatedHours?: number;
    startDate?: string;
    dueDate?: string;
  }) {
    const query = `
      mutation CreateTask($input: CreateTaskInput!) {
        createTask(input: $input) {
          id
          title
          status
          createdAt
        }
      }
    `;

    return graphqlRequest(query, { input });
  },

  // 更新任务状态
  async updateTaskStatus(id: string, status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE') {
    const query = `
      mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
        updateTask(id: $id, input: $input) {
          id
          status
          updatedAt
        }
      }
    `;

    return graphqlRequest(query, { id, input: { status } });
  },
};

