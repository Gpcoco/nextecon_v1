'use client';

import { useItems } from '@/hooks/useItems';
import { ItemsList } from '@/components/ItemsList';
import { CreateItemForm } from '@/components/CreateItemForm';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/utils/supabase';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Hook per gestire gli items con auto-refresh disabilitato per risparmiare banda
  const { 
    items, 
    loading, 
    error, 
    isCreating, 
    refresh, 
    createItem 
  } = useItems({
    autoRefresh: false, // Disabilitiamo auto-refresh per risparmiare banda mobile
  });
  
  // Verifica autenticazione
  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createBrowserClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push('/login');
          return;
        }
        
        setUser(user);
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/login');
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkUser();
    
    // Setup listener per cambio auth state
    const supabase = createBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
      }
    });
    
    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);
  
  // Loading state per auth check
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header minimalista */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Items Manager</h1>
              {user && (
                <p className="text-sm text-gray-500">{user.email}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Bottone refresh manuale */}
              <button
                onClick={refresh}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 
                         rounded-lg transition-colors disabled:opacity-50"
                aria-label="Refresh items"
              >
                <svg 
                  className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
              </button>
              
              {/* Bottone logout */}
              <button
                onClick={async () => {
                  const supabase = createBrowserClient();
                  await supabase.auth.signOut();
                }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 
                         hover:bg-gray-100 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form per creare nuovi items */}
        <CreateItemForm 
          onSubmit={createItem}
          isCreating={isCreating}
        />
        
        {/* Lista items */}
        <ItemsList 
          items={items}
          loading={loading}
          error={error}
        />
        
        {/* Footer con info */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p>💡 Tip: This page uses smart caching to reduce server load and save mobile data.</p>
            <p className="mt-1">Data refreshes automatically when you return to the app.</p>
          </div>
        </footer>
      </main>
      
      {/* Indicatore offline per mobile */}
      {typeof window !== 'undefined' && !navigator.onLine && (
        <div className="fixed bottom-4 left-4 right-4 bg-yellow-50 border border-yellow-200 
                      rounded-lg p-3 text-sm text-yellow-800 shadow-lg z-50">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Youre offline. Changes will sync when connection is restored.</span>
          </div>
        </div>
      )}
    </div>
  );
}