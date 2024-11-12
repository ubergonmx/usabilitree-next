export interface StudyFormData {
  general: {
    title: string;
    description: string;
  };
  tree: {
    structure: string;
    parsed: TreeNode[];
  };
  tasks: {
    items: Array<{
      description: string;
      answer: string;
    }>;
  };
  messages: {
    welcome: string;
    completion: string;
  };
}

export interface TreeNode {
  name: string;
  link?: string;
  children?: TreeNode[];
}
