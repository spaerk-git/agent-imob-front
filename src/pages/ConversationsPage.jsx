import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ConversationList from '@/components/ConversationList';
import ChatArea from '@/components/ChatArea';
import { useConversationMessages } from '@/hooks/useConversations';
import { Skeleton } from '@/components/ui/skeleton';
import { Building, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ConversationsPage() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  
  const { 
    data: messages, 
    isLoading: isLoadingMessages, 
    isError: isErrorMessages 
  } = useConversationMessages(selectedConversation?.id);
  
  const handleStatusChange = useCallback((newStatus) => {
    setSelectedConversation(prev => {
        if (!prev) return null;
        return { ...prev, status: newStatus };
    });
  }, []);

  const conversationWithMessages = useMemo(() => {
    if (!selectedConversation) return null;
    return {
      ...selectedConversation,
      messages: messages || [],
    };
  }, [selectedConversation, messages]);

  const ChatAreaContent = () => {
    if (isLoadingMessages) {
        return <ChatSkeleton />;
    }

    if (isErrorMessages) {
        return <div className="h-full flex items-center justify-center bg-background text-destructive p-8">Erro ao carregar mensagens.</div>;
    }
    
    if (!conversationWithMessages) {
      return (
        <div className="h-full flex items-center justify-center bg-background text-center text-muted-foreground p-8">
          <div>
            <Building className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold">Selecione uma conversa</h3>
            <p>Escolha uma conversa da lista para ver os detalhes.</p>
          </div>
        </div>
      );
    }
    
    return <ChatArea key={selectedConversation.id} conversation={conversationWithMessages} onStatusChange={handleStatusChange} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(320px,_1fr)_3fr] lg:grid-cols-[minmax(350px,_1fr)_4fr] h-[calc(100vh-theme(space.16))]">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="h-full hidden md:flex flex-col border-r border-border overflow-hidden"
      >
        <ConversationList
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
        />
      </motion.div>
      
      <div className="h-full md:hidden">
        <AnimatePresence>
            {!selectedConversation ? (
                 <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                 >
                    <ConversationList
                        selectedConversation={selectedConversation}
                        onSelectConversation={setSelectedConversation}
                    />
                 </motion.div>
            ) : null}
        </AnimatePresence>
      </div>


      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden md:flex flex-col h-full overflow-hidden"
      >
        <ChatAreaContent />
      </motion.div>

      <AnimatePresence>
        {selectedConversation && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-40 bg-background md:hidden flex flex-col h-screen"
          >
            <div className="p-2 border-b border-border bg-card flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedConversation(null)}
                className="flex items-center gap-2 text-primary hover:text-primary/80"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
                <ChatAreaContent />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ChatSkeleton = () => (
    <div className="h-full flex flex-col bg-background">
        <div className="p-4 border-b border-border bg-card flex items-center gap-3 flex-shrink-0">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
            </div>
        </div>
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div className="flex items-end gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-12 w-3/4 rounded-lg" />
            </div>
            <div className="flex items-end flex-row-reverse gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-16 w-2/3 rounded-lg" />
            </div>
            <div className="flex items-end gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-10 w-1/2 rounded-lg" />
            </div>
        </div>
        <div className="p-4 border-t border-border bg-card flex items-center gap-2 mt-auto flex-shrink-0">
            <Skeleton className="h-10 flex-1 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
        </div>
    </div>
)

export default ConversationsPage;