import { generateId } from './utils';
import type { Email } from './types';

const API_URL = '/api';

export async function createTempMail(): Promise<{ email: string; token: string }> {
  try {
    const response = await fetch(`${API_URL}/create-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      email: data.email,
      token: data.token
    };
  } catch (error) {
    console.error('Error in createTempMail:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate temporary email: ${error.message}`);
    }
    throw new Error('Failed to generate temporary email');
  }
}

export async function fetchEmails(token: string): Promise<Email[]> {
  try {
    const response = await fetch(`${API_URL}/emails?token=${encodeURIComponent(token)}`, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch emails: ${response.status} ${response.statusText}`);
      return [];
    }

    const emails = await response.json();
    return emails.map((email: any) => ({
      id: email.id || generateId(),
      fromEmail: email.fromEmail || 'Unknown Sender',
      subject: email.subject || '(No Subject)',
      content: email.content || '(No Content)',
      createdAt: email.createdAt || new Date().toISOString(),
      read: email.read || false
    }));
  } catch (error) {
    console.warn('Error fetching emails:', error);
    return [];
  }
}