export type Operator = 'equals' | 'notEquals' | 'in' | 'notIn';
export type GroupOperator = 'AND' | 'OR';

export interface Condition {
  attribute: string;
  op: Operator;
  value: string | number | string[] | number[];
}

export interface RuleGroup {
  operator: GroupOperator;
  conditions: (Condition | RuleGroup)[];
}

export type UserContext = Record<string, string | number>;

function isGroup(node: Condition | RuleGroup): node is RuleGroup {
  return 'conditions' in node;
}

function matchCondition(condition: Condition, user: UserContext): boolean {
  const userValue = user[condition.attribute];

  switch (condition.op) {
    case 'equals':
      return userValue === condition.value;
    case 'notEquals':
      return userValue !== condition.value;
    case 'in':
      return Array.isArray(condition.value) && condition.value.includes(userValue as never);
    case 'notIn':
      return Array.isArray(condition.value) && !condition.value.includes(userValue as never);
    default:
      return false;
  }
}

export function evaluateGroup(group: RuleGroup, user: UserContext): boolean {
  if (group.operator === 'AND') {
    return group.conditions.every((node) =>
      isGroup(node) ? evaluateGroup(node, user) : matchCondition(node, user)
    );
  }
  return group.conditions.some((node) =>
    isGroup(node) ? evaluateGroup(node, user) : matchCondition(node, user)
  );
}