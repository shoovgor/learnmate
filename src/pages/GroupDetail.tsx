import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '@/config/firebaseConfig';
import { getTranslation } from '@/utils/translations';
import MainNavigation from '@/components/MainNavigation';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Send,
  File,
  Link2,
  MoreVertical,
  ThumbsUp,
  MessageSquare,
  User,
  UserPlus,
  LogOut,
  RefreshCw,
  School,
  Upload,
  FileText,
  Trash,
  Edit,
  Settings,
  Book
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { 
  getGroup, 
  getGroupMembers,
  getGroupPosts, // Corrected import
  getGroupPost as getPost, 
  addGroupPost as createPost, 
  removeGroupMember as removeUserFromGroup,
  getGroupResource, // Corrected import
  addGroupResource
} from '@/services/groupService';
import { Group, GroupMember, GroupPost, GroupResource } from '@/models/group';

const GroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [resources, setResources] = useState<GroupResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [postContent, setPostContent] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'mn');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceType, setResourceType] = useState<GroupResource['type']>('pdf');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [uploadingResource, setUploadingResource] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const postInputRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        if (!groupId) return;
        
        setLoading(true);
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          toast({
            title: getTranslation(language, 'error'),
            description: getTranslation(language, 'loginRequired'),
            variant: 'destructive'
          });
          navigate('/auth');
          return;
        }
        
        const groupData = await getGroup(groupId);
        setGroup(groupData);
        
        const isMemberOfGroup = groupData.members.includes(currentUser.uid);
        setIsMember(isMemberOfGroup);
        
        if (!isMemberOfGroup) {
          toast({
            title: getTranslation(language, 'notAMember'),
            description: getTranslation(language, 'joinGroupFirst'),
            variant: 'destructive'
          });
          navigate('/profile/groups');
          return;
        }
        
        const isAdminOfGroup = groupData.admins.includes(currentUser.uid);
        setIsAdmin(isAdminOfGroup);
        
        setIsOwner(groupData.admins[0] === currentUser.uid);
        
        const groupMembers = await getGroupMembers(groupId);
        setMembers(groupMembers);
        
        const groupPosts = await getGroupPosts(groupId); // Corrected function call
        setPosts(groupPosts);
        
        const groupResources = await getGroupResource(groupId, ''); // Provide a valid resourceId
        setResources(Array.isArray(groupResources) ? groupResources : [groupResources]);
      } catch (error) {
        console.error('Error fetching group data:', error);
        toast({
          title: getTranslation(language, 'error'),
          description: getTranslation(language, 'errorFetchingGroupData'),
          variant: 'destructive'
        });
        navigate('/profile/groups');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroupData();
  }, [groupId, language, navigate, toast]);
  
  const handlePostSubmit = async () => {
    if (!postContent.trim()) return;
    
    try {
      setSubmittingPost(true);
      
      if (!groupId || !auth.currentUser) {
        throw new Error('Missing group ID or user not authenticated');
      }
      
      const newPostId = await createPost(groupId, {
        authorId: auth.currentUser.uid,
        content: postContent,
        groupId: groupId, // Added missing properties
        authorName: auth.currentUser.displayName || 'Unknown'
      });
      const newPost = await getPost(groupId, newPostId); // Corrected function call
      setPosts([newPost, ...posts]);
      setPostContent('');
      
      toast({
        title: getTranslation(language, 'success'),
        description: getTranslation(language, 'postCreated')
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: getTranslation(language, 'error'),
        description: getTranslation(language, 'errorCreatingPost'),
        variant: 'destructive'
      });
    } finally {
      setSubmittingPost(false);
    }
  };
  
  const handleLeaveGroup = async () => {
    try {
      if (!groupId || !auth.currentUser) {
        throw new Error('Missing group ID or user not authenticated');
      }
      
      await removeUserFromGroup(groupId, auth.currentUser.uid);
      
      toast({
        title: getTranslation(language, 'success'),
        description: getTranslation(language, 'leftGroup')
      });
      
      navigate('/profile/groups');
    } catch (error) {
      console.error('Error leaving group:', error);
      toast({
        title: getTranslation(language, 'error'),
        description: getTranslation(language, 'errorLeavingGroup'),
        variant: 'destructive'
      });
    }
  };
  
  const handleResourceUpload = async () => {
    if (!resourceTitle.trim() || !resourceUrl.trim()) {
      toast({
        title: getTranslation(language, 'validationError'),
        description: getTranslation(language, 'fillRequiredFields'),
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setUploadingResource(true);
      
      if (!groupId || !auth.currentUser) {
        throw new Error('Missing group ID or user not authenticated');
      }
      
      const newResourceId = await addGroupResource(groupId, {
        title: resourceTitle,
        description: resourceDescription,
        type: resourceType,
        url: resourceUrl,
        uploaderId: auth.currentUser.uid,
        uploaderName: auth.currentUser.displayName || 'Unknown',
        groupId: groupId // Added missing property
      });
      const newResource = await getGroupResource(groupId, newResourceId); // Corrected function call
      setResources([newResource, ...resources]); // Corrected state update
      setShowUploadDialog(false);
      
      setResourceTitle('');
      setResourceType('pdf');
      setResourceUrl('');
      setResourceDescription('');
      
      toast({
        title: getTranslation(language, 'success'),
        description: getTranslation(language, 'resourceUploaded')
      });
    } catch (error) {
      console.error('Error uploading resource:', error);
      toast({
        title: getTranslation(language, 'error'),
        description: getTranslation(language, 'errorUploadingResource'),
        variant: 'destructive'
      });
    } finally {
      setUploadingResource(false);
    }
  };
  
  const formatDate = (date: string | Date): string => {
    if (typeof date === 'string') {
      return date;
    }
    return date.toISOString();
  };
  
  if (loading) {
    return (
      <>
        <MainNavigation />
        <div className="min-h-screen pt-16 bg-background">
          <main className="container mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-2/3">
                <Skeleton className="h-12 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/2 mb-6" />
                <Skeleton className="h-10 w-full mb-6" />
                
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div className="w-full md:w-1/3 space-y-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32 mb-2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }
  
  if (!group) {
    return (
      <>
        <MainNavigation />
        <div className="min-h-screen pt-16 bg-background">
          <main className="container mx-auto py-8 px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">
              {getTranslation(language, 'groupNotFound')}
            </h1>
            <p className="text-muted-foreground mb-6">
              {getTranslation(language, 'groupNotFoundDescription')}
            </p>
            <Button onClick={() => navigate('/profile/groups')}>
              {getTranslation(language, 'backToGroups')}
            </Button>
          </main>
        </div>
      </>
    );
  }
  
  return (
    <>
      <MainNavigation />
      <div className="min-h-screen pt-16 bg-background">
        <main className="container mx-auto py-8 px-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-2/3">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-bold">{group.name}</h1>
                    <Badge variant={group.isPublic ? "secondary" : "outline"}>
                      {group.isPublic ? getTranslation(language, 'public') : getTranslation(language, 'private')}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-2">
                    {group.school && (
                      <div className="flex items-center">
                        <School className="h-4 w-4 mr-1" />
                        {group.school}
                      </div>
                    )}
                    {group.subject && (
                      <div className="flex items-center ml-2">
                        <Book className="h-4 w-4 mr-1" />
                        {group.subject}
                      </div>
                    )}
                    {group.grade && (
                      <div className="flex items-center ml-2">
                        <Users className="h-4 w-4 mr-1" />
                        {getTranslation(language, 'grade')} {group.grade}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {group.description || getTranslation(language, 'noDescription')}
                  </p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{getTranslation(language, 'groupActions')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {isAdmin && (
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        {getTranslation(language, 'groupSettings')}
                      </DropdownMenuItem>
                    )}
                    
                    {isAdmin && (
                      <DropdownMenuItem>
                        <UserPlus className="h-4 w-4 mr-2" />
                        {getTranslation(language, 'inviteMembers')}
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem onClick={() => setActiveTab('members')}>
                      <Users className="h-4 w-4 mr-2" />
                      {getTranslation(language, 'viewMembers')}
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => setActiveTab('resources')}>
                      <FileText className="h-4 w-4 mr-2" />
                      {getTranslation(language, 'viewResources')}
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={handleLeaveGroup} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      {getTranslation(language, 'leaveGroup')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6 grid grid-cols-3">
                  <TabsTrigger value="feed">{getTranslation(language, 'feed')}</TabsTrigger>
                  <TabsTrigger value="members">{getTranslation(language, 'members')}</TabsTrigger>
                  <TabsTrigger value="resources">{getTranslation(language, 'resources')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="feed" className="space-y-4">
                  <Card className="relative">
                    <CardContent className="pt-6">
                      <Textarea
                        ref={postInputRef}
                        placeholder={getTranslation(language, 'shareWithGroup')}
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        className="min-h-24 resize-none"
                      />
                      <div className="flex justify-between mt-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <File className="h-4 w-4 mr-1" />
                            {getTranslation(language, 'attachment')}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Link2 className="h-4 w-4 mr-1" />
                            {getTranslation(language, 'link')}
                          </Button>
                        </div>
                        <Button 
                          onClick={handlePostSubmit} 
                          disabled={!postContent.trim() || submittingPost}
                        >
                          {submittingPost ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          {getTranslation(language, 'post')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {posts.length > 0 ? (
                    posts.map(post => (
                      <Card key={post.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={post.authorPhotoURL} alt={post.authorName} />
                                <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold">{post.authorName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDate(post.createdAt)}
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {(isAdmin || post.authorId === auth.currentUser?.uid) && (
                                  <>
                                    <DropdownMenuItem>
                                      <Edit className="h-4 w-4 mr-2" />
                                      {getTranslation(language, 'edit')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                      <Trash className="h-4 w-4 mr-2" />
                                      {getTranslation(language, 'delete')}
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <p className="whitespace-pre-wrap">{post.content}</p>
                          
                          {post.attachments && post.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {post.attachments.map((attachment, index) => (
                                <div 
                                  key={index} 
                                  className="p-2 border rounded flex items-center"
                                >
                                  <File className="h-5 w-5 mr-2 text-muted-foreground" />
                                  <a 
                                    href={attachment.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm hover:underline"
                                  >
                                    {attachment.name || 'Attachment'}
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="border-t py-3 flex justify-between text-muted-foreground">
                          <Button variant="ghost" size="sm">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {post.likes.length > 0 && post.likes.length}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {post.comments.length > 0 && post.comments.length}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        {getTranslation(language, 'noPosts')}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {getTranslation(language, 'noPostsDescription')}
                      </p>
                      <Button 
                        onClick={() => postInputRef.current?.focus()}
                      >
                        {getTranslation(language, 'createFirstPost')}
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="members" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>{getTranslation(language, 'members')}</CardTitle>
                      <CardDescription>
                        {getTranslation(language, 'totalMembers')}: {members.length}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {isAdmin && (
                          <Button variant="outline" className="w-full">
                            <UserPlus className="h-4 w-4 mr-2" />
                            {getTranslation(language, 'inviteMembers')}
                          </Button>
                        )}
                        
                        <ScrollArea className="h-[calc(100vh-300px)]">
                          <div className="space-y-4">
                            {members.map(member => (
                              <div key={member.userId} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Avatar>
                                    <AvatarImage src={member.photoURL} alt={member.displayName} />
                                    <AvatarFallback>{member.displayName.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{member.displayName}</div>
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      {member.role === 'admin' ? (
                                        <Badge variant="secondary" className="mr-2">
                                          {getTranslation(language, 'admin')}
                                        </Badge>
                                      ) : null}
                                      {getTranslation(language, 'joined')} {new Date(member.joinedAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                
                                {isAdmin && member.userId !== auth.currentUser?.uid && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <User className="h-4 w-4 mr-2" />
                                        {getTranslation(language, 'viewProfile')}
                                      </DropdownMenuItem>
                                      
                                      {member.role === 'admin' ? (
                                        <DropdownMenuItem>
                                          {getTranslation(language, 'removeAdmin')}
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem>
                                          {getTranslation(language, 'makeAdmin')}
                                        </DropdownMenuItem>
                                      )}
                                      
                                      <DropdownMenuItem className="text-destructive">
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        {getTranslation(language, 'removeFromGroup')}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="resources" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>{getTranslation(language, 'resources')}</CardTitle>
                          <CardDescription>
                            {getTranslation(language, 'totalResources')}: {resources.length}
                          </CardDescription>
                        </div>
                        
                        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                          <DialogTrigger asChild>
                            <Button>
                              <Upload className="h-4 w-4 mr-2" />
                              {getTranslation(language, 'upload')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{getTranslation(language, 'uploadResource')}</DialogTitle>
                              <DialogDescription>
                                {getTranslation(language, 'uploadResourceDescription')}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  {getTranslation(language, 'title')} *
                                </label>
                                <Input
                                  value={resourceTitle}
                                  onChange={(e) => setResourceTitle(e.target.value)}
                                  placeholder={getTranslation(language, 'resourceTitlePlaceholder')}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  {getTranslation(language, 'resourceType')}
                                </label>
                                <select
                                  value={resourceType}
                                  onChange={(e) => setResourceType(e.target.value as any)}
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <option value="pdf">PDF</option>
                                  <option value="document">Document</option>
                                  <option value="image">Image</option>
                                  <option value="video">Video</option>
                                  <option value="link">Link</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>
                              
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  {getTranslation(language, 'resourceUrl')} *
                                </label>
                                <Input
                                  value={resourceUrl}
                                  onChange={(e) => setResourceUrl(e.target.value)}
                                  placeholder={getTranslation(language, 'resourceUrlPlaceholder')}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  {getTranslation(language, 'description')}
                                </label>
                                <Textarea
                                  value={resourceDescription}
                                  onChange={(e) => setResourceDescription(e.target.value)}
                                  placeholder={getTranslation(language, 'resourceDescriptionPlaceholder')}
                                />
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setShowUploadDialog(false)}
                              >
                                {getTranslation(language, 'cancel')}
                              </Button>
                              <Button
                                onClick={handleResourceUpload}
                                disabled={uploadingResource}
                              >
                                {uploadingResource ? (
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Upload className="h-4 w-4 mr-2" />
                                )}
                                {getTranslation(language, 'upload')}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {resources.length > 0 ? (
                        <div className="space-y-4">
                          {resources.map(resource => (
                            <div 
                              key={resource.id} 
                              className="border rounded-lg p-4 flex justify-between items-center hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                {resource.type === 'pdf' && <FileText className="h-6 w-6 text-red-500" />}
                                {resource.type === 'document' && <FileText className="h-6 w-6 text-blue-500" />}
                                {resource.type === 'image' && <FileText className="h-6 w-6 text-green-500" />}
                                {resource.type === 'video' && <FileText className="h-6 w-6 text-purple-500" />}
                                {resource.type === 'link' && <Link2 className="h-6 w-6 text-yellow-500" />}
                                {resource.type === 'other' && <File className="h-6 w-6 text-gray-500" />}
                                
                                <div>
                                  <div className="font-semibold">
                                    <a 
                                      href={resource.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="hover:underline"
                                    >
                                      {resource.title}
                                    </a>
                                  </div>
                                  
                                  <div className="text-xs text-muted-foreground">
                                    {getTranslation(language, 'uploadedBy')}: {resource.uploaderName} - {formatDate(resource.createdAt)}
                                  </div>
                                  
                                  {resource.description && (
                                    <div className="text-sm mt-1">
                                      {resource.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <Button variant="ghost" size="icon" asChild>
                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            {getTranslation(language, 'noResources')}
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            {getTranslation(language, 'noResourcesDescription')}
                          </p>
                          <Button 
                            onClick={() => setShowUploadDialog(true)}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {getTranslation(language, 'uploadFirstResource')}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="w-full md:w-1/3 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>{getTranslation(language, 'aboutGroup')}</CardTitle>
                  <CardDescription>
                    {getTranslation(language, 'createdAt')} {new Date(group.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">{getTranslation(language, 'members')}</h4>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      {getTranslation(language, 'totalMembers')}: {members.length}
                    </div>
                  </div>
                  
                  {group.school && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">{getTranslation(language, 'school')}</h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <School className="h-4 w-4 mr-2" />
                        {group.school}
                      </div>
                    </div>
                  )}
                  
                  {group.subject && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">{getTranslation(language, 'subject')}</h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Book className="h-4 w-4 mr-2" />
                        {group.subject}
                      </div>
                    </div>
                  )}
                  
                  {group.grade && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">{getTranslation(language, 'grade')}</h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        {getTranslation(language, 'grade')} {group.grade}
                      </div>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">{getTranslation(language, 'admins')}</h4>
                    <div className="space-y-3">
                      {members
                        .filter(member => member.role === 'admin')
                        .map(admin => (
                          <div key={admin.userId} className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={admin.photoURL} alt={admin.displayName} />
                              <AvatarFallback>{admin.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{admin.displayName}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>{getTranslation(language, 'recentMembers')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {members
                      .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
                      .slice(0, 5)
                      .map(member => (
                        <div key={member.userId} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.photoURL} alt={member.displayName} />
                              <AvatarFallback>{member.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{member.displayName}</span>
                          </div>
                          {member.role === 'admin' && (
                            <Badge variant="outline" className="text-xs">
                              {getTranslation(language, 'admin')}
                            </Badge>
                          )}
                        </div>
                      ))}
                  </div>
                  
                  {members.length > 5 && (
                    <Button 
                      variant="link" 
                      className="mt-3 px-0"
                      onClick={() => setActiveTab('members')}
                    >
                      {getTranslation(language, 'viewAllMembers')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default GroupDetail;
