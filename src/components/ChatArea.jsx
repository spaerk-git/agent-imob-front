import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Pause, Play, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import MessageBubble from '@/components/MessageBubble';
import { cn } from '@/lib/utils';
import { useSendMessage, useUpdateConversationStatus } from '@/hooks/useConversations';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiGenericPost } from '@/lib/api/supabase';
import { formatDateHeader as formatDateHeaderUtil } from '@/lib/date';

const ChatArea = ({ conversation, onStatusChange }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [operatorId, setOperatorId] = useState(null);
  const messagesEndRef = useRef(null);
  
  const sendMessageMutation = useSendMessage();
  const updateStatusMutation = useUpdateConversationStatus(onStatusChange);

  const isAgentPaused = conversation?.status === 'humano_solicitado';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  useEffect(() => {
    const fetchOperatorId = async () => {
      if (user?.user?.id) {
        try {
          const data = await apiGet(`usuarios?select=id&id_auth=eq.${user.user.id}`);
          if (data && data.length > 0) {
            setOperatorId(data[0].id);
          } else {
            console.error("Operator not found in 'usuarios' table for auth id:", user.user.id);
          }
        } catch (error) {
          console.error("Failed to fetch operator ID", error);
        }
      }
    };
    fetchOperatorId();
  }, [user]);


  const handleSendMessage = async () => {
    if (!message.trim() || !isAgentPaused || !operatorId) return;

    const webhookUrl = `${import.meta.env.VITE_WEBHOOK_URL}/${import.meta.env.VITE_WEBHOOK_PATH}`;
    const payload = {
      conversa_id: conversation.id,
      mensagem: message,
      canal: 'painel',
      operador_id: operatorId
    };

    try {
      await apiGenericPost(webhookUrl, payload, {});
      setMessage('');
    } catch(error) {
       console.error("Failed to send message via webhook", error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    updateStatusMutation.mutate({ conversationId: conversation.id, status: newStatus });
  };

  const toggleAgentPause = () => {
    const newStatus = isAgentPaused ? 'nao_resolvida' : 'humano_solicitado';
    handleStatusChange(newStatus);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'nao_resolvida': return 'destructive';
      case 'humano_solicitado': return 'warning';
      case 'resolvida': return 'success';
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'nao_resolvida': return 'Não Resolvida';
      case 'humano_solicitado': return 'Humano Solicitado';
      case 'resolvida': return 'Resolvida';
      default: return 'Indefinido';
    }
  };

  const groupMessagesByDay = (messages) => {
    return (messages || []).reduce((groups, message) => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {});
  };

  const shouldGroupMessage = (currentMessage, previousMessage) => {
    if (!previousMessage) return false;
    const timeDiff = new Date(currentMessage.timestamp) - new Date(previousMessage.timestamp);
    const fiveMinutes = 5 * 60 * 1000;
    return currentMessage.sender === previousMessage.sender && timeDiff < fiveMinutes;
  };

  const messageGroups = groupMessagesByDay(conversation.messages);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.avatar} />
              <AvatarFallback className="bg-primary/20 text-primary">
                {conversation.customerName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{conversation.titulo || conversation.customerName}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{conversation.channel}</span>
                <span>•</span>
                <Badge variant={getStatusColor(conversation.status)} className="text-xs">
                  {getStatusText(conversation.status)}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isAgentPaused ? 'default' : 'secondary'}
              size="sm"
              onClick={toggleAgentPause}
              disabled={updateStatusMutation.isPending}
              className="flex items-center gap-2"
            >
              {isAgentPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {isAgentPaused ? 'Reativar IA' : 'Pausar IA'}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStatusChange('nao_resolvida')}>Marcar como Não Resolvida</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('humano_solicitado')}>Solicitar Humano</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('resolvida')}>Marcar como Resolvida</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Encerrar Conversa</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        <AnimatePresence>
          {Object.entries(messageGroups).map(([date, messages]) => (
            <div key={date} className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">{formatDateHeaderUtil(messages[0]?.timestamp)}</div>
              </div>
              <div className="space-y-2">
                {messages.map((msg, index) => (
                  <MessageBubble key={msg.id} message={msg} isGrouped={shouldGroupMessage(msg, messages[index - 1])} />
                ))}
              </div>
            </div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-border bg-card mt-auto flex-shrink-0">
        {!isAgentPaused && (
           <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
             <div className="flex items-center gap-2 text-sm text-destructive">
               <Pause className="h-4 w-4" />
               <span>IA está ativa. Pause-a para assumir o controle.</span>
             </div>
           </motion.div>
        )}
        <div className="flex items-center gap-2">
          <Input
            placeholder={isAgentPaused ? 'Digite sua mensagem...' : 'Para enviar mensagens, pause a IA'}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
            disabled={!isAgentPaused || sendMessageMutation.isPending}
          />
          <Button onClick={handleSendMessage} disabled={!message.trim() || !isAgentPaused || sendMessageMutation.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;