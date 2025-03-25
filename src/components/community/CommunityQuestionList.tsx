
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  CheckCircle,
  Clock,
  ThumbsUp
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

interface CommunityQuestionListProps {
  communityId: string;
  subjectId: string;
  filter: 'all' | 'open' | 'closed' | 'my';
}

// Mock data for demonstration
const mockQuestions = [
  {
    id: '1',
    title: 'How do I solve this quadratic equation: 2x² + 5x - 3 = 0?',
    content: 'I\'ve been trying to solve this using the quadratic formula but I keep getting confused with the steps.',
    author: 'StudentA',
    createdAt: '2023-10-15T10:30:00',
    community: 'hs-1',
    subject: 'math',
    isClosed: false,
    replies: 3,
    likes: 2
  },
  {
    id: '2',
    title: 'Help with Shakespeare\'s Macbeth themes analysis',
    content: 'I need to write a 3-page essay on the major themes in Macbeth. Anyone have tips on how to structure this?',
    author: 'BookLover22',
    createdAt: '2023-10-14T15:45:00',
    community: 'hs-1',
    subject: 'eng',
    isClosed: true,
    replies: 5,
    likes: 7
  },
  {
    id: '3',
    title: 'CHEMISTRY: How to balance this redox reaction?',
    content: 'I\'m struggling with balancing this redox reaction in acidic medium: MnO4⁻ + Fe²⁺ → Mn²⁺ + Fe³⁺',
    author: 'ChemWhiz',
    createdAt: '2023-10-13T09:15:00',
    community: 'hs-2',
    subject: 'sci',
    isClosed: false,
    replies: 2,
    likes: 1
  },
  {
    id: '4',
    title: 'Need help understanding linked lists in C++',
    content: 'I\'m trying to implement a doubly linked list but I keep getting segmentation faults. Can someone explain the memory management?',
    author: 'CodeNewbie',
    createdAt: '2023-10-12T14:20:00',
    community: 'uni-1',
    subject: 'cs',
    isClosed: false,
    replies: 8,
    likes: 12
  },
  {
    id: '5',
    title: 'American Civil War - Key Turning Points',
    content: 'I\'m preparing for a history exam and need help identifying the 3 most significant turning points in the American Civil War.',
    author: 'HistoryBuff',
    createdAt: '2023-10-11T11:05:00',
    community: 'hs-2',
    subject: 'hist',
    isClosed: true,
    replies: 6,
    likes: 9
  }
];

const CommunityQuestionList: React.FC<CommunityQuestionListProps> = ({ 
  communityId, 
  subjectId, 
  filter 
}) => {
  // In a real app, you would fetch questions from your backend
  // based on the communityId, subjectId, and filter
  const filteredQuestions = mockQuestions.filter(question => {
    // Filter by community and subject
    const matchesCommunityAndSubject = 
      question.community === communityId && 
      question.subject === subjectId;
    
    // Apply additional filters
    if (filter === 'open') {
      return matchesCommunityAndSubject && !question.isClosed;
    } else if (filter === 'closed') {
      return matchesCommunityAndSubject && question.isClosed;
    } else if (filter === 'my') {
      // For demo, we'll just show a subset
      return matchesCommunityAndSubject && question.author === 'StudentA';
    }
    
    return matchesCommunityAndSubject;
  });

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (filteredQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-muted/40 rounded-lg border border-dashed">
        <p className="text-muted-foreground mb-2">No questions found</p>
        <Button variant="outline" size="sm">
          Ask a Question
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredQuestions.map((question) => (
        <div 
          key={question.id} 
          className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <Link to={`/community/question/${question.id}`} className="text-lg font-medium hover:text-primary">
              {question.title}
            </Link>
            {question.isClosed && (
              <Badge className="flex items-center gap-1 bg-green-500">
                <CheckCircle className="h-3 w-3" />
                Solved
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {question.content}
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>{question.author}</span>
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatDate(question.createdAt)}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <MessageSquare className="h-3 w-3 mr-1" />
                {question.replies} replies
              </span>
              <span className="flex items-center">
                <ThumbsUp className="h-3 w-3 mr-1" />
                {question.likes}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommunityQuestionList;
