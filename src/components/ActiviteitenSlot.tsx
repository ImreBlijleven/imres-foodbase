import { useState, useRef, useEffect } from 'react';
import type { ActivityItem, ActivityPosition } from '../types';
import { useKeyboardBottom } from '../hooks/useKeyboardBottom';

interface Props {
  items: ActivityItem[];
  position: ActivityPosition;
  onAdd: (text: string) => void;
  onUpdate: (id: string, text: string) => void;
  onRemove: (id: string) => void;
}

interface SheetState {
  mode: 'add' | 'edit';
  id?: string;
  text: string;
}

export function ActiviteitenSlot({ items, onAdd, onUpdate, onRemove, position: _position }: Props) {
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const keyboardBottom = useKeyboardBottom(sheet !== null);

  useEffect(() => {
    if (sheet) setTimeout(() => textareaRef.current?.focus(), 50);
  }, [sheet]);

  function openAdd() {
    setSheet({ mode: 'add', text: '' });
  }

  function openEdit(item: ActivityItem) {
    setSheet({ mode: 'edit', id: item.id, text: item.text });
  }

  function handleSave() {
    if (!sheet) return;
    const text = sheet.text.trim();
    if (text) {
      if (sheet.mode === 'add') onAdd(text);
      else if (sheet.id) onUpdate(sheet.id, text);
    }
    setSheet(null);
  }

  function handleDelete() {
    if (sheet?.id) onRemove(sheet.id);
    setSheet(null);
  }

  return (
    <>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => openEdit(item)}
            className="w-full text-left text-[10px] text-gray-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 leading-snug truncate active:bg-amber-100"
          >
            {item.text}
          </button>
        ))}
        <button
          onClick={openAdd}
          className="w-full text-[10px] text-gray-300 hover:text-gray-400 text-center leading-none py-0.5"
        >
          + activiteit
        </button>
      </div>

      {sheet && (
        <div className="fixed inset-0 z-50" onClick={() => setSheet(null)}>
          <div
            className="absolute left-0 right-0 bg-white rounded-t-2xl p-4 pb-8 shadow-2xl"
            style={{ bottom: keyboardBottom }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <p className="text-sm font-semibold text-gray-700 mb-3">
              {sheet.mode === 'add' ? 'Activiteit toevoegen' : 'Activiteit bewerken'}
            </p>
            <textarea
              ref={textareaRef}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
              rows={3}
              value={sheet.text}
              placeholder="Hardlopen, wijncursus, afspraak..."
              onChange={(e) => setSheet((s) => s ? { ...s, text: e.target.value } : s)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); } }}
            />
            <div className="flex gap-2 mt-3">
              {sheet.mode === 'edit' && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2.5 bg-red-50 text-red-500 font-medium rounded-xl active:bg-red-100 text-sm"
                >
                  Verwijder
                </button>
              )}
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-gray-800 text-white font-semibold rounded-xl active:bg-gray-700 text-sm"
              >
                {sheet.mode === 'add' ? 'Toevoegen' : 'Opslaan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
