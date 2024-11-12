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
export interface Item {
  name: string;
  link?: string;
  children?: Item[];
}

export interface ItemWithExpanded extends Item {
  isExpanded?: boolean;
}

export interface TreeTestConfig {
  tree: Item[];
  tasks: {
    id: string;
    description: string;
    link: string;
  }[];
  requireConfidenceRating: boolean;
  preview: boolean;
  participantId?: string;
  studyId: string;
}
