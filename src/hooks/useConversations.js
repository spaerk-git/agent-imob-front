
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch } from '@/lib/api/supabase';
import { toast } from '@/components/ui/use-toast';
import { useMemo } from 'react';

const statusMap = {
  unresolved: 'nao_resolvida',
  human_requested: 'humano_solicitado',
  resolved: 'resolvida',
  all: null,
};

const mapConversationData = (c) => ({
    ...c,
    customerName: c.usuarios?.nome || 'Cliente',
    avatar: null,
    lastMessage: c.preview,
    lastMessageTime: c.ultima_interacao,
    agentName: 'Humano',
    lastAgent: 'agent',
    unreadCount: c.mensagens_nao_lidas || 0,
    channel: c.canal || 'whatsapp'
});

export const useConversations = (statusFilter = 'all', searchTerm = '') => {
  const queryKey = ['conversations', 'all'];
  
  const { data: allConversations, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: async () => {
      let path = 'conversas?select=*,usuarios(nome,tipo,role)&order=ultima_interacao.desc.nullslast';
      const conversations = await apiGet(path);
      return conversations.map(mapConversationData);
    },
    staleTime: Infinity, // Keep data fresh until invalidated by realtime
  });

  const { conversations, counts } = useMemo(() => {
    if (!allConversations) {
        return { 
            conversations: [], 
            counts: { all: 0, unresolved: 0, human_requested: 0, resolved: 0 } 
        };
    }
    
    const counts = {
        all: allConversations.length,
        unresolved: allConversations.filter(c => c.status === statusMap.unresolved).length,
        human_requested: allConversations.filter(c => c.status === statusMap.human_requested).length,
        resolved: allConversations.filter(c => c.status === statusMap.resolved).length,
    };

    const apiStatus = statusMap[statusFilter];
    let filtered = apiStatus 
        ? allConversations.filter(c => c.status === apiStatus)
        : allConversations;

    if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(c =>
            c.customerName?.toLowerCase().includes(lowerSearch) ||
            c.id?.toLowerCase().includes(lowerSearch)
        );
    }
    
    return { conversations: filtered, counts };

  }, [allConversations, statusFilter, searchTerm]);

  return {
    conversations,
    counts,
    isLoading,
    isError,
    error,
  };
};

export const useConversationMessages = (conversationId) => {
    return useQuery({
        queryKey: ['messages', conversationId],
        queryFn: async () => {
            if (!conversationId) return [];
            const messages = await apiGet(`mensagens?id_conversa=eq.${conversationId}&select=*,usuarios(nome,tipo,role)&order=criada_em.asc`);
            return messages.map(m => {
              const senderName = m.usuarios?.nome || 'IA Agente Imobiliário';
              const sender = senderName === 'Agent' ? 'agent' : 'user';
              
              return {
                id: m.id,
                content: m.conteudo,
                timestamp: m.criada_em,
                sender: sender,
                senderName: senderName,
                origem: m.origem,
                avatar: null
              };
            });
        },
        enabled: !!conversationId,
    });
};

export const useSendMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ conversationId, content, operatorId }) => 
            apiPost('mensagens', {
                id_conversa: conversationId,
                conteudo: content,
                id_usuario: operatorId,
            }),
        onSuccess: (newMessage, variables) => {
            queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            toast({ title: 'Mensagem enviada!', variant: 'success' });
        },
        onError: (error) => {
          toast({ title: 'Erro ao enviar mensagem', description: error.message, variant: 'destructive' });
        }
    });
};

export const useUpdateConversationStatus = (onSuccessCallback) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ conversationId, status }) =>
            apiPatch(`conversas?id=eq.${conversationId}`, { status }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });

            if (onSuccessCallback) {
                onSuccessCallback(variables.status);
            }

            const statusText = {
                nao_resolvida: 'Não Resolvida',
                humano_solicitado: 'Humano Solicitado',
                resolvida: 'Resolvida',
              };
            toast({ title: 'Status atualizado!', description: `Conversa marcada como: ${statusText[variables.status]}`, variant: 'success' });
        },
        onError: (error) => {
            toast({ title: 'Erro ao atualizar status', description: error.message, variant: 'destructive' });
        }
    });
};