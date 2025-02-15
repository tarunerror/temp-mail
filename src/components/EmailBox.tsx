import React from 'react';
import { Mail } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import type { Email } from '../lib/types';

interface EmailBoxProps {
  email: Email;
  isSelected: boolean;
  onClick: () => void;
}

export function EmailBox({ email, isSelected, onClick }: EmailBoxProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 cursor-pointer transition-all duration-200",
        isSelected ? "bg-blue-50" : "hover:bg-gray-50",
        !email.read && "bg-blue-50/50"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
          !email.read ? "bg-blue-100" : "bg-gray-100"
        )}>
          <Mail className={cn(
            "w-5 h-5",
            !email.read ? "text-blue-600" : "text-gray-400"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <p className={cn(
              "font-medium truncate",
              !email.read ? "text-blue-600" : "text-gray-900"
            )}>
              {email.fromEmail}
            </p>
            <span className="text-sm text-gray-500 whitespace-nowrap ml-2">
              {formatDate(email.createdAt)}
            </span>
          </div>
          <p className={cn(
            "text-sm font-medium truncate mb-1",
            !email.read ? "text-blue-600" : "text-gray-800"
          )}>
            {email.subject}
          </p>
          <p className="text-sm text-gray-500 truncate leading-relaxed">
            {email.content}
          </p>
        </div>
      </div>
    </div>
  );
}