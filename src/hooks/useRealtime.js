
import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/customSupabaseClient';

export const useRealtime = (selectedConversationId) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleChanges = (payload) => {
      console.log('Realtime event received:', payload);
      
      const isMessageEvent = payload.table === 'mensagens';
      const isConversationEvent = payload.table === 'conversas';
      const conversationsQueryKey = ['conversations', 'all'];

      if (isMessageEvent) {
        const newMessage = payload.new;
        
        // Invalidate messages for the specific conversation if it's open
        if (newMessage.id_conversa === selectedConversationId) {
          queryClient.invalidateQueries({ queryKey: ['messages', newMessage.id_conversa] });
        }

        // Manually update the conversations list cache
        queryClient.setQueryData(conversationsQueryKey, (oldData) => {
          if (!oldData) return oldData;

          const conversationIndex = oldData.findIndex(c => c.id === newMessage.id_conversa);
          
          if (conversationIndex > -1) {
            const updatedConversation = {
              ...oldData[conversationIndex],
              ultima_interacao: newMessage.criada_em,
              preview: newMessage.conteudo,
              mensagens_nao_lidas: (oldData[conversationIndex].mensagens_nao_lidas || 0) + 1,
            };

            const newData = [...oldData];
            newData.splice(conversationIndex, 1);
            newData.unshift(updatedConversation); // Move to top
            return newData;
          }
          
          // If conversation is not in the list, invalidate to refetch everything
          queryClient.invalidateQueries({ queryKey: conversationsQueryKey });
          return oldData;
        });
      }

      if (isConversationEvent) {
         // Invalidate conversation list for any change (status, etc.)
        queryClient.invalidateQueries({ queryKey: conversationsQueryKey });
      }
    };

    const subscription = supabase
      .channel('public-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mensagens' },
        handleChanges
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversas' },
        handleChanges
      )
      .subscribe();

    console.log('Subscribed to realtime changes.');

    return () => {
      console.log('Unsubscribing from realtime changes.');
      supabase.removeChannel(subscription);
    };
  }, [queryClient, selectedConversationId]);
};