export default function DeletionModal({ 
  onConfirm, 
  onCancel, 
  message 
}: { 
  onConfirm: () => void; 
  onCancel: () => void; 
  message: string 
}) {
  return (
    // Overlay backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
      
      {/* Modal Container */}
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-stone-200/80 flex flex-col gap-6">
        
        {/* Header / Message */}
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-serif text-stone-900">
            {message}
          </h2>
          <p className="text-sm font-light text-stone-500">
            This action cannot be undone. All associated data will be permanently removed.
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-stone-100">
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-5 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-50 hover:border-stone-300 transition-all"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={onConfirm} 
            className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 shadow-sm transition-all"
          >
            Confirm Deletion
          </button>
        </div>
        
      </div>
    </div>
  )
}