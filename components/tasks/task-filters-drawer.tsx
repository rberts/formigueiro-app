"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TaskFiltersState } from "@/lib/tasks-filters";
import { cn } from "@/components/lib/utils";

type AssigneeOption = { id: string; name: string };

type TaskFiltersDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: TaskFiltersState;
  onChange: (next: TaskFiltersState) => void;
  assigneeOptions: AssigneeOption[];
};

const statusOptions = [
  { value: "to_start", label: "A fazer" },
  { value: "in_progress", label: "Em andamento" },
  { value: "pending", label: "Pendente" },
  { value: "done", label: "Concluída" },
];

const emptyFilters: TaskFiltersState = {
  statuses: [],
  assigneeIds: [],
  from: null,
  to: null,
  search: "",
  includeWithoutDate: false,
};

const CheckboxField = ({
  id,
  checked,
  label,
  onChange,
}: {
  id: string;
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) => (
  <label htmlFor={id} className="flex items-center gap-2 text-sm text-slate-100">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary-500 focus:ring-primary-500"
    />
    <span>{label}</span>
  </label>
);

const TaskFiltersDrawer = ({
  open,
  onOpenChange,
  filters,
  onChange,
  assigneeOptions,
}: TaskFiltersDrawerProps) => {
  const toggleStatus = (value: string) => {
    const exists = filters.statuses.includes(value);
    const nextStatuses = exists
      ? filters.statuses.filter((status) => status !== value)
      : [...filters.statuses, value];
    onChange({ ...filters, statuses: nextStatuses });
  };

  const toggleAssignee = (value: string) => {
    const exists = filters.assigneeIds.includes(value);
    const nextAssignees = exists
      ? filters.assigneeIds.filter((id) => id !== value)
      : [...filters.assigneeIds, value];
    onChange({ ...filters, assigneeIds: nextAssignees });
  };

  const handleClear = () => {
    onChange({ ...emptyFilters });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "left-auto right-0 top-0 h-full max-w-md translate-x-0 translate-y-0 rounded-none border-l border-slate-800 bg-slate-900/95 p-0 sm:rounded-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
        )}
      >
        <div className="flex h-full flex-col">
          <DialogHeader className="border-b border-slate-800 px-6 py-4">
            <DialogTitle className="text-left text-base text-slate-100">Filtros</DialogTitle>
          </DialogHeader>

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-200">Status</p>
              <div className="space-y-2">
                {statusOptions.map((status) => (
                  <CheckboxField
                    key={status.value}
                    id={`status-${status.value}`}
                    checked={filters.statuses.includes(status.value)}
                    label={status.label}
                    onChange={(checked) => toggleStatus(status.value)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-200">Responsáveis</p>
              <div className="space-y-2">
                {assigneeOptions.length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhum membro disponível.</p>
                ) : (
                  assigneeOptions.map((assignee) => (
                    <CheckboxField
                      key={assignee.id}
                      id={`assignee-${assignee.id}`}
                      checked={filters.assigneeIds.includes(assignee.id)}
                      label={assignee.name}
                      onChange={(checked) => toggleAssignee(assignee.id)}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-200">Período</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="from">De</Label>
                  <Input
                    id="from"
                    type="date"
                    value={filters.from ?? ""}
                    onChange={(event) => onChange({ ...filters, from: event.target.value || null })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="to">Até</Label>
                  <Input
                    id="to"
                    type="date"
                    value={filters.to ?? ""}
                    onChange={(event) => onChange({ ...filters, to: event.target.value || null })}
                  />
                </div>
              </div>
              <CheckboxField
                id="include-without-date"
                checked={filters.includeWithoutDate}
                label="Incluir tarefas sem data"
                onChange={(checked) => onChange({ ...filters, includeWithoutDate: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Busca (título ou descrição)</Label>
              <Input
                id="search"
                placeholder="Buscar..."
                value={filters.search ?? ""}
                onChange={(event) => onChange({ ...filters, search: event.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4">
            <Button variant="outline" onClick={handleClear}>
              Limpar filtros
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskFiltersDrawer;
