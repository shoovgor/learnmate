
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CommunityQuestionFormProps {
  communityId: string;
  subjectId: string;
  onCancel: () => void;
  onSubmit: (data: { title: string; content: string }) => void;
}

const CommunityQuestionForm: React.FC<CommunityQuestionFormProps> = ({
  communityId,
  subjectId,
  onCancel,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!title.trim()) {
      setError('Please enter a question title');
      return;
    }
    
    if (!content.trim()) {
      setError('Please enter question details');
      return;
    }
    
    if (title.trim().length < 10) {
      setError('Question title must be at least 10 characters');
      return;
    }
    
    // Clear any previous errors
    setError('');
    
    // Submit the form
    onSubmit({ title, content });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">Ask a Question</h3>
      
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <label htmlFor="question-title" className="text-sm font-medium">
          Question Title
        </label>
        <Input
          id="question-title"
          placeholder="e.g., How do I solve this equation: x² + 5x - 3 = 0?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Be specific with your question title to help others understand your problem
        </p>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="question-content" className="text-sm font-medium">
          Question Details
        </label>
        <Textarea
          id="question-content"
          placeholder="Explain your question in detail. Include any steps you've already tried..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Post Question
        </Button>
      </div>
    </form>
  );
};

export default CommunityQuestionForm;
