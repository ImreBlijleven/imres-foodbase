interface Props {
  steps: string[];
  onChange: (steps: string[]) => void;
}

export function StepsEditor({ steps, onChange }: Props) {
  function update(index: number, value: string) {
    onChange(steps.map((s, i) => (i === index ? value : s)));
  }

  function add() {
    onChange([...steps, '']);
  }

  function remove(index: number) {
    onChange(steps.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-2 items-start">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-1.5"
            style={{ background: 'rgba(45,74,62,0.1)', color: 'var(--c-forest)' }}
          >
            {i + 1}
          </span>
          <textarea
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-300"
            placeholder={`Stap ${i + 1}`}
            rows={2}
            value={step}
            onChange={(e) => update(i, e.target.value)}
          />
          <button
            onClick={() => remove(i)}
            className="text-gray-300 text-xl leading-none flex-shrink-0 mt-1.5 active:text-red-400"
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="text-sm text-green-600 font-medium active:text-green-700"
      >
        + Stap
      </button>
    </div>
  );
}
