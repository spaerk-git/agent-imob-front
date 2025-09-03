import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTimestampRelative } from '@/lib/date';

const ConversationCard = ({ conversation, isSelected, onClick }) => {
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
      case 'humano_solicitado': return 'Humano';
      case 'resolvida': return 'Resolvida';
      default: return null;
    }
  };
  
  const statusText = getStatusText(conversation.status);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-lg",
        isSelected 
          ? "bg-primary/10 border-primary shadow-md" 
          : "bg-card border-border hover:bg-accent"
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={conversation.avatar} />
          <AvatarFallback className="bg-primary/20 text-primary">
            {conversation.customerName?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground truncate">
              {conversation.titulo || conversation.customerName}
            </h3>
            {conversation.unreadCount > 0 && (
              <Badge variant="destructive" className="flex-shrink-0 ml-2">
                {conversation.unreadCount}
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {statusText && (
                <Badge variant={getStatusColor(conversation.status)} className="text-[10px] px-1.5 py-0.5">
                    {statusText}
                </Badge>
            )}
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="h-3 w-3" />
              {formatTimestampRelative(conversation.ultima_interacao)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ConversationCard;