import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTranslation } from '@/utils/translations';
import MainNavigation from '@/components/MainNavigation';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from '@/config/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  arrayUnion, 
  addDoc, 
  serverTimestamp,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { Group } from '@/models/group';
import { 
  Users, 
  School, 
  Search, 
  Plus, 
  UserPlus, 
  BookOpen, 
  Clock, 
  Globe, 
  Lock, 
  Loader2 
} from 'lucide-react';

const getUserGroups = async (userId: string): Promise<Group[]> => {
  try {
    const userGroupsQuery = query(
      collection(db, 'groups'),
      where('members', 'array-contains', userId)
    );
    
    const querySnapshot = await getDocs(userGroupsQuery);
    const groups: Group[] = [];
    
    querySnapshot.forEach((doc) => {
      const groupData = doc.data();
      groups.push({
        id: doc.id,
        name: groupData.name,
        description: groupData.description,
        schoolId: groupData.schoolId,
        school: groupData.school,
        subject: groupData.subject,
        grade: groupData.grade,
        teacherId: groupData.teacherId,
        teacherName: groupData.teacherName,
        createdAt: groupData.createdAt.toDate(),
        updatedAt: groupData.updatedAt?.toDate(),
        members: groupData.members || [],
        admins: groupData.admins || [],
        isPublic: groupData.isPublic,
        photoURL: groupData.photoURL,
      });
    });
    
    return groups;
  } catch (error) {
    console.error('Error fetching user groups:', error);
    throw error;
  }
};

const searchGroups = async (searchTerm: string): Promise<Group[]> => {
  try {
    const groupsQuery = query(collection(db, 'groups'));
    const querySnapshot = await getDocs(groupsQuery);
    const groups: Group[] = [];
    
    querySnapshot.forEach((doc) => {
      const groupData = doc.data();
      const name = groupData.name.toLowerCase();
      const description = groupData.description?.toLowerCase() || '';
      const searchLower = searchTerm.toLowerCase();
      
      if (name.includes(searchLower) || description.includes(searchLower)) {
        groups.push({
          id: doc.id,
          name: groupData.name,
          description: groupData.description,
          schoolId: groupData.schoolId,
          school: groupData.school,
          subject: groupData.subject,
          grade: groupData.grade,
          teacherId: groupData.teacherId,
          teacherName: groupData.teacherName,
          createdAt: groupData.createdAt.toDate(),
          updatedAt: groupData.updatedAt?.toDate(),
          members: groupData.members || [],
          admins: groupData.admins || [],
          isPublic: groupData.isPublic,
          photoURL: groupData.photoURL,
        });
      }
    });
    
    return groups;
  } catch (error) {
    console.error('Error searching groups:', error);
    throw error;
  }
};

const joinGroup = async (groupId: string): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      members: arrayUnion(userId)
    });
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
};

