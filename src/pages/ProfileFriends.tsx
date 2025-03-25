
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import FriendCard from '@/components/friends/FriendCard';
import { getTranslation } from '@/utils/translations';
import { toast } from 'sonner';
import { db, auth } from '@/config/firebaseConfig';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';
import { 
  getFriends, 
  getFriendRequests, 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  removeFriend, 
  searchUsers 
} from '@/services/friendService';
import { User } from '@/models/user';
import { UserCircle, Search, UserPlus, UserX } from 'lucide-react';

const ProfileFriends = () => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'mn');
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }

    const fetchFriends = async () => {
      setIsLoading(true);
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          const friendsData = await getFriends(userId);
          const requestsData = await getFriendRequests(userId);
          setFriends(friendsData);
          setRequests(requestsData);
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
        toast.error(getTranslation(language, 'errorFetchingFriends'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriends();
  }, [language, navigate]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error(getTranslation(language, 'errorSearchingUsers'));
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFriend = async (friendId: string) => {
    try {
      await sendFriendRequest(friendId);
      toast.success(getTranslation(language, 'friendRequestSent'));
      
      // Refresh search results
      if (searchQuery) {
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error(getTranslation(language, 'errorSendingFriendRequest'));
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      toast.success(getTranslation(language, 'friendRequestAccepted'));
      
      // Refresh friends and requests
      const userId = auth.currentUser?.uid;
      if (userId) {
        const friendsData = await getFriends(userId);
        const requestsData = await getFriendRequests(userId);
        setFriends(friendsData);
        setRequests(requestsData);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error(getTranslation(language, 'errorAcceptingFriendRequest'));
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      toast.success(getTranslation(language, 'friendRequestRejected'));
      
      // Refresh requests
      const userId = auth.currentUser?.uid;
      if (userId) {
        const requestsData = await getFriendRequests(userId);
        setRequests(requestsData);
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error(getTranslation(language, 'errorRejectingFriendRequest'));
    }
  };

  const handleRemoveFriend = async (connectionId: string, friendId: string) => {
    try {
      await removeFriend(connectionId);
      toast.success(getTranslation(language, 'friendRemoved'));
      
      // Refresh friends
      const userId = auth.currentUser?.uid;
      if (userId) {
        const friendsData = await getFriends(userId);
        setFriends(friendsData);
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error(getTranslation(language, 'errorRemovingFriend'));
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <MainNavigation />
      
      <main className="flex-1 container max-w-screen-xl mx-auto px-4 py-8 mt-16">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">{getTranslation(language, 'friends')}</h1>
          
          <Tabs defaultValue="friends">
            <TabsList className="mb-6">
              <TabsTrigger value="friends">{getTranslation(language, 'friends')}</TabsTrigger>
              <TabsTrigger value="requests">{getTranslation(language, 'requests')}</TabsTrigger>
              <TabsTrigger value="search">{getTranslation(language, 'findFriends')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="friends">
              <Card>
                <CardHeader>
                  <CardTitle>{getTranslation(language, 'yourFriends')}</CardTitle>
                  <CardDescription>{getTranslation(language, 'manageYourFriends')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center p-4">{getTranslation(language, 'loading')}...</div>
                  ) : friends.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {friends.map((friend) => (
                        <FriendCard
                          key={friend.id}
                          id={friend.id}
                          displayName={friend.displayName}
                          photoURL={friend.photoURL}
                          school={friend.school}
                          grade={friend.grade}
                          points={friend.points}
                          connectionId={friend.connectionId}
                          isFriend={true}
                          onRemove={handleRemoveFriend}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <UserCircle className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p>{getTranslation(language, 'noFriendsYet')}</p>
                      <p className="text-sm text-muted-foreground mt-1">{getTranslation(language, 'goToFindFriends')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <CardTitle>{getTranslation(language, 'friendRequests')}</CardTitle>
                  <CardDescription>{getTranslation(language, 'pendingFriendRequests')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center p-4">{getTranslation(language, 'loading')}...</div>
                  ) : requests.length > 0 ? (
                    <div className="space-y-4">
                      {requests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center">
                            <UserCircle className="h-10 w-10 text-muted-foreground mr-3" />
                            <div>
                              <p className="font-medium">{request.sender.displayName}</p>
                              <p className="text-sm text-muted-foreground">{request.sender.email}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAcceptRequest(request.id)}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              {getTranslation(language, 'accept')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleRejectRequest(request.id)}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              {getTranslation(language, 'reject')}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <UserCircle className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p>{getTranslation(language, 'noFriendRequests')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="search">
              <Card>
                <CardHeader>
                  <CardTitle>{getTranslation(language, 'findFriends')}</CardTitle>
                  <CardDescription>{getTranslation(language, 'searchForFriends')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2 mb-6">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={getTranslation(language, 'searchByNameOrEmail')}
                      className="flex-1"
                    />
                    <Button onClick={handleSearch} disabled={isSearching}>
                      {isSearching ? (
                        getTranslation(language, 'searching') + '...'
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          {getTranslation(language, 'search')}
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {searchResults.map((user) => (
                        <FriendCard
                          key={user.id}
                          id={user.id}
                          displayName={user.displayName}
                          photoURL={user.photoURL}
                          school={user.school}
                          grade={user.grade}
                          points={user.points}
                          isFriend={false}
                          onAdd={handleAddFriend}
                        />
                      ))}
                    </div>
                  ) : searchQuery && !isSearching ? (
                    <div className="text-center p-4">
                      <Search className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p>{getTranslation(language, 'noUsersFound')}</p>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <Search className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p>{getTranslation(language, 'searchToFindFriends')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProfileFriends;
