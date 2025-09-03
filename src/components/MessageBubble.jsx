import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime as formatTimeUtil } from '@/lib/date';
import ReactMarkdown from 'react-markdown';

const MessageBubble = ({ message, isGrouped = false }) => {  
  const isAgent = message.origem === 'agent' || message.origem === 'painel';

  const getSenderIcon = () => {
    if (isAgent) return <UserCheck className="h-4 w-4" />;
    if (message.sender === 'bot') return <Bot className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };
  
  const getSenderColor = () => {
    if (isAgent) return 'text-sky-400';
    if (message.sender === 'bot') return 'text-blue-400';
    return 'text-purple-400';
  };

  const getBubbleStyle = () => {
    if (isAgent) {
        return 'bg-primary text-primary-foreground';
    }
    return 'bg-secondary text-secondary-foreground dark:bg-muted dark:text-foreground';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 group w-full",
        isAgent ? "flex-row-reverse" : "flex-row",
        isGrouped && "mt-1"
      )}
    >
      {!isGrouped && (
        <Avatar className={cn("h-8 w-8 flex-shrink-0", isAgent && "hidden")}>
          <AvatarImage src={message.avatar} />
          <AvatarFallback className={cn("text-xs", getSenderColor())}>
            {getSenderIcon()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col max-w-[85%]", isAgent ? "items-end" : "items-start", isGrouped && !isAgent && "ml-11", isGrouped && isAgent)}>
        {!isGrouped && (
          <div className={cn("flex items-center gap-2 mb-1 text-xs text-muted-foreground", isAgent && "flex-row-reverse")}>
            <span className={cn("font-medium", getSenderColor())}>
              {message.senderName || 'Desconhecido'}
            </span>
            <span>{formatTimeUtil(message.timestamp)}</span>
          </div>
        )}

        <div className={cn(
          "px-4 py-2 rounded-lg text-sm w-fit break-words whitespace",
          getBubbleStyle(),
          isGrouped ? "mt-1" : ""
        )}>
          <ReactMarkdown>{message.content.replace(/\\n/g, '\n')}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
