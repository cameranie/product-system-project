// API客户端 - 使用RESTful方式调用后端GraphQL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// GraphQL查询函数
async function graphqlRequest(query: string, variables?: Record<string, any>) {
  const response = await fetch(`${API_BASE_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
          }
        }
      }
    `;

    return graphqlRequest(query);
  }
};
