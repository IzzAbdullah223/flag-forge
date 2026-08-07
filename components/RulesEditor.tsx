"use client";

import { useState } from "react";
import { updateFlagState } from "@/actions/flagStates";
import { Operator, GroupOperator, RuleGroup } from "@/lib/evaluation/rules";
import { Plus, X, ListFilter, Check } from "lucide-react";

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

const selectClass =
  "bg-[var(--bg)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:border-[var(--signal-green)] appearance-none cursor-pointer";

const inputClass =
  "bg-[var(--bg)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--signal-green)]";

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
    setTimeout(() => setSavedMessage(""), 2000);
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <ListFilter size={15} className="text-[var(--text-muted)]" />
        <h3 className="text-sm font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Targeting Rules
        </h3>
      </div>

      {conditions.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-[var(--text-muted)]">Match</span>
          <select
            value={groupOperator}
            onChange={(e) => setGroupOperator(e.target.value as GroupOperator)}
            className={selectClass}
          >
            <option value="AND">ALL of these (AND)</option>
            <option value="OR">ANY of these (OR)</option>
          </select>
        </div>
      )}

      <div className="space-y-2 mb-3">
        {conditions.map((condition, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2.5"
          >
            <input
              type="text"
              placeholder="attribute"
              value={condition.attribute}
              onChange={(e) => updateCondition(index, "attribute", e.target.value)}
              className={`font-mono-key ${inputClass} w-32`}
            />
            <select
              value={condition.op}
              onChange={(e) => updateCondition(index, "op", e.target.value)}
              className={selectClass}
            >
              <option value="equals">equals</option>
              <option value="notEquals">not equals</option>
              <option value="in">in</option>
              <option value="notIn">not in</option>
            </select>
            <input
              type="text"
              placeholder={
                condition.op === "in" || condition.op === "notIn"
                  ? "value1, value2, ..."
                  : "value"
              }
              value={condition.value}
              onChange={(e) => updateCondition(index, "value", e.target.value)}
              className={`font-mono-key ${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={() => removeCondition(index)}
              className="text-[var(--text-muted)] hover:text-[#F06464] transition-colors p-1"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={addCondition}
          className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <Plus size={15} />
          Add Condition
        </button>

        <div className="flex items-center gap-3">
          {savedMessage && (
            <span className="flex items-center gap-1 text-sm text-[var(--signal-green)]">
              <Check size={14} />
              {savedMessage}
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="text-sm px-4 py-1.5 rounded-md border border-[var(--border)] hover:border-[var(--signal-green)] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Rules"}
          </button>
        </div>
      </div>
    </div>
  );
}