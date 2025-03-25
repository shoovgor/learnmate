
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ExternalLink } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { getTranslation } from "@/utils/translations";

interface Resource {
  title: string;
  url: string;
  description: string;
}

// Mock data for demonstration
const mockResults: Resource[] = [
  {
    title: "Khan Academy - Algebra Basics",
    url: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:foundation-algebra",
    description: "Learn the basics of algebra—focused on common mathematical relationships, such as linear relationships."
  },
  {
    title: "BBC Bitesize - Algebra",
    url: "https://www.bbc.co.uk/bitesize/topics/zghvkcw",
    description: "Learn and revise algebra with BBC Bitesize for students in England, Wales, and Northern Ireland."
  },
  {
    title: "Math is Fun - Algebra",
    url: "https://www.mathsisfun.com/algebra/index.html",
    description: "An interactive guide to algebra with simple explanations and lots of examples."
  },
  {
    title: "Purplemath - Algebra Lessons",
    url: "https://www.purplemath.com/modules/index.htm",
    description: "Practical algebra lessons with lots of examples and practice problems."
  }
];

interface BrowserCrawlerProps {
  topic?: string;
  language: string;
}

const BrowserCrawler: React.FC<BrowserCrawlerProps> = ({ topic = '', language = 'en' }) => {
  const [searchTerm, setSearchTerm] = useState(topic);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Resource[]>([]);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    
    // Simulate API call with a delay
    setTimeout(() => {
      setResults(mockResults);
      setIsSearching(false);
    }, 1500);
  };

  const handleAutomaticSearch = (failedTopic: string) => {
    setSearchTerm(failedTopic);
    toast({
      title: getTranslation(language, "alternativeResources"),
      description: `${getTranslation(language, "suggestedResources")} ${failedTopic}`,
    });
    setIsSearching(true);
    
    // Simulate API call with a delay
    setTimeout(() => {
      setResults(mockResults);
      setIsSearching(false);
    }, 1500);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={getTranslation(language, "searchPlaceholder")}
          className="flex-1"
        />
        <Button type="submit" disabled={isSearching}>
          {isSearching ? getTranslation(language, "loading") : <Search className="h-4 w-4" />}
        </Button>
      </form>

      {isSearching ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {results.length > 0 ? (
            results.map((result, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-md transition-all duration-300 animate-fade-in">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-start justify-between">
                    <span className="line-clamp-1">{result.title}</span>
                    <a 
                      href={result.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 ml-2 flex-shrink-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{result.description}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            searchTerm && !isSearching && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{getTranslation(language, "noResultsFound")}</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default BrowserCrawler;
