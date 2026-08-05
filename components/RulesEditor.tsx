"use client";

import { useState } from "react";
import { updateFlagState } from "@/actions/flagStates";
import { Operator, GroupOperator, RuleGroup } from "@/lib/evaluation/rules";

type ConditionRow = {
  attribute: string;
  op: Operator;
  value: string;
};

type RulesEditorProps = {
  flagId: string;
  environmentId: string;
  initialRules: RuleGroup | null;
};

export default function RulesEditor({ flagId, environmentId, initialRules }: RulesEditorProps) {
  const [groupOperator, setGroupOperator] = useState<GroupOperator>(
    initialRules?.operator ?? "AND"
  );

  const [conditions, setConditions] = useState<ConditionRow[]>(
    initialRules?.conditions.map((c) => {
      const cond = c as { attribute: string; op: Operator; value: unknown };
      return {
        attribute: cond.attribute,
        op: cond.op,
        value: String(cond.value),
      };
    }) ?? []
  );

  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  function addCondition() {
    setConditions([...conditions, { attribute: "", op: "equals", value: "" }]);
  }

  function removeCondition(index: number) {
    setConditions(conditions.filter((_, i) => i !== index));
  }

  function updateCondition(index: number, field: keyof ConditionRow, value: string) {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  }

async function handleSave() {
  setSaving(true);
  setSavedMessage("");

  const rules: RuleGroup | null =
    conditions.length === 0
      ? null
      : {
          operator: groupOperator,
          conditions: conditions.map((c) => ({
            attribute: c.attribute,
            op: c.op,
            value:
              c.op === "in" || c.op === "notIn"
                ? c.value.split(",").map((v) => v.trim()).filter(Boolean)
                : c.value,
          })),
        };

  await updateFlagState(flagId, environmentId, { rules });

  setSaving(false);
  setSavedMessage("Saved");
}

  return (
    <div>
      <h3>Targeting Rules</h3>

      {conditions.length > 0 && (
        <div>
          <label>
            Match
            <select
              value={groupOperator}
              onChange={(e) => setGroupOperator(e.target.value as GroupOperator)}
            >
              <option value="AND">ALL of these (AND)</option>
              <option value="OR">ANY of these (OR)</option>
            </select>
          </label>
        </div>
      )}

      {conditions.map((condition, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder="attribute (e.g. country)"
            value={condition.attribute}
            onChange={(e) => updateCondition(index, "attribute", e.target.value)}
          />
          <select
            value={condition.op}
            onChange={(e) => updateCondition(index, "op", e.target.value)}
          >
            <option value="equals">equals</option>
            <option value="notEquals">not equals</option>
            <option value="in">in</option>
            <option value="notIn">not in</option>
          </select>
          <input
            type="text"
            placeholder="value (e.g. AE, or a,b,c for in/notIn)"
            value={condition.value}
            onChange={(e) => updateCondition(index, "value", e.target.value)}
          />
          <button type="button" onClick={() => removeCondition(index)}>
            Remove
          </button>
        </div>
      ))}

      <button type="button" onClick={addCondition}>
        Add Condition
      </button>

      <div>
        <button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Rules"}
        </button>
        {savedMessage && <span>{savedMessage}</span>}
      </div>
    </div>
  );
}