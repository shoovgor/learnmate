
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Camera, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getTranslation } from "@/utils/translations";
import { uploadProfilePicture } from "@/services/fileService";

interface ProfilePictureUploadProps {
  photoURL?: string;
  displayName?: string;
  onPhotoUpdated: (photoURL: string) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  photoURL,
  displayName = '',
  onPhotoUpdated
}) => {
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const language = localStorage.getItem('language') || 'mn';
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    try {
      setUploading(true);
      const url = await uploadProfilePicture(file);
      onPhotoUpdated(url);
      
      toast({
        title: getTranslation(language, 'success'),
        description: getTranslation(language, 'profilePictureUpdated'),
      });
      
      setOpen(false);
      setFile(null);
      setPreview(null);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: getTranslation(language, 'error'),
        description: getTranslation(language, 'errorUploadingProfilePicture'),
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="relative group cursor-pointer">
          <Avatar className="h-24 w-24 border-4 border-background">
            <AvatarImage src={photoURL} />
            <AvatarFallback className="text-xl">{displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTranslation(language, 'updateProfilePicture')}</DialogTitle>
          <DialogDescription>
            {getTranslation(language, 'chooseNewProfilePicture')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex justify-center">
            <Avatar className="h-32 w-32">
              <AvatarImage src={preview || photoURL} />
              <AvatarFallback className="text-2xl">{displayName.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="picture">{getTranslation(language, 'picture')}</Label>
            <Input 
              id="picture" 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {getTranslation(language, 'cancel')}
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file || uploading}
          >
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {getTranslation(language, 'upload')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePictureUpload;
