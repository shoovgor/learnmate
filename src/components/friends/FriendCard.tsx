
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserMinus, MessageCircle, UserPlus } from 'lucide-react';

interface FriendCardProps {
  id: string;
  displayName: string;
  photoURL?: string;
  school?: string;
  grade?: string;
  points?: number;
  completedQuizzes?: number;
  connectionId?: string;
  isFriend?: boolean;
  onAdd?: (friendId: string) => void;
  onRemove?: (connectionId: string, friendId: string) => void;
}

const FriendCard: React.FC<FriendCardProps> = ({
  id,
  displayName,
  photoURL,
  school,
  grade,
  points,
  completedQuizzes,
  connectionId,
  isFriend = false,
  onAdd,
  onRemove
}) => {
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
          <Avatar className="h-16 w-16">
            <AvatarImage src={photoURL} alt={displayName} />
            <AvatarFallback>{displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center sm:text-left">
            <Link to={`/profile/friends/${id}`} className="hover:underline">
              <h3 className="font-medium text-lg">{displayName}</h3>
            </Link>
            
            <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
              {school && (
                <Badge variant="outline">{school}</Badge>
              )}
              {grade && (
                <Badge variant="outline">Grade {grade}</Badge>
              )}
              {points !== undefined && (
                <Badge variant="secondary">{points} points</Badge>
              )}
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
              <Button size="sm" variant="outline" asChild>
                <Link to={`/profile/friends/${id}`}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </Button>
              
              <Button size="sm" variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
              
              {!isFriend && onAdd && (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-primary hover:bg-primary/10"
                  onClick={() => onAdd(id)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Friend
                </Button>
              )}
              
              {isFriend && connectionId && onRemove && (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => onRemove(connectionId, id)}
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FriendCard;
