'use client';

import { useState, FormEvent, memo } from 'react';
import { CreateItemInput } from '@/types/items';

interface CreateItemFormProps {
  onSubmit: (input: CreateItemInput) => Promise<boolean>;
  isCreating: boolean;
}

export const CreateItemForm = memo(({ onSubmit, isCreating }: CreateItemFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    const success = await onSubmit({
      item_name: name.trim(),
      item_description: description.trim() || undefined,
    });
    
    if (success) {
      // Reset form on success
      setName('');
      setDescription('');
      setIsExpanded(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Create New Item</h2>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label={isExpanded ? 'Collapse form' : 'Expand form'}
        >
          <svg 
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {/* Form collassabile per risparmiare spazio su mobile */}
      {isExpanded && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="item-name" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Item Name *
            </label>
            <input
              id="item-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item name"
              maxLength={255}
              required
              disabled={isCreating}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       disabled:bg-gray-100 disabled:cursor-not-allowed
                       transition-colors"
            />
          </div>
          
          <div>
            <label 
              htmlFor="item-description" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description (Optional)
            </label>
            <textarea
              id="item-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter item description"
              maxLength={1000}
              rows={3}
              disabled={isCreating}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       disabled:bg-gray-100 disabled:cursor-not-allowed
                       transition-colors resize-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              {description.length}/1000 characters
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isCreating || !name.trim()}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md 
                       hover:bg-blue-700 focus:outline-none focus:ring-2 
                       focus:ring-offset-2 focus:ring-blue-500 
                       disabled:bg-gray-400 disabled:cursor-not-allowed 
                       transition-colors duration-200 font-medium"
            >
              {isCreating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Item'
              )}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setName('');
                setDescription('');
                setIsExpanded(false);
              }}
              disabled={isCreating}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md 
                       hover:bg-gray-50 focus:outline-none focus:ring-2 
                       focus:ring-offset-2 focus:ring-gray-500 
                       disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      
      {/* Quick add button quando il form è collassato */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full py-2 px-4 bg-gray-50 border border-gray-300 rounded-md 
                   text-gray-700 hover:bg-gray-100 transition-colors duration-200 
                   flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Item
        </button>
      )}
    </div>
  );
});

CreateItemForm.displayName = 'CreateItemForm';