const ProfileGroups = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [suggestedGroups, setSuggestedGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('my-groups');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'mn');
  
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  const [schoolSearchQuery, setSchoolSearchQuery] = useState("");
  const [searchSchool, setSearchSchool] = useState('');
  const [searchSubject, setSearchSubject] = useState('');
  const [searchGrade, setSearchGrade] = useState('');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
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
        
        const groups = await getUserGroups(currentUser.uid);
        setMyGroups(groups);
        
        const userRef = await db.collection('users').doc(currentUser.uid).get();
        const userData = userRef.data();
        
        if (userData && userData.schoolId) {
          const suggested = await searchGroups({
            school: userData.schoolId,
            grade: userData.grade,
            limit: 6
          });
          
          const filteredSuggestions = suggested.filter(
            group => !groups.some(myGroup => myGroup.id === group.id)
          );
          
          setSuggestedGroups(filteredSuggestions);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
        toast({
          title: getTranslation(language, 'error'),
          description: getTranslation(language, 'errorFetchingGroups'),
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserGroups();
  }, [language, navigate, toast]);
  
  const handleSearch = async () => {
    try {
      setSearchLoading(true);
      const results = await searchGroups({
        query: searchQuery,
        school: searchSchool,
        subject: searchSubject,
        grade: searchGrade
      });
      
      const filteredResults = results.filter(
        group => !myGroups.some(myGroup => myGroup.id === group.id)
      );
      
      setSuggestedGroups(filteredResults);
      setSelectedTab('suggestions');
    } catch (error) {
      console.error('Error searching groups:', error);
      toast({
        title: getTranslation(language, 'error'),
        description: getTranslation(language, 'errorSearchingGroups'),
        variant: 'destructive'
      });
    } finally {
      setSearchLoading(false);
    }
  };
  
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: getTranslation(language, 'validationError'),
        description: getTranslation(language, 'groupNameRequired'),
        variant: 'destructive'
      });
      return;
    }
    
    if (!selectedSchool) {
      toast({
        title: getTranslation(language, 'validationError'),
        description: getTranslation(language, 'schoolRequired'),
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setCreating(true);
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
      
      const newGroup = await createGroup({
        name: groupName,
        description: groupDescription,
        schoolId: selectedSchool,
        school: schools.find(school => school.id === selectedSchool)?.name,
        subject: selectedSubject,
        grade: selectedGrade,
        isPublic
      }, currentUser.uid);
      
      setMyGroups([...myGroups, newGroup]);
      setShowCreateDialog(false);
      
      setGroupName('');
      setGroupDescription('');
      setSelectedSchool('');
      setSelectedSubject('');
      setSelectedGrade('');
      setIsPublic(true);
      
      toast({
        title: getTranslation(language, 'success'),
        description: getTranslation(language, 'groupCreated'),
      });
      
      navigate(`/groups/${newGroup.id}`);
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: getTranslation(language, 'error'),
        description: getTranslation(language, 'errorCreatingGroup'),
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
  };
  
  const handleJoinGroup = async (group: Group) => {
    try {
      setJoining(group.id);
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        toast({
          title: getTranslation(language, 'error'),
          description: getTranslation(language, 'loginRequired'),
          variant: 'destructive'
        });
        navigate('/auth');
        return;
      }
      
      await joinGroup(group.id);
      
      const joinedGroup = suggestedGroups.find(group => group.id === group.id);
      
      if (joinedGroup) {
        setMyGroups([...myGroups, joinedGroup]);
        setSuggestedGroups(suggestedGroups.filter(group => group.id !== group.id));
      }
      
      toast({
        title: getTranslation(language, 'success'),
        description: getTranslation(language, 'joinedGroup'),
      });
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: getTranslation(language, 'error'),
        description: getTranslation(language, 'errorJoiningGroup'),
        variant: 'destructive'
      });
    } finally {
      setJoining(null);
    }
  };
  
  const handleEnterGroup = (groupId: string) => {
    navigate(`/groups/${groupId}`);
  };
  
  const schools = [
    { id: "num", name: "Монгол Улсын Их Сургууль" },
    { id: "must", name: "Шинжлэх Ухаан Технологийн Их Сургууль" },
    { id: "sns1", name: "1-р Сургууль" },
    { id: "sns2", name: "2-р Сургууль" },
    { id: "sns3", name: "3-р Сургууль" },
    { id: "sns4", name: "4-р Сургууль" },
    { id: "sns5", name: "5-р Сургууль" },
    { id: "sns6", name: "6-р Сургууль" },
    { id: "sns8", name: "8-р Сургууль" }
  ];
  
  const subjects = [
    { value: "math", label: getTranslation(language, 'mathematics') },
    { value: "science", label: getTranslation(language, 'science') },
    { value: "english", label: getTranslation(language, 'english') },
    { value: "history", label: getTranslation(language, 'history') },
    { value: "geography", label: getTranslation(language, 'geography') },
    { value: "physics", label: getTranslation(language, 'physics') },
    { value: "chemistry", label: getTranslation(language, 'chemistry') },
    { value: "biology", label: getTranslation(language, 'biology') },
    { value: "literature", label: getTranslation(language, 'literature') }
  ];
  
  const grades = [
    { value: "6", label: language === 'mn' ? '6-р анги' : 'Grade 6' },
    { value: "7", label: language === 'mn' ? '7-р анги' : 'Grade 7' },
    { value: "8", label: language === 'mn' ? '8-р анги' : 'Grade 8' },
    { value: "9", label: language === 'mn' ? '9-р анги' : 'Grade 9' },
    { value: "10", label: language === 'mn' ? '10-р анги' : 'Grade 10' },
    { value: "11", label: language === 'mn' ? '11-р анги' : 'Grade 11' },
    { value: "12", label: language === 'mn' ? '12-р анги' : 'Grade 12' }
  ];
  
  const [filteredSchools, setFilteredSchools] = useState(schools);
  
  const renderGroupCard = (group: Group, isMember: boolean) => (
    <Card key={group.id} className="group transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{group.name}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <School className="h-4 w-4 mr-2" />
          {group.school || getTranslation(language, 'unknownSchool')}
        </div>
        {group.subject && (
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <Book className="h-4 w-4 mr-2" />
            {group.subject}
          </div>
        )}
        {group.grade && (
          <Badge variant="outline" className="mr-2">
            {getTranslation(language, 'grade')} {group.grade}
          </Badge>
        )}
        <Badge variant={group.isPublic ? "secondary" : "outline"}>
          {group.isPublic ? getTranslation(language, 'public') : getTranslation(language, 'private')}
        </Badge>
        <div className="flex items-center text-sm text-muted-foreground mt-2">
          <Users className="h-4 w-4 mr-2" />
          {group.members.length} {getTranslation(language, 'members')}
        </div>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {group.description || getTranslation(language, 'noDescription')}
        </p>
      </CardContent>
      <CardFooter className="border-t pt-3 flex justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarClock className="h-3 w-3 mr-1" />
          {getTranslation(language, 'created')} {new Date(group.createdAt).toLocaleDateString()}
        </div>
        {isMember ? (
          <Button 
            size="sm" 
            variant="default" 
            onClick={() => handleEnterGroup(group.id)}
          >
            {getTranslation(language, 'enter')}
          </Button>
        ) : (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleJoinGroup(group)}
            disabled={joining === group.id}
          >
            {joining === group.id ? (
              <>
                <Users className="h-4 w-4 mr-2 animate-spin" />
                {getTranslation(language, 'joining')}
              </>
            ) : (
              <>
                <Users className="h-4 w-4 mr-2" />
                {getTranslation(language, 'join')}
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
  
  return (
    <>
      <MainNavigation />
      <div className="min-h-screen pt-16 bg-background">
        <main className="container mx-auto py-8 px-4">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <h1 className="text-3xl font-bold mb-4 md:mb-0">
              {getTranslation(language, 'studyGroups')}
            </h1>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Input
                  placeholder={getTranslation(language, 'searchGroups')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button 
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full"
                  onClick={handleSearch}
                  disabled={searchLoading}
                >
                  {searchLoading ? (
                    <Search className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="whitespace-nowrap">
                    <Plus className="h-4 w-4 mr-2" />
                    {getTranslation(language, 'createGroup')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>{getTranslation(language, 'createNewGroup')}</DialogTitle>
                    <DialogDescription>
                      {getTranslation(language, 'createGroupDescription')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="group-name">{getTranslation(language, 'groupName')}</Label>
                      <Input 
                        id="group-name" 
                        placeholder={getTranslation(language, 'groupNamePlaceholder')}
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="group-school">{getTranslation(language, 'school')}</Label>
                      <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                        <SelectTrigger className="w-full">
                          <div className="flex items-center">
                            <School className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder={getTranslation(language, 'selectSchool')} />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          <div className="sticky top-0 z-10 bg-background p-2 border-b">
                            <div className="flex items-center border rounded-md px-3 py-2">
                              <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                              <Input
                                placeholder={getTranslation(language, 'searchSchool')}
                                className="border-0 focus-visible:ring-0"
                                value={schoolSearchQuery}
                                onChange={(e) => {
                                  const query = e.target.value.toLowerCase();
                                  setSchoolSearchQuery(query);
                                  setFilteredSchools(
                                    schools.filter(school =>
                                      school.name.toLowerCase().includes(query)
                                    )
                                  );
                                }}
                              />
                            </div>
                          </div>
                          <ScrollArea className="h-72">
                            {filteredSchools.map((school) => (
                              <SelectItem key={school.id} value={school.id}>
                                {school.name}
                              </SelectItem>
                            ))}
                            {filteredSchools.length === 0 && (
                              <div className="py-2 px-2 text-sm text-muted-foreground text-center">
                                {getTranslation(language, 'noSchoolsFound')}
                              </div>
                            )}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="group-subject">{getTranslation(language, 'subject')}</Label>
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={getTranslation(language, 'selectSubject')} />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.value} value={subject.value}>
                              {subject.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="group-grade">{getTranslation(language, 'grade')}</Label>
                      <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={getTranslation(language, 'selectGrade')} />
                        </SelectTrigger>
                        <SelectContent>
                          {grades.map((grade) => (
                            <SelectItem key={grade.value} value={grade.value}>
                              {grade.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="group-description">{getTranslation(language, 'description')}</Label>
                      <Textarea 
                        id="group-description" 
                        placeholder={getTranslation(language, 'groupDescriptionPlaceholder')}
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="group-public" 
                        checked={isPublic}
                        onCheckedChange={setIsPublic}
                      />
                      <Label htmlFor="group-public">{getTranslation(language, 'publicGroup')}</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isPublic 
                        ? getTranslation(language, 'publicGroupDescription')
                        : getTranslation(language, 'privateGroupDescription')
                      }
                    </p>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateDialog(false)}
                    >
                      {getTranslation(language, 'cancel')}
                    </Button>
                    <Button 
                      onClick={handleCreateGroup}
                      disabled={creating}
                    >
                      {creating ? (
                        <>
                          <Users className="h-4 w-4 mr-2 animate-spin" />
                          {getTranslation(language, 'creating')}
                        </>
                      ) : (
                        getTranslation(language, 'createGroup')
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={searchSchool} onValueChange={setSearchSchool}>
              <SelectTrigger>
                <SelectValue placeholder={getTranslation(language, 'selectSchool')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{getTranslation(language, 'allSchools')}</SelectItem>
                {schools.map(school => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={searchSubject} onValueChange={setSearchSubject}>
              <SelectTrigger>
                <SelectValue placeholder={getTranslation(language, 'selectSubject')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{getTranslation(language, 'allSubjects')}</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject.value} value={subject.value}>
                    {subject.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={searchGrade} onValueChange={setSearchGrade}>
              <SelectTrigger>
                <SelectValue placeholder={getTranslation(language, 'selectGrade')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{getTranslation(language, 'allGrades')}</SelectItem>
                {grades.map(grade => (
                  <SelectItem key={grade.value} value={grade.value}>
                    {grade.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Tabs 
            defaultValue="my-groups" 
            value={selectedTab}
            onValueChange={setSelectedTab} 
            className="w-full"
          >
            <TabsList className="mb-6">
              <TabsTrigger value="my-groups">{getTranslation(language, 'myGroups')}</TabsTrigger>
              <TabsTrigger value="suggestions">{getTranslation(language, 'suggestedGroups')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-groups">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array(3).fill(0).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <Skeleton className="h-6 w-3/4" />
                      </CardHeader>
                      <CardContent className="pb-2 space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                      <CardFooter className="border-t pt-3 flex justify-between">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-8 w-20" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : myGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myGroups.map(group => renderGroupCard(group, true))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {getTranslation(language, 'noGroups')}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {getTranslation(language, 'noGroupsDescription')}
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {getTranslation(language, 'createGroup')}
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="suggestions">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array(3).fill(0).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <Skeleton className="h-6 w-3/4" />
                      </CardHeader>
                      <CardContent className="pb-2 space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                      <CardFooter className="border-t pt-3 flex justify-between">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-8 w-20" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : suggestedGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestedGroups.map(group => renderGroupCard(group, false))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {getTranslation(language, 'noGroupsFound')}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {getTranslation(language, 'tryAdjustingSearch')}
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {getTranslation(language, 'createGroup')}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default ProfileGroups;
