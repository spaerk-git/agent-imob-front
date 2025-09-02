import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConversationCard from '@/components/ConversationCard';
import { useConversations } from '@/hooks/useConversations';
import { Skeleton } from '@/components/ui/skeleton';

const ConversationList = ({ selectedConversation, onSelectConversation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const { 
    conversations,
    counts, 
    isLoading, 
    isError 
  } = useConversations(activeTab, searchTerm);

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Conversas</h2>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="h-auto p-1 grid grid-cols-2 sm:grid-cols-4 gap-1">
            <TabsTrigger value="all" className="text-xs px-2 py-1.5">
              Todas ({isLoading ? '...' : counts.all})
            </TabsTrigger>
            <TabsTrigger value="unresolved" className="text-xs px-2 py-1.5">
              Não Resolvidas ({isLoading ? '...' : counts.unresolved})
            </TabsTrigger>
            <TabsTrigger value="human_requested" className="text-xs px-2 py-1.5">
              Humano ({isLoading ? '...' : counts.human_requested})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="text-xs px-2 py-1.5">
              Resolvidas ({isLoading ? '...' : counts.resolved})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
        {isLoading ? (
            <ConversationListSkeleton />
        ) : isError ? (
            <div className="text-center py-8 text-destructive">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>Erro ao carregar conversas.</p>
            </div>
        ) : conversations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="text-muted-foreground">
              {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa nesta categoria'}
            </div>
          </motion.div>
        ) : (
          conversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ConversationCard
                conversation={conversation}
                isSelected={selectedConversation?.id === conversation.id}
                onClick={() => onSelectConversation(conversation)}
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

const ConversationListSkeleton = () => (
    <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
        ))}
    </div>
);

export default ConversationList